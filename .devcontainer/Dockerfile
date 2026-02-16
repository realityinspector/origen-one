# Claude Code Sandbox Container for SUNSCHOOL
# Provides Claude Code, Node.js 20, TypeScript, Playwright, and Vite
# in a sandboxed environment with iptables firewall.

FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

# ── System packages ──────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Node.js prerequisites
    curl gnupg ca-certificates \
    # Basics
    git jq openssh-client sudo \
    # Firewall
    iptables ipset iproute2 dnsutils \
    # Build tools (for native npm packages like bcrypt, pg-native)
    gcc g++ make python3 \
    # PostgreSQL client (for db debugging)
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# ── Node.js 20 ──────────────────────────────────────────────────────
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# ── Claude Code ────────────────────────────────────────────────────
RUN npm install -g @anthropic-ai/claude-code

# ── Global Node tools ──────────────────────────────────────────────
RUN npm install -g typescript ts-node vite drizzle-kit

# ── Playwright + Chromium (for e2e testing) ────────────────────────
RUN npx playwright install --with-deps chromium

# ── Create non-root user ──────────────────────────────────────────
RUN useradd --create-home --shell /bin/bash claude && \
    echo "claude ALL=(root) NOPASSWD: /usr/local/bin/init-firewall.sh" >> /etc/sudoers.d/claude

# ── Copy firewall script ──────────────────────────────────────────
COPY init-firewall.sh /usr/local/bin/init-firewall.sh
RUN chmod +x /usr/local/bin/init-firewall.sh

USER claude
WORKDIR /workspace

CMD ["bash"]
