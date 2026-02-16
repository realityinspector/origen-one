#!/usr/bin/env bash
# host-request.sh — Container-side client for host-bridge IPC
# Used INSIDE the container to request commands on the host.
# Usage: .claude/host-request.sh <command>
# Example: .claude/host-request.sh git push origin main
# Example: .claude/host-request.sh curl https://sunschool.xyz/api/healthcheck
set -euo pipefail

BRIDGE_DIR="$(cd "$(dirname "$0")" && pwd)"
REQUEST_DIR="$BRIDGE_DIR/host-request"
RESULT_DIR="$BRIDGE_DIR/host-result"
TIMEOUT="${HOST_REQUEST_TIMEOUT:-60}"

mkdir -p "$REQUEST_DIR" "$RESULT_DIR"

if [[ $# -eq 0 ]]; then
    echo "Usage: host-request.sh <command>"
    echo "Runs any command on the host via the bridge daemon."
    echo ""
    echo "Examples:"
    echo "  host-request.sh git push origin main"
    echo "  host-request.sh git status"
    echo "  host-request.sh curl https://sunschool.xyz/api/healthcheck"
    exit 1
fi

# Generate unique request ID
req_id="$(date +%s%N)_$$"
req_file="$REQUEST_DIR/${req_id}.req"
result_file="$RESULT_DIR/${req_id}.result"

# Write request
echo "$*" > "$req_file"

# Wait for result (poll every 0.5s)
elapsed=0
while [[ ! -f "$result_file" ]] && (( elapsed < TIMEOUT * 2 )); do
    sleep 0.5
    elapsed=$((elapsed + 1))
done

if [[ -f "$result_file" ]]; then
    cat "$result_file"
    rm -f "$result_file"
else
    echo "ERROR: Timed out waiting for host response (${TIMEOUT}s)"
    echo "Is host-bridge.sh running on the host?"
    echo "Start it with: ./claude-container.sh bridge"
    rm -f "$req_file"
    exit 1
fi
