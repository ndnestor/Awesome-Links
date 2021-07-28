"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Module imports
var Logger = require('js-logger');
var Moment = require('moment');
var FS = require('fs');
// Other variable declarations
var logFilePath = "./logs/" + Moment().format('YYYY-MM-DD - HH-mm-ss ZZ') + " Awesome Links.log";
var writeFileInterval = 1000; // In ms
var writeFileBuffer = [];
var writeFileTimerIsActive; //? A bit verbose, consider renaming
var consoleHandler = Logger.createDefaultHandler();
// Initialization
Logger.setLevel(Logger.TRACE);
Logger.setHandler(function (messages, context) {
    var messageBundle = { messages: messages, context: context };
    // Beautify message
    messages[0] = messageBundleToString(messageBundle);
    // Send warning if programmer tried to send multiple messages at once
    if (messages.length > 1) {
        methods.error('The global logger is not set up to deal with multiple log messages at once');
    }
    // Send message to console
    consoleHandler(messages, context);
    // Add to write buffer to be written to a file later
    writeFileBuffer.push(messageBundle.messages[0]);
    if (!writeFileTimerIsActive) {
        setTimeout(writeBufferToLogFile, writeFileInterval);
        writeFileTimerIsActive = true;
    }
});
// -- PRIVATE METHODS -- //
// Writes the messages in writeFileBuffer to a log file
function writeBufferToLogFile() {
    // Loop through messages and concatenate them
    var messageToWrite = '';
    writeFileBuffer.forEach(function (message) {
        messageToWrite += message + '\n';
    });
    // Write message to log file
    // TODO: Create log folder if it doesn't exist already
    FS.appendFile(logFilePath, messageToWrite, { flag: 'a' }, function (error) {
        if (error) {
            console.error("Failed to write log message to file with error\n" + error);
            // TODO: Consider crashing
        }
    });
    // Clear buffer and reset timer
    writeFileBuffer.length = 0;
    writeFileTimerIsActive = false;
}
// Given a message and context (message bundle), returns a message that is log/console friendly
function messageBundleToString(messageBundle) {
    return "[" + Moment().format('YYYY-MM-DD | HH:mm:ss UTCZZ') + "][" + messageBundle.context.level.name + "]: " + messageBundle.messages[0];
}
// -- PUBLIC METHODS --//
var methods = {
    // Returns the Logger object. Used to change Logger settings from outside this script
    getLogger: function () {
        return Logger;
    },
    debug: function (message) {
        if (message === undefined) {
            message = 'undefined';
        }
        Logger.debug(message.toString());
    },
    info: function (message) {
        if (message === undefined) {
            message = 'undefined';
        }
        Logger.info(message.toString());
    },
    warn: function (message) {
        if (message === undefined) {
            message = 'undefined';
        }
        Logger.warn(message.toString());
    },
    error: function (message) {
        if (message === undefined) {
            message = 'undefined';
        }
        Logger.error(message.toString());
    },
    trace: function () {
        var stackTrace = new Error().stack;
        Logger.trace(stackTrace);
    }
};
// Allow other files to use methods from this file
module.exports = methods;
//# sourceMappingURL=global-logger.js.map