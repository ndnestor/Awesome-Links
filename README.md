# Awesome-Links

## Table of Contents

---
- [Quick Start](#quick-start)
- [GitHub Process](#github-process)
- [File Structure](#file-structure)
- [Frameworks / Libraries](#frameworks--libraries)
- [Managing the Server](#managing-the-server)
- [Managing the Database](#managing-the-database)
- [Useful IDE Extensions](#useful-ide-extensions)
- [More Information](#more-information)

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

### Running the code
There are a few ways to run your code

#### From terminal
Type the following command:
```shell
node .\typescript-build\main.js -r source-map-support/register
```

#### From VS Code
A launch.json file is provided with this repo meaning that no set up is required to launch the project form Visual Studio Code. Press ``Ctrl+F5`` to run normally, ``F5`` to run in debug mode, or press the corresponding buttons under the "Run" menu at the top of the window. Note that this method does not work perfectly as you cannot send messages to the program via stdin meaning that console commands will not work during runtime. This is mostly okay because the need to use stdin in rare. To get around this, you can use the built-in terminal in Visual Studio Code by following the [instructions for running the code via terminal](#from-terminal).

#### From JetBrains WebStorm
Setting up WebStorm to run the project properly requires a few easy steps:
1. Double tap shift.
2. Search for and select "Edit Configurations...".
3. Click the "add" button on the top left (it is a plus sign).
4. Select Node.js
5. Set the node parameter setting to "-r source-map-support/register".
6. Set the JavaScript file setting to ".\typescript-build\main.js".
7. Give the configuration a name.
8. Click "OK".

From there you can press ``Shift+F10`` to run it normally, ``Shift+F9`` to run in debug mode, or press the corresponding buttons on the top right.

## GitHub Process

---
This repo uses the principles of [continuous integration](https://www.atlassian.com/continuous-delivery/continuous-integration). This is not so important if you are working alone but if multiple people are working on this repo at once, it is useful to understand it. What is most important is following these basic rules:

### If working alone
- Pull from the dev branch when first starting on the project. The dev branch should be the most up-to-date branch.
- Make edits on the dev branch *only*.
- Merge your dev branch with the master branch *only* once you know that the dev branch is stable as anything that is on the master branch is subject to being deployed.
### If working with others
- Pull from the dev branch when first starting on the project. The dev branch should be the most up-to-date branch.
- Create feature branches off of the dev branch and make your edits there.
- Merge your feature branch with the dev branch often.
- Create a testing branch off of the dev branch before deploying any new code.
- Once the testing branch is deemed stable enough, merge into the master branch.

Regardless of whether you are working alone or not, remember to make clear yet brief git commit message. For example, "Added search method to database file" is a lot better than "Updated database file". Use vague git commit messages only when what you changed will surely not affect another programmer (i.e. fixing a typo or making a small edit to .md files).

## File Structure

---
- Most files are written in lowercase with dashes used to separate words. Check the "Style Guide" section of the [code documentation](Code%20Documentation.md) for more info.
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
### About the server
The server runs on a [Google Cloud compute engine](https://cloud.google.com/compute/) virtual machine. Here are its specifications:
- OS: Linux (Debian 10)
- Processor: 1 vCPU
- RAM: 0.6 GBs
- Storage: 30 GBs

There is [documentation on the compute engine](https://cloud.google.com/compute/docs) available online.

### SSH-ing into the server
1. Go to [Google Cloud](https://cloud.google.com).
2. Click "console" on the top right.
3. At the top, select "Awesome Inc Alumni Network" from the project dropdown menu if it is not already selected.
4. On the left side, click "Compute Engine" (you may need to scroll down to find it).
5. Click the dropdown menu arrow under the "Connect" section of the VM instances table.
6. From the dropdown menu, click "Open in browser window".

### Updating and running the Server
These are the steps for running the server on the current version of the master branch (note that you will need to have generated a [personal access token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) with the "repo" permission):
1. [SSH into the server](#ssh-ing-into-the-server).
2. [Reattach to the server's Screen](https://linuxize.com/post/how-to-use-linux-screen/#reattach-to-a-linux-screen). If there is not one, start a new [named Screen session](https://linuxize.com/post/how-to-use-linux-screen/#starting-named-session).
3. [Stop the web server](#stopping-the-web-server) if it is already running.
4. Type the following commands:
```shell
cd /srv/www/Awesome-Links
sudo startup.sh
```
5. When prompted for a password type in the personal access token that you generated.

After doing this, the server will run on the latest version of the master branch. It is worth noting that although the server will be running with the updated files, the old `startup.sh` will still be used. For this reason, if the master branch contains a new `startup.sh` file, you will need to [stop the web server](#stopping-the-web-server) and type `sudo startup.sh` again after the server starts the first time.

### Stopping the web server
There are many ways to stop the web server (turning off the VM instance, using the `kill` command, etc.) but the safest way is to press `Ctrl+C` while connected to the server's Screen instance. The server will gracefully exit by finishing up certain tasks before completely terminating. After that it is safe to turn off the VM instance if needed.

## Managing the Database

---
You can view and make modifications to the database by going to [Airtable.com](https://airtable.com) and logging in with an account that has been given access to the database. The database can also be manipulated using the endpoints in main.ts and the methods in airtable-interface.ts (see the [code documentation](Code%20Documentation.md) for more info).

## Useful IDE Extensions

---
The default settings for the following extensions and plugins will work well enough.
### Extensions for Visual Studio Code
- [Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments): Highlights certain comments consistent with the code (See the "Style Guide" section in the [code documentation](Code%20Documentation.md)).
- [IntelliSense for CSS class names in HTML](https://marketplace.visualstudio.com/items?itemName=Zignd.html-css-class-completion): It is exactly what the name describes.
- [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client): Lets you run HTTP requests from within VS Code. Especially useful for testing DELETE and PUT requests since browsers cannot do those without using special extensions.
- [Visual Studio IntelliCode](https://marketplace.visualstudio.com/items?itemName=VisualStudioExptTeam.vscodeintellicode): Provides really nice improvements to the way IntelliSense works. Supports TS and JS among other languages.
- [Rainbow Brackets](https://marketplace.visualstudio.com/items?itemName=2gua.rainbow-brackets): Makes understanding nested parentheses and brackets that are common in JS/TS easier to understand.

### Plugins for JetBrains WebStorm
- [Comments Highlighter](https://plugins.jetbrains.com/plugin/12895-comments-highlighter): Highlights certain comments consistent with the code (See the "Style Guide" section in the [code documentation](Code%20Documentation.md)).
- [Rainbow Brackets](https://plugins.jetbrains.com/plugin/10080-rainbow-brackets): Makes understanding nested parentheses and brackets that are common in JS/TS easier to understand.
 
## More Information

---
Some odds and ends that I did not think warranted each having their own section.

### Code documentation
You can find the code documentation [here](Code%20Documentation.md).

### Generating .fnt files
The [Jimp](#frameworks--libraries) library makes use of .fnt files. These files represent fonts and are an alternative to the standard .ttf font file. It is rare to find .fnt files lying around so knowing how to convert a .ttf file to a .fnt file is useful. You can use [Hiero](https://github.com/libgdx/libgdx/wiki/Hiero) to do so. Instructions on how to use it are on its homepage.

### Relevant documentation
- [Google Cloud compute engine](https://cloud.google.com/compute/)
- [Airtable](https://airtable.com/appCiX72O5Fc9qfOo/api/docs#javascript/introduction)
- [Mapbox](https://docs.mapbox.com/)

### Contacting me
If there's anything that needs clarification, I would be happy to help. You can contact me by emailing [nathan.nestor@outlook.com](mailto:nathan.nestor@outlook.com)
