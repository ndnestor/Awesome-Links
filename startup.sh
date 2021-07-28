#!/bin/bash

# Variable declarations
RELEASE_BRANCH="master"
ENTRY_PATH="./typescript-build/main.js"

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

# Run the server code
echo -e "===\nStarting server"
sudo node -r source-map-support/register $ENTRY_PATH
