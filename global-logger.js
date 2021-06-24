// Module imports
const Logger = require('js-logger');
const Moment = require('moment');
const FS = require('fs');

// Other variable declarations
const logFilePath = `./logs/${Moment().format('YYYY-MM-DD - HH-mm-ss ZZ')} Awesome Links.log`;
const writeFileInterval = 1000; // In ms
const writeFileBuffer = [];
let writeFileTimerIsActive; //? A bit verbose, consider renaming
const consoleHandler = Logger.createDefaultHandler();

// Initialization
Logger.setLevel(Logger.DEBUG);
Logger.setHandler((messages, context) => {
    let messageBundle = { messages: messages, context: context };

    // Beautify message
    messages[0] = messageBundleToString(messageBundle);

    // Send message to console
    consoleHandler(messages, context);

    // Add to write buffer to be written to a file later
    writeFileBuffer.push(messageBundle.messages[0]);
    if(!writeFileTimerIsActive) {
        setTimeout(writeBufferToLogFile, writeFileInterval);
        writeFileTimerIsActive = true;
    }

});

// -- PRIVATE METHODS -- //

// Writes the messages in writeFileBuffer to a log file
function writeBufferToLogFile() {

    try {
        // Loop through messages and concatenate them
        let messageToWrite = '';
        writeFileBuffer.forEach((message) => {
            messageToWrite += message + '\n';
        });

        // Write message to log file
        FS.appendFile(logFilePath, messageToWrite, {flag: 'a'}, (error) => {
            if(error) {
                console.error(`Failed to write log message to file with the following error:\n${error}`);
            }
        });
    } catch(error) {
        console.error(`Could not write message to log file`);
    } finally {

        // Clear buffer and reset timer
        writeFileBuffer.length = 0;
        writeFileTimerIsActive = false;
    }
}

// Given a message and context (message bundle), returns a message that is log/console friendly
function messageBundleToString(messageBundle) {
    return `[${Moment().format('YYYY-MM-DD | HH:mm:ss UTCZZ')}][${messageBundle.context.level.name}]: ${messageBundle.messages[0]}`;
}


// -- PUBLIC METHODS --//

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
