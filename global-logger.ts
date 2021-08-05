export {};

// Module imports
const Logger = require('js-logger');
const Moment = require('moment');
const FS = require('fs');

// Other variable declarations
const logFilePath = `./logs/${Moment().format('YYYY-MM-DD - HH-mm-ss ZZ')} Awesome Links.log`;
const writeFileInterval = 1000; // In ms
const writeFileBuffer = [];
let writeFileTimerIsActive; //? A bit verbose, consider renaming
const traceLogger = Logger.get('Trace Logger');
const genericLogger = Logger.get('Generic');
const consoleHandler = Logger.createDefaultHandler();

// Initialization
traceLogger.setLevel(Logger.TRACE);
genericLogger.setLevel(Logger.INFO);
Logger.setHandler((messages, context) => {
    let messageBundle = { messages: messages, context: context };

    // Beautify message
    messages[0] = messageBundleToString(messageBundle);

    // Send warning if programmer tried to send multiple messages at once
    if(messages.length > 1) {
        methods.error('The global logger is not set up to deal with multiple log messages at once');
    }

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

    // Loop through messages and concatenate them
    let messageToWrite = '';
    writeFileBuffer.forEach((message) => {
        messageToWrite += message + '\n';
    });

    // Write message to log file
    FS.appendFile(logFilePath, messageToWrite, {flag: 'a'}, (error) => {
        if(error) {
            console.error(`Failed to write log message to file with error\n${error}`);
            process.exit(1);
        }
    });

    // Clear buffer and reset timer
    writeFileBuffer.length = 0;
    writeFileTimerIsActive = false;

}

// Given a message and context (message bundle), returns a message that is log/console friendly
function messageBundleToString(messageBundle) {
    return `[${Moment().format('YYYY-MM-DD | HH:mm:ss UTCZZ')}][${messageBundle.context.level.name}]: ${messageBundle.messages[0]}`;
}


// -- PUBLIC METHODS --//

export class methods {

    // Returns the Logger object. Used to change Logger settings from outside this script
    public static getLogger()  {
        return Logger;
    }

    public static debug(message)  {
        if(message === undefined) {
            message = 'undefined';
        }
        genericLogger.debug(message.toString());
    }

    public static info(message) {
        if(message === undefined) {
            message = 'undefined';
        }
        genericLogger.info(message.toString());
    }

    public static warn(message) {
        if(message === undefined) {
            message = 'undefined';
        }
        genericLogger.warn(message.toString());
    }

    public static error(message) {
        if(message === undefined) {
            message = 'undefined';
        }
        genericLogger.error(message.toString());
    }

    public static trace() {
        const stackTrace = new Error().stack;
        traceLogger.trace(stackTrace);
    }

    public static waitForWrite(): Promise<void> {
        return new Promise((resolve, reject) => {
            setInterval(() => {
                if(writeFileBuffer.length === 0) {
                    resolve();
                }
            }, writeFileInterval);
            setTimeout(() => {
                reject();
            }, writeFileInterval * 3); // TODO: Create a proper variable for this
        })
    }
}
