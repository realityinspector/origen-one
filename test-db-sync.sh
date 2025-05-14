#!/bin/bash

# Check for test.env file
if [ ! -f "./test.env" ]; then
  echo "Error: test.env file not found"
  echo "Please create a test.env file with the following variables:"
  echo "  EXTERNAL_DB_URL - URL for the external PostgreSQL database"
  echo "  JWT_SECRET - Secret for JWT token generation"
  echo "  SESSION_SECRET - Secret for session management"
  echo "  DATABASE_URL - URL for the main database (if not set in environment)"
  exit 1
fi

# Load environment variables from test.env
export $(grep -v '^#' test.env | xargs)

echo "==================================================="
echo "Database Synchronization Test"
echo "==================================================="
echo

# Run the test
echo "Running the test script..."
npx ts-node scripts/test-db-sync.ts

# Get the exit code
exit_code=$?

echo
echo "==================================================="
if [ $exit_code -eq 0 ]; then
  echo "Test completed successfully!"
else
  echo "Test failed with exit code: $exit_code"
fi
echo "==================================================="

# Clean up
unset $(grep -v '^#' test.env | sed -E 's/(.*)=.*/\1/' | xargs)

exit $exit_code