// Module imports
const Express = require('express');
const Path = require('path');
const FS = require('fs');

// Script imports
import { methods as logger } from './global-logger';
const airtableInterface = require('./airtable-intereface.js');
const mapper = require('./mapper.js');
require('./console-interface.js');

// Other variable declarations
const app = Express();
const statusCodes = {
    // Success responses
    OK: 200,
    CREATED: 201,

    // Client errors
    BAD_REQUEST: 400,

    // Server errors
    INTERNAL_SERVER_ERROR: 500
};

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
airtableInterface.cacheRecords('Employees').catch(() => {
    logger.error(`Could not do initial record caching for Employees table`);
});
airtableInterface.cacheRecords('Locations').catch(() => {
    logger.error(`Could not do initial record caching for Locations table`);
});

// Allow connections to the server
app.listen(PORT, () => {
    logger.info(`The server is listening on port "${PORT}"`);
});


// -- REQUEST HANDLING -- //

// Sends the root html file
app.all('/', async(req, res) => {
    logger.info('Request on root was made');
    try {
        endResponse(res, statusCodes.OK, sendTypes.FILE, Path.join(Path.join(__dirname, '/html/index.html')));
    } catch(error) {
        logger.error(error);
        logger.trace();
        endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
    }
});

// Updates the record cache
app.put('/cache-records', async(req, res) => {
    logger.info('Request on /cache-records was made');

    try {
        const tableName = req.body['Table Name'];

        if(tableName === undefined) {
            endResponse(res, statusCodes.BAD_REQUEST);
        }

        airtableInterface.cacheRecords(tableName).then((records) => {
            endResponse(res, statusCodes.OK, sendTypes.JSON, records);
        }).catch(() => {
            endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
        });
    } catch(error) {
        logger.error(error);
        logger.trace();
        endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
    }
});

// Searches for records in a table with a given (reliant on the record cache being up to date)
app.get('/search-records', async(req, res) => {
    logger.info('Request on /search-records was made');

    try {
        const tableName = req.body['Table Name'];
        const fieldName = req.body['Field Name'];
        const fieldValue = req.body['Field Value'];
        const isExact = req.body['Is Exact'];

        if(tableName === undefined || fieldName === undefined || fieldValue === undefined || isExact === undefined) {
            endResponse(res, statusCodes.BAD_REQUEST);
        }

        airtableInterface.searchInField(tableName, fieldName, fieldValue, isExact).then((records) => {
            endResponse(res, statusCodes.OK, sendTypes.JSON, records);
        }).catch(() => {
            endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
        });
    } catch(error) {
        logger.error(error);
        logger.trace();
        endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
    }
});

// Adds record(s) to the given table
app.post('/add-record', async(req, res) => {
   logger.info('Request on /add-record was made');

   try {
       const tableName = req.body['Table Name'];
       const newRecords = req.body['New Records'];

       airtableInterface.addRecords(tableName, newRecords).then((records) => {
           endResponse(res, statusCodes.CREATED, sendTypes.JSON, records);
       }).catch(() => {
           endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
       });
   } catch(error) {
       logger.error(error);
       logger.trace();
       endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
   }
});

// Deletes record(s) from the given table
app.delete('/delete-record', async(req, res) => {
    logger.info('Request on /delete-record was made');

    try {
        const tableName = req.body['Table Name'];
        const recordIDs = req.body['Record IDs'];

        airtableInterface.deleteRecords(tableName, recordIDs).then((deletedRecords) => {
            endResponse(res, statusCodes.OK, sendTypes.JSON, deletedRecords);
        }).catch(() => {
            endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
        });
    } catch(error) {
        logger.error(error);
        logger.trace();
        endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
    }
});

// Updates the static map image
app.put('/update-map', async(req, res) => {
    logger.info('Request on /update-map was made');

    try {
        mapper.saveStaticMap().then(() => {
            endResponse(res, statusCodes.CREATED);
        }).catch(() => {
            endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
        });
    } catch(error) {
        logger.error(error);
        logger.trace();
        endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
    }
});

// Sends Mapbox marker feature collection for use with interactive map
app.get('/markers', async(req, res) => {
    logger.info('Request on /markers was made');

    try {
        mapper.getMarkers().then((markers) => {
            endResponse(res, statusCodes.OK, sendTypes.JSON, markers);
        }).catch(() => {
            endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
        });
    } catch(error) {
        logger.error(error);
        logger.trace();
        endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
    }
});

// Sends a file given a path from the public folder
app.get('/public/:resource', async(req, res) => {
    logger.info('Request on /public/:resource was made');
    
    try {
        const resource = req.params.resource;
        
        const pathToResource = Path.join(__dirname, `public/${resource}`);

        if(FS.existsSync(pathToResource)) {
            logger.info(`Sending resource "${resource}"`);
            endResponse(res, statusCodes.OK, sendTypes.FILE, Path.join(__dirname, `public/${resource}`));
        } else {
            logger.warn(`Path "${pathToResource}" does not exist`);
            endResponse(res, statusCodes.BAD_REQUEST);
        }
    
    } catch(error) {
        logger.error(error);
        logger.trace();
        endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
    }
});

// TODO: Flesh out method to handle changing content headers
function endResponse(res, statusCode, sendType=undefined, sendContent=undefined) {

    try {
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
    } catch(error) {
        logger.error(`Something went wrong with logging an HTTP response\n${error}`);
        logger.trace();
    }

    try {
        // Set status code
        res.status(statusCode);

        // End the response appropriately
        if(sendType === undefined) {
            res.end();
        } else {
            if(sendContent === undefined) {
                logger.error('Send type was defined but send content was not. Ending response with no send content');
            } else if(sendType === sendTypes.FILE) {
                res.sendFile(sendContent);
            } else if(sendType === sendTypes.STRING) {
                res.send(sendContent);
            } else if(sendType === sendTypes.JSON) {
                res.json(sendContent);
            } else {
                logger.error(`Specified send type does not exist. Ending response with status code 
                ${statusCodes.INTERNAL_SERVER_ERROR} with no response content`);
                logger.trace();

                res.statusCode(statusCodes.INTERNAL_SERVER_ERROR).end();
            }
        }
    } catch(error) {
        logger.error(`Something went wrong in response sending logic\n${error}\nEnding response with status code 
        ${statusCodes.INTERNAL_SERVER_ERROR} with no response content`);
        logger.trace();

        res.status(statusCodes.INTERNAL_SERVER_ERROR).end();
    }
}
