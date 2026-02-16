#!/usr/bin/env bash
# protect-files.sh — Pre-edit/write hook to protect sensitive files
# Exit 1 = block, Exit 0 = allow
FILE="$1"

# Block editing environment/secret files
[[ "$FILE" =~ \.env$ ]] && exit 1
[[ "$FILE" =~ \.env\. ]] && exit 1
[[ "$FILE" =~ \.env\.claude$ ]] && exit 1

# Block editing SSH keys
[[ "$FILE" =~ \.ssh/ ]] && exit 1

# Block editing git config
[[ "$FILE" =~ \.git/config ]] && exit 1

# Block editing credentials/keys
[[ "$FILE" =~ \.pem$ ]] && exit 1
[[ "$FILE" =~ \.key$ ]] && exit 1
[[ "$FILE" =~ admin-credentials\.txt ]] && exit 1

# Block editing container infrastructure
[[ "$FILE" =~ claude-container\.sh$ ]] && exit 1
[[ "$FILE" =~ init-firewall\.sh$ ]] && exit 1
[[ "$FILE" =~ host-bridge\.sh$ ]] && exit 1
[[ "$FILE" =~ host-request\.sh$ ]] && exit 1

exit 0
