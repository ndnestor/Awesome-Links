# Awesome-Links

## Table of Contents

---
- [Quick Start](#quick-start)
- [Style Guide](#style-guide)
- [Github Process](#github-process)
- [File Structure](#file-structure)
- [Frameworks / Libraries](#frameworks--libraries)
- [Managing the Server](#managing-the-server)
- [Useful IDE Extensions](#useful-ide-extensions)

## Quick Start

---
### For Windows
1. Download [Node.js](https://nodejs.org/).
2. Download [Git for Windows](https://git-scm.com/download/win).
3. Open Git Bash (which can find by searching for it in Cortana).
4. Navigate to where you want to clone the repo using the `cd` command.
5. Type the following commands:
```shell
git clone https://github.com/ndnestor/Awesome-Links.git
cd Awesome-Links
startup.sh init
```
   
### For Linux
1. Run the following commands or your package manager's equivalent:
```shell
sudo pacman -S git
sudo pacman -S nodejs npm
```
2. Navigate to where you want to clone the repo using the `cd` command.
3. Run the following commands:
```shell
git clone https://github.com/ndnestor/Awesome-Links.git
cd Awesome-Links
startup.sh init
```

## Style Guide

---
### Files
All files and folders are named with lowercase alphanumerics and use dashes instead of spaces.

### Code
This is the coding style that has been used throughout (nearly) the entire project. You can make up or break rules wherever it seems warranted
```typescript
//! This is an important comment
//? This is a comment asking a question
// TODO: This comment refers to some future work that should be done here
// FIXME: This comment refers to a bug that needs fixing here

// Root scope variable naming
const IMMUTABLE_CONSTANT = 'some value that will never change';
const mutableConstant = ObjectWhosePropertiesCanChange();
let notConstant = 'a value that can change';

// Open brace on the same line as condition
if(condition) {
    
    // There is a space before every comment
    doSomething(); // Unless it comes after functioning code like this
    
    // Immutable constants that are not at the root scope are written in cammel case
    const localConstant = "a value";
} else {
    
    // Comments do not have periods after them
    // Unless it requires multiple sentences and is inconvenient to have a new comment for each sentence
    console.log('Use single quotes, not double quotes');
    
    // Use lambda notation for callbacks
    functionWithCallback(() => {
        doSomething();
    }); // Explicitly use semi-colons where possible
}


// -- SECTION HEADER -- //

// There are two empty lines before a section header and one after
```

## Github Process

---
This repo uses the principles of [continuous integration](https://www.atlassian.com/continuous-delivery/continuous-integration). This is not so important if you are working alone but if multiple people are working on this repo at once, it is useful to understand it. What is most important is following these basic rules:

### If working alone
- Pull from the dev branch when first starting on the project. The dev branch should by the most up-to-date branch.
- Make edits on the dev branch *only*.
- Merge your dev branch with the master branch *only* once you know that the dev branch is stable as anything that is on the master branch is subject to being deployed.
### If working with others
- Pull from the dev branch when first starting on the project. The dev branch should by the most up-to-date branch.
- Create feature branches off of the dev branch and make your edits there.
- Merge your feature branch with the dev branch often.
- Create a testing branch off of the dev branch before deploying any new code.
- Once the testing branch is deemed stable enough, merge into the master branch.

## File Structure

---
- All folders and files follow the same naming scheme. It is all written in lowercase with dashes used to separate words (i.e. `my-file`)
- All html files are located in /html
- All non-html files that are public (which means anyone can access them without authorization) are located in /public. Any sensitive information **must not** be put in /public.
- /typescript-build is where transpiled Typescript files are located as specified in tsconfig.json. You should not add anything to this folder manually.
- Fonts are placed in /fonts. Fonts with the extension .fnt are given their own subfolder.

## Frameworks / Libraries

---
### Node.js
[JavaScript runtime for running JS outside of the browser](https://nodejs.org/en/about/)

### Express.js
[Web server framework for Node.js](http://expressjs.com/)

### Airtable
[Database with a GUI](https://www.airtable.com/product)

### JS Logger
[Logger for JavaScript](https://github.com/jonnyreeves/js-logger#readme). As the name would suggest...

### Source Map Support
[Proper Typescript stack trace support](https://github.com/evanw/node-source-map-support#readme)

### Jimp
[JavaScript image manipulation program](https://github.com/oliver-moran/jimp#readme)

### Moment.js
[Library for formatting dates and times](https://github.com/moment/moment/#readme)

## Managing the Server

---
### SSH-ing into the server
1. Go to [Google Cloud](https://cloud.google.com).
2. Click "console" on the top right.
3. At the top, select "Awesome Inc Alumni Network" from the project dropdown menu if it is not already selected.
4. On the left side, click "Compute Engine" (you may need to scroll down to find it).
5. Click the dropdown menu arrow under the "Connect" section of the VM instances table.
6. From the dropdown menu, click "Open in browser window".

### Updating and running the Server
These are the steps for running the server on the current version of the master branch:

1. [SSH into the server](#ssh-ing-into-the-server).
2. [Reattach to the server's Screen](https://linuxize.com/post/how-to-use-linux-screen/#reattach-to-a-linux-screen). If there is not one, start a new [named Screen session](https://linuxize.com/post/how-to-use-linux-screen/#starting-named-session).
3. [Stop the web server](#stopping-the-web-server) if it is already running.
4. Type the following commands:
```shell
cd /srv/www/Awesome-Links
sudo startup.sh
```
5. When prompted for a password type "inceawesome957" (now that this password is in plain text here, it should probably be changed by making a new deploy key and deleting the old one)

After doing this, the server will run on the latest version of the master branch. It is worth noting that although the server will be running with the updated files, the old `startup.sh` will still be used. For this reason, if the master branch contains a new `startup.sh` file, you will need to [stop the web server](#stopping-the-web-server) and type `sudo startup.sh` again after the server starts the first time.

### Stopping the web server
There are many ways to stop the web server (turning off VM instance, using the `kill` command, etc) but the safest way is to press `Ctrl+C` while connected to the server's Screen instance. The server will gracefully exit by finishing up certain tasks before completely terminating. AFter that it is safe to turn off the VM instance if needed.

## Useful IDE Extensions

---
### For Visual Studio Code
- [Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments): Highlights certain comments consistent with the code [style guide](#style-guide).
- [IntelliSense for CSS class names in HTML](https://marketplace.visualstudio.com/items?itemName=Zignd.html-css-class-completion): It is exactly what the name describes.
- [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client): Lets you run HTTP requests from within VS Code. Especially useful for DELETE and PUT requests since browsers cannot do those without using special extensions.
- [Visual Studio IntelliCode](https://marketplace.visualstudio.com/items?itemName=VisualStudioExptTeam.vscodeintellicode): Provides really nice improvements to the way IntelliSense works. Supports TS and JS among other languages.
- [Rainbow Brackets](https://marketplace.visualstudio.com/items?itemName=2gua.rainbow-brackets): Makes understanding nested parathenses and brackets that are common in JS/TS easier to understand.

### For JetBrains WebStorm
TODO: Check what extensions I have on WebStorm
