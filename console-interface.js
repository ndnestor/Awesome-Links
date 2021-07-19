// Module imports
const { memoryUsage } = require('process');

// Script imports
const logger = require('./global-logger.js');

// Create console listener
const stdin = process.openStdin();

stdin.addListener('data', (message) => {

    //! The 'message' object will end with a linefeed when converted to a string
    // Remove linefeed from message
    const messageString = message.toString().trim();

    // TODO: Parse command, flags, and parameters
    handleConsoleCmd(messageString);
});

function handleConsoleCmd(command) {

    // Command is not case-sensitive
    command = command.toLowerCase();

    // Message to log upon completing command
    let response = `Command: "${command}"\n`;

    // Run the appropriate code based on the command
    switch(command) {
        case 'ram':
            const rss = memoryUsage().rss; // In bytes
            response += `${rss} bytes or ${rss / 1000000} megabytes`;
            break;
        default:
            response += 'Command not found';
    }

    // Log response message
    logger.info(response);
}

// TODO: Implement try-catch blocks