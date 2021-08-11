// Module imports
const { memoryUsage } = require('process');

// Script imports
import { methods as logger } from './global-logger'
import { methods as airtableInterface } from './airtable-interface';

// Other variable declarations
const argDelimiter = ' ';

// Create console listener
const stdin = process.openStdin();

stdin.addListener('data', (message) => {

    //! The 'message' object will end with a linefeed when converted to a string
    // Remove linefeed from message
    const messageString: string = message.toString().trim();

    let command: string;
    let args: string[];
    const argDelimiterIndex: number = messageString.indexOf(argDelimiter);

    if(argDelimiterIndex !== -1) {
        command = messageString.substring(0, argDelimiterIndex);
        args = messageString.substring(argDelimiterIndex + 1).split(argDelimiter);
    } else {
        command = messageString;
        args = null;
    }

    handleConsoleCmd(command, args);
});

function handleConsoleCmd(command: string, args: string[]): void {

    // Command is not case-sensitive
    command = command.toLowerCase();

    // Message to log upon completing command
    let response = `Command: "${command}"\n`;

    // Run the appropriate code based on the command
    switch(command) {
        case 'ram':
            response += `${memoryUsage().rss / 1000000} megabytes of physical RAM are being used`;
            break;
        case 'cached-records':
            if(args.length !== 1) {
                logger.warn('"cached records" command takes one argument');
            } else {
                const cachedRecords: object[] = airtableInterface.getCachedRecords(args[0]);
                response += `There are ${cachedRecords.length} cached records`;
                cachedRecords.forEach((record) => {
                    response += `\n${JSON.stringify(record, null, 2)}`;
                });
            }
            break;
        default:
            response += 'Command not found';
    }

    // Log response message
    logger.info(response);
}
