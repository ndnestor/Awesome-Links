#!/bin/bash

# Variable declarations
RELEASE_BRANCH="master"
TS_BUILD_PATH="./typescript-build/" # Requires trailing slash
ENTRY_FILE="main.js"

if [ "$1" != "init" ]
then
  # Checkout the release branch
  #! If git fails to checkout the release branch, the master branch will be used by default
  echo "Performing git checkout on the release branch"
  git checkout $RELEASE_BRANCH

  # Update the repo
  echo -e "===\nPulling changes from git repository"
  git pull
fi

# Install node modules as needed
echo -e "===\nInstalling npm packages as needed"
npm install
npm install -g typescript

# Create the required file paths
echo -e "===\nMaking necessary directories"
mkdir logs
mkdir public
mkdir $TS_BUILD_PATH

# Build typescript files
if [ "$1" == "init" ]
then
  exit 0
fi
echo -e "===\nBuilding typescript files"
tsc

# Run the server code
echo -e "===\nStarting server"
node -r source-map-support/register $TS_BUILD_PATH$ENTRY_FILE

# Print a message when server execution has ended
echo -e "===\nProgram execution has ended"
