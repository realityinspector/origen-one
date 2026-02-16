#!/usr/bin/env bash
# host-bridge.sh — Host-side daemon that polls for container requests
# Run on the HOST (not inside the container).
# Usage: .claude/host-bridge.sh [poll-interval-seconds]
#    or: ./claude-container.sh bridge
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REQUEST_DIR="$SCRIPT_DIR/host-request"
RESULT_DIR="$SCRIPT_DIR/host-result"
POLL_INTERVAL="${1:-1}"

mkdir -p "$REQUEST_DIR" "$RESULT_DIR"

# Add common tool paths (homebrew, etc.) without sourcing zshrc in bash
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:$PATH"

echo "[host-bridge] Project: $PROJECT_DIR"
echo "[host-bridge] Watching $REQUEST_DIR (poll every ${POLL_INTERVAL}s)..."

process_request() {
    local req_file="$1"
    local req_id
    local command
    local result_file

    req_id=$(basename "$req_file" .req)
    command=$(cat "$req_file")
    result_file="$RESULT_DIR/${req_id}.result"

    echo "[host-bridge] Executing: $command"

    # Write to temp file first, then atomically move to result path
    # (prevents request script from reading a partially-written file)
    local tmp_file="${result_file}.tmp"
    (cd "$PROJECT_DIR" && eval "$command") > "$tmp_file" 2>&1
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        echo "EXIT_CODE=$exit_code" >> "$tmp_file"
    fi
    mv "$tmp_file" "$result_file"

    # Clean up request
    rm -f "$req_file"
    echo "[host-bridge] Done (exit=$exit_code): $result_file"
}

while true; do
    for req_file in "$REQUEST_DIR"/*.req; do
        [[ -f "$req_file" ]] || continue
        process_request "$req_file"
    done
    sleep "$POLL_INTERVAL"
done
