// Module imports
const Logger = require('js-logger');
const Moment = require('moment');
const FS = require('fs');

// Other variable declarations
const logFilePath = `./logs/${Moment().format('[YYYY-MM-DD] HH-mm-ss ZZ')} Awesome Links.log`;
const writeFileInterval = 1000; // In ms
const writeFileBuffer = [];
let writeFileTimerIsActive; //? A bit verbose, consider renaming
const consoleHandler = Logger.createDefaultHandler();

// Initialization
Logger.setLevel(Logger.DEBUG);
Logger.setHandler((messages, context) => {
    // Send message to console
    consoleHandler(messages, context);

    // Add to write buffer to be written to a file later
    writeFileBuffer.push(messages);
    if(!writeFileTimerIsActive) {
        setTimeout(writeBufferToLogFile, writeFileInterval);
        writeFileTimerIsActive = true;
    }

});

// Writes the messages in writeFileBuffer to a log file
function writeBufferToLogFile() {

    // Loop through messages and concatenate them
    let messageToWrite = '';
    writeFileBuffer.forEach((message) => {
        messageToWrite += message[0] + '\n';
    });

    // Write message to log file
    FS.appendFile(logFilePath, messageToWrite, { flag: 'a' }, (error) => {
        if(error) {
            console.error(`Failed to write log message to file with the following error:\n${error}`);
        }
    });

    // Clear buffer
    writeFileBuffer.length = 0;
}

// TODO: Determine some way to handle verbose messages
const methods = {

    // Returns the Logger object. Used to change Logger settings from outside this script
    getLogger: function() {
        return Logger;
    },
    debug: function(message) {
        Logger.debug(message.toString());
    },
    info: function(message) {
        Logger.info(message.toString());
    },
    warn: function(message) {
        Logger.warn(message.toString());
    },
    error: function(message) {
        Logger.error(message.toString());
    },
    trace: function() {
        Logger.trace('Stack trace:');
        console.trace();
    }
};

// Allow other files to use methods from this file
module.exports = methods;
