#!/bin/bash

# Password reset utility for the application
# Usage: ./admin.sh reset-password <username> <new_password>

set -e

# Check if correct number of arguments
if [ "$1" != "reset-password" ] || [ -z "$2" ] || [ -z "$3" ]; then
  echo "Usage: ./admin.sh reset-password <username> <new_password>"
  exit 1
fi

# Store arguments
ACTION="$1"
USERNAME="$2"
NEW_PASSWORD="$3"

# Reset password for specific user
if [ "$ACTION" = "reset-password" ]; then
  echo "Resetting password for user: $USERNAME"
  
  # Escape potential special characters in the password
  # Create a temporary JSON file to properly handle special characters 
  TEMP_FILE=$(mktemp)
  echo "{\"username\":\"$USERNAME\",\"password\":\"$NEW_PASSWORD\"}" > "$TEMP_FILE"
  
  # Execute the password reset script with proper escaping
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$TEMP_FILE', 'utf8'));
    require('child_process').execSync(
      'npx ts-node -r dotenv/config scripts/reset-password.ts \"' + data.username + '\" \"' + data.password + '\"',
      {stdio: 'inherit'}
    );
  "
  
  # Remove the temporary file
  rm "$TEMP_FILE"
  
  if [ $? -eq 0 ]; then
    echo "Password reset successful for $USERNAME"
  else
    echo "Password reset failed"
    exit 1
  fi
else
  echo "Unknown action: $ACTION"
  echo "Usage: ./admin.sh reset-password <username> <new_password>"
  exit 1
fi