#!/bin/bash

# Setup script for GS Motors project

echo "Setting up GS Motors project..."

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
cd ..

echo "Setup complete!"
echo "To run the project:"
echo "1. Start MongoDB (either locally or via Docker)"
echo "2. Run 'npm start' in the server directory"
echo "3. Run 'npm run dev' in the client directory"