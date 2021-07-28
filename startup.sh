#!/bin/bash

# Variable declarations
RELEASE_BRANCH="master"
TS_BUILD_PATH="./typescript-build/" # Requires trailing slash
ENTRY_FILE="main.js"

# Checkout the release branch
#! If git fails to checkout the release branch, the master branch will be by default
echo "Performing git checkout on the release branch"
sudo git checkout $RELEASE_BRANCH

# Update the repo
echo -e "===\nPulling changes from git repository"
sudo git pull

# Install node modules as needed
echo -e "===\nInstalling npm packages as needed"
sudo npm install

# Create the required file paths
echo -e "===\nMaking necessary directories"
sudo mkdir logs
sudo mkdir public
sudo mkdir $TS_BUILD_PATH

# Build typescript files
ech -e "===\nBuilding typescript files"
sudo tsc

# Run the server code
echo -e "===\nStarting server"
sudo node -r source-map-support/register $ENTRY_FILE

# Print a message when server execution has ended
echo -e "===\nProgram execution has ended"
