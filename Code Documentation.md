# Code Documentation

## Table of Contents

---
- [Code Files](#code-files)
  - [main.ts](#maints)
  - [global-logger.ts](#global-loggerts)
  - [airtable-interface.ts](#airtable-interfacets)
  - [mapper.ts](#mapperts)
  - [image-manipulator.ts](#image-manipulatorts)
  - [console.interface.ts](#console-interfacets)
  - [http-constants.ts](#http-constantsts)
  - [settings.ts](#settingsts)
  - [startup.sh](#startupsh)
- [Style Guide](#style-guide)

## Code Files

---
### main.ts
This is the entry point of the program. It deals with initializing the server and terminating it. As well, it is the communication point between the client and the rest of the server as all HTTP requests go through it and all HTTP responses are sent from it.

#### Important variables
```typescript
// The port to run the server on. 80 (HTTP), 8080 (HTTP proxy), and 443 (HTTPS) are what should be used for web servers.
PORT: number
```

#### Important methods
```typescript
// Sends an HTTP response to the client.
// Res: The response object passed into the app.method (app.get, app.delete, etc) method
// statusCode: The status code to send with the HTTP response
// sendType: Omit if not sending anything in the response body. Otherwise specify a value from the sendTypes enumerator
// sendContent: omit if sendType is ommitted. Otherwise pass in th value of the response body
endResponse(res, statusCode, sendType=undefined, sendContent=undefined): void
```

### global-logger.ts
A wrapper for the JS Logger library. This file deals with writing log messages to console and to a log file.

#### Important variables
```typescript
/* The time between writing log messages to a file in milliseconds
 * The logger does not write files immeidately for performance reasons
 * although you could imitate the same behavior by setting this variable to 1 */
waitFileInterval: number

// The maximum allow amound of time it should take to write messages to a log file in milliseconds
waitForWriteTimeout: number
```

#### Important methods
```typescript
// These methods all send a log message with different levels
// Message: The mesage to log
debug(message): void
info(message): void
warn(message): void
error(message): void
        
// Logs the current stack trace
trace(): void
        
// Returns a promise which esolves when there are no logs to write to file or rejects if it times out
waitForWrite(): Promise<void>
```

### airtable-interface.ts
Serves as the communication point between the Airtable database and the rest of the server. It is the only file that uses Airtable API calls. It is useful to be familiar with the [Airtable API](https://airtable.com/appCiX72O5Fc9qfOo/api/docs#javascript/introduction) if you are editing OR using this file.

#### Important variables
```typescript
// Contains database records that may be outdated. Call cacheRecords(tableName) to update a table's cache
cachedRecords: object

// These tables will have their chaches updated periodically
TABLES_TO_CACHE: string[]
```

#### Important methods
```typescript
// Updates the cache of a particular table which gets stored in the cachedRecords variable. Returns the updated records from that table
// tableName: The table to cache
cacheRecords(tableName): Promise<object[]>
        
// Returns the cached records of a specified table
// tableName: The table whose cached records are to be returned
getCachedRecords(tableName): object[]

// Returns records that match a search pattern
// tableName: The table to search
// fieldName: The field to search within the table
// fieldValue: The field value that is being searched for
// isExact: Only affects the result if fieldValue is a string. If true, string must match exactly. If false, string only needs to be constained in the record
searchInField(tableName, fieldName, fieldValue, ixExact): Promise<object[]>
        
// Adds a record to the database
// tableName: The table to add the record to
// records: The records to add
addRecords(tableName, records): Promise:<object[]>

// Deletes records from the database
// tableName: The table to delete records from
// recordIDs: The IDs of the records to delete
deleteRecords(tableName, recordIDs): Promise<object[]>
```

### mapper.ts
Serves as the communication point between the Mapbox API and the rest of the server. It is the only file that uses Mapbox API calls aside from some frontend JS.

### image-manipulator.ts
Provides extra functionality to the Jimp library. It is the only file that uses the Jimp library.

### console-interface.ts
Allows code to be run upon sending the program a message via stdin (which is the same as typing a message in console).

### http-constants.ts
Defines constants to be used when sending HTTP responses such as status codes.

### settings.ts
Manages global constant properties to be accessed by multiple files. Originally created to prevent circular dependencies although it no longer serves much of a use. It may be wise to remove it or mark it as deprecated.

```typescript
// Adds a constant property to the settings
// key: The name of the setting
// value: The value of the setting
defineProperty(key, value): void
```

### startup.sh
Used to run the updated release branch code. See the "Managing the Server" section in [README.md](README.md) for more info.

## Style Guide

---
### Files
All files and folders except .md files are named with lowercase alphanumerics and use dashes instead of spaces. Markdown files are written like normal titles excluding README.md.

### Code
This is the coding style that has been used throughout (nearly) the entire project. You can make up or break rules wherever it seems warranted
```typescript
//! This is an important comment
//? This is a comment asking a question
// TODO: This comment refers to some future work that should be done here

// Root scope variable naming
const IMMUTABLE_CONSTANT = 'some value that will never change';
const mutableConstant = ObjectWhosePropertiesCanChange();
let notConstant = 'a value that can change';

// Open brace on the same line as condition
if(condition) {
    
    // There is a space before every comment
    doSomething(); // Unless it comes after functioning code like this
    
    // Immutable constants that are not at the root scope are written in cammel case
    const localConstant = 'a value';
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
