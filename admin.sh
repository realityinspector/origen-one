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
  
  # Execute the password reset script
  npx ts-node -r dotenv/config scripts/reset-password.ts "$USERNAME" "$NEW_PASSWORD"
  
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