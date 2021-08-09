// Module imports
const { memoryUsage } = require('process');

// Script imports
import { methods as logger } from './global-logger'

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
    // TODO: Add a stop command so that it can exit after writing log buffer
    switch(command) {
        case 'ram':
            response += `${memoryUsage().rss / 1000000} megabytes of physical RAM are being used`;
            break;
        default:
            response += 'Command not found';
    }

    // Log response message
    logger.info(response);
}
