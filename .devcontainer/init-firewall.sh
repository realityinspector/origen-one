#!/usr/bin/env bash
# init-firewall.sh — Default-deny iptables firewall for Claude Code sandbox
# Run as: sudo /usr/local/bin/init-firewall.sh
set -euo pipefail

echo "[firewall] Configuring iptables (default-deny egress)..."

# Flush existing rules
iptables -F OUTPUT
iptables -F INPUT

# Default policies
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT DROP

# Allow loopback
iptables -A INPUT  -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow established/related connections
iptables -A INPUT  -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Allow DNS (needed to resolve allowed domains)
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT

# ── Allowed domains ─────────────────────────────────────────────────
# Create ipset for allowed IPs
ipset create allowed_hosts hash:ip -exist

resolve_and_allow() {
    local domain="$1"
    local ips
    ips=$(dig +short "$domain" A 2>/dev/null | grep -E '^[0-9]+\.' || true)
    for ip in $ips; do
        ipset add allowed_hosts "$ip" -exist
    done
    echo "[firewall]   + $domain -> ${ips//$'\n'/ }"
}

echo "[firewall] Resolving allowed domains..."

# ── Claude API ──────────────────────────────────────────────────────
resolve_and_allow "api.anthropic.com"
resolve_and_allow "statsig.anthropic.com"

# ── npm registry ────────────────────────────────────────────────────
resolve_and_allow "registry.npmjs.org"

# ── GitHub (fetch meta IPs for git operations) ──────────────────────
GITHUB_IPS=$(curl -sf https://api.github.com/meta 2>/dev/null | jq -r '.git[],.web[],.api[]' 2>/dev/null | grep -E '^[0-9]+\.' | sort -u || true)
for ip in $GITHUB_IPS; do
    ipset add allowed_hosts "$ip" -exist 2>/dev/null || true
done
echo "[firewall]   + github.com ($(echo "$GITHUB_IPS" | wc -l | tr -d ' ') CIDRs)"

# ── Replit SSH (where the app actually runs) ────────────────────────
if [[ -n "${REPLIT_SSH_HOST:-}" ]]; then
    resolve_and_allow "$REPLIT_SSH_HOST"
fi
# Wildcard Replit domains the SSH host may resolve through
resolve_and_allow "spock.replit.dev"
resolve_and_allow "replit.dev"
resolve_and_allow "replit.com"

# ── Neon serverless PostgreSQL ──────────────────────────────────────
resolve_and_allow "neon.tech"
resolve_and_allow "console.neon.tech"
# Resolve actual Neon DB host from DATABASE_URL if available
if [[ -n "${DATABASE_URL:-}" ]]; then
    DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|' || true)
    if [[ -n "$DB_HOST" ]]; then
        resolve_and_allow "$DB_HOST"
    fi
fi
# Resolve from PGHOST if available
if [[ -n "${PGHOST:-}" ]]; then
    resolve_and_allow "$PGHOST"
fi

# ── LLM Providers ──────────────────────────────────────────────────
resolve_and_allow "openrouter.ai"
resolve_and_allow "api.openrouter.ai"
resolve_and_allow "api.perplexity.ai"
resolve_and_allow "archive.opentensor.ai"

# ── Stability AI (image generation) ────────────────────────────────
resolve_and_allow "api.stability.ai"

# ── Sunschool production ────────────────────────────────────────────
resolve_and_allow "sunschool.xyz"

# ── Allow extra domains from env var ────────────────────────────────
if [[ -n "${EXTRA_ALLOWED_DOMAINS:-}" ]]; then
    echo "[firewall] Resolving extra allowed domains..."
    IFS=',' read -ra EXTRA <<< "$EXTRA_ALLOWED_DOMAINS"
    for domain in "${EXTRA[@]}"; do
        domain=$(echo "$domain" | xargs)  # trim whitespace
        [[ -n "$domain" ]] && resolve_and_allow "$domain"
    done
fi

# Apply ipset to iptables
iptables -A OUTPUT -m set --match-set allowed_hosts dst -j ACCEPT

# Allow Docker bridge network (host communication for bridge IPC)
DOCKER_BRIDGE=$(ip route | grep -oP '172\.\d+\.\d+\.\d+/\d+' | head -1 || echo "172.17.0.0/16")
iptables -A OUTPUT -d "$DOCKER_BRIDGE" -j ACCEPT
iptables -A INPUT  -s "$DOCKER_BRIDGE" -j ACCEPT
echo "[firewall]   + Docker bridge: $DOCKER_BRIDGE"

echo "[firewall] Firewall configured. Default-deny with $(ipset list allowed_hosts | grep -c '^[0-9]' || echo 0) allowed IPs."
