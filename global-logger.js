// Module imports
const Logger = require('js-logger');

// Initialization
Logger.setLevel(Logger.DEBUG);
const consoleHandler = Logger.createDefaultHandler();
Logger.setHandler((messages, context) => {
    // Send message to console
    consoleHandler(messages, context);

    // TODO: Write log to log file
});

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
