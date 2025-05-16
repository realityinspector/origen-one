#!/bin/bash

# Script to prepare the application for deployment

echo "Preparing application for deployment..."

# Make sure TS_NODE_TRANSPILE_ONLY is set
if ! grep -q "TS_NODE_TRANSPILE_ONLY=true" .env 2>/dev/null; then
  echo 'TS_NODE_TRANSPILE_ONLY=true' >> .env
  echo "Added TS_NODE_TRANSPILE_ONLY=true to .env file"
fi

# Run the fix-deployment-issues.js script
echo "Running deployment fixes..."
node scripts/fix-deployment-issues.js

# Copy our special deployment tsconfig
echo "Setting up TypeScript configuration for deployment..."
cp tsconfig.deploy.json tsconfig.json
echo "TypeScript configuration updated for deployment"

# Build the client application
echo "Building client application..."
cd client && NODE_ENV=production npm run build && cd ..
echo "Client build complete"

# Make script executable
chmod +x scripts/deploy.sh

echo "Deployment preparation complete!"
echo "Your application is now ready to be deployed."
echo "Use the Replit Deploy button to proceed."