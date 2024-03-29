// Module imports
const Express = require('express');
const Path = require('path');
const FS = require('fs');

// Script imports
import { methods as airtableInterface } from './airtable-interface';
import { methods as logger } from './global-logger';
import { statusCodes } from './http-constants';

const mapper = require('./mapper.js');
require('./console-interface.js');

// Other variable declarations
const app = Express();

const sendTypes = {
    STRING: 1,
    FILE: 2,
    JSON: 3
};
const PORT = 8080;


// -- SERVER SETUP -- //

// Allow Express to parse JSON
app.use(Express.urlencoded({extended: true}));
app.use(Express.json());


// Cache part of database
// noinspection JSIgnoredPromiseFromCall
airtableInterface.cacheRecords('Employees');
airtableInterface.cacheRecords('Locations').then(() => {

    // Cache visible markers
    mapper.methods.cacheVisibleMarkers();
});

// Allow connections to the server
const server = app.listen(PORT, () => {
    logger.info(`The server is listening on port "${PORT}"`);
});


// -- REQUEST HANDLING -- //

// Sends the root html file
app.all('/', (req, res) => {
    logger.info('Request on root was made');
    const indexPath = Path.join(process.cwd(), '/html/index.html');
    endResponse(res, statusCodes.OK, sendTypes.FILE, indexPath);
});

// Updates the record cache
app.put('/cache-records', (req, res) => {
    logger.info('Request on /cache-records was made');

    const tableName = req.body['Table Name'];

    if(typeof tableName !== 'string') {
        endResponse(res, statusCodes.BAD_REQUEST);
    }

    airtableInterface.cacheRecords(tableName).then((records) => {
        endResponse(res, statusCodes.OK, sendTypes.JSON, records);
    }).catch(() => {
        endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
    });
});

// Searches for records in a table with a given (reliant on the record cache being up to date)
app.get('/search-records', (req, res) => {
    logger.info('Request on /search-records was made');

    const tableName = req.body['Table Name'];
    const fieldName = req.body['Field Name'];
    const fieldValue = req.body['Field Value'];
    const isExact = req.body['Is Exact'];

    if(typeof tableName !== 'string' || typeof fieldName !== 'string' || fieldValue !== undefined || typeof isExact !== 'boolean') {
        logger.warn(`Bad request on /search-records with the following request body:${JSON.stringify(req.body)}`);
        endResponse(res, statusCodes.BAD_REQUEST);
    }

    airtableInterface.searchInField(tableName, fieldName, fieldValue, isExact).then((records) => {
        endResponse(res, statusCodes.OK, sendTypes.JSON, records);
    }).catch(() => {
        endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
    });
});

// Adds record(s) to the given table
app.post('/add-record', (req, res) => {
   logger.info('Request on /add-record was made');

   const tableName = req.body['Table Name'];
   const newRecords = req.body['New Records'];

   if(typeof tableName !== 'string' || typeof newRecords !== 'object') {
       logger.info(`Bad request on /add-record with the following request body:${JSON.stringify(req.body)}`);
       endResponse(res, statusCodes.BAD_REQUEST);
   }

   airtableInterface.addRecords(tableName, newRecords).then((records) => {
       endResponse(res, statusCodes.CREATED, sendTypes.JSON, records);
   }).catch(() => {
       endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
   });
});

// Deletes record(s) from the given table
app.delete('/delete-record', (req, res) => {
    logger.info('Request on /delete-record was made');

    const tableName = req.body['Table Name'];
    const recordIDs = req.body['Record IDs'];

    if(typeof tableName !== 'string' || !Array.isArray(recordIDs) || !recordIDs.every(ID => typeof ID === 'string')) {
        logger.info(`Bad request on /delete-record with the following request body:${JSON.stringify(req.body)}`);
        endResponse(res, statusCodes.BAD_REQUEST);
    }

    airtableInterface.deleteRecords(tableName, recordIDs).then((deletedRecords) => {
        endResponse(res, statusCodes.OK, sendTypes.JSON, deletedRecords);
    }).catch(() => {
        endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
    });

});

// Sends Mapbox marker feature collection for use with interactive map
app.get('/markers', (req, res) => {
    logger.info('Request on /markers was made');

    const cachedMarkers = mapper.methods.getCachedVisibleMarkers();
    endResponse(res, statusCodes.OK, sendTypes.JSON, cachedMarkers);
});

// Sends a file given a path from the public folder
app.get('/public/:resource*', (req, res) => {
    logger.info('Request on /public/:resource* was made');
    
    const parameterlessPath = '/public/';
    const resource = req.originalUrl.substr(req.originalUrl.indexOf(parameterlessPath) + parameterlessPath.length);
    const pathToResource = Path.join(process.cwd(), `public/${resource}`);

    // Check if the requested file can be read
    FS.access(pathToResource,FS.constants.R_OK, error => {
        if(!error) {

            // The file exists and we can read it
            logger.info(`Sending resource "${resource}"`);
            endResponse(res, statusCodes.OK, sendTypes.FILE, pathToResource);

        } else {

            // Most likely the file does not exist or we cannot read it
            if(error.code === 'ENOENT') {
                logger.error(`Cannot send "${pathToResource}" as it does not exist`);
            } else {
                logger.error(`Cannot send "${pathToResource}". We may not have read access to it`);
            }

            endResponse(res, statusCodes.NOT_FOUND);
        }
    });
});

// Sends an HTTP response back to the client
// TODO: Implement changing the content header of the HTTP response based on what content was sent
function endResponse(res, statusCode, sendType=undefined, sendContent=undefined) {

    // Send log message based on status code
    let logMessageToSend = '';
    logMessageToSend += `Ending response with status code ${statusCode}`;
    switch (statusCode.toString()[0]) {
        case '2':
            // 200s - success status codes
            logMessageToSend += '. This is a success code';
            logger.info(logMessageToSend);
            break;
        case '4':
            // 400s - client error status codes
            logMessageToSend += '. This is a client error code';
            logger.warn(logMessageToSend);
            break;
        case '5':
            // 500s - server error status codes
            logMessageToSend += '. This is a server error code';
            logger.error(logMessageToSend);
            break;
        default:
            logMessageToSend += '. This status code family is not set up properly for logging';
            logger.warn(logMessageToSend);
    }

    // Set status code
    res.status(statusCode);

    // End the response appropriately
    if(sendType === undefined) {
        res.end();
    } else {
        if(sendContent === undefined) {
            logger.error('Send type was defined but send content was not. Ending response with no send content');
            res.statusCode(statusCodes.INTERNAL_SERVER_ERROR).end();
        } else if(sendType === sendTypes.FILE) {
            res.sendFile(sendContent);
        } else if(sendType === sendTypes.STRING) {
            res.send(sendContent);
        } else if(sendType === sendTypes.JSON) {
            res.json(sendContent);
        } else {
            logger.error(`Specified send type does not exist or has not been implemented yet.
             Ending response with status code ${statusCodes.INTERNAL_SERVER_ERROR} with no response content`);
            logger.trace();

            res.statusCode(statusCodes.INTERNAL_SERVER_ERROR).end();
        }
    }
}


// -- SERVER TERMINATION HANDLING -- //

// Handles SIGINT signal. This signal is sent by Ctrl+C
process.on('SIGINT', () => {
    logger.info('Received SIGINT signal to end execution');
    endGracefully(0); // This is the "everything is fine" exit code
});

// Handles crashing due to an uncaught error
process.on('uncaughtException', (error: Error) => {
    const divider = '///////////////////////////////////';
    logger.error(`\nUNCAUGHT EXCEPTION\n${divider}\n${error.stack}\n${divider}`);
    endGracefully(1); // This is the "abnormal termination" exit code
});

// Gets called before the process exits unless it is focefully terminated
function endGracefully(exitCode: number) {
    logger.info('Waiting for Express.js server to stop...');
    server.close(async () => {
        logger.info(`Express.js server has stopped`);
        logger.info('Waiting for logger to finish writing buffer...');
        await logger.waitForWrite().then(() => {
            logger.info('Logger finished writing buffer');
        }).catch(() => {
            logger.error('Logger timed out before it could finish writing to buffer');
        }).finally(() => {
            process.exit(exitCode);
        });
    });
}
