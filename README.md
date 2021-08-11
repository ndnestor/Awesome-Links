# Awesome-Links

## Table of Contents

---
- [Quick Start](#quick-start)
- [Style Guide](#style-guide)
- [Github Process](#github-process)
- [File Structure](#file-structure)
- [Frameworks / Libraries](#frameworks--libraries)
- [Updating the Server](#updating-the-server)

## Quick Start

---
### For Windows
1. Download [Node.js](https://nodejs.org/)
2. Download [Git for Windows](https://git-scm.com/download/win)
3. Navigate to where you want to clone the repo in File Explorer, right click it, then type the following commands:
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
2. Once it is finished installing, run these commands:
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
