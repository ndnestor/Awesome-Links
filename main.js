// Module imports
const Express = require('express');
const BodyParser = require('body-parser');
const Path = require('path');

// Script imports
const airtableInterface = require('./airtable-intereface.js');
const mapper = require('./mapper.js');
const logger = require('./global-logger.js');

// Other variable declarations
const app = Express();
const jsonParser = BodyParser.json();
const statusCodes = {
    // Success responses
    OK: 200,
    CREATED: 201,

    // Client errors
    BAD_REQUEST: 400,

    // Server errors
    INTERNAL_SERVER_ERROR: 500
};
const PORT = 8080;


// -- SERVER SETUP -- //

// Cache part of database
airtableInterface.cacheRecords('Employees').catch((error) => {
    logger.error(`Could not do initial record caching for Employees table due to error\n${error}`);
    logger.trace();
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
        logger.info('Sending response');
        res.status(statusCodes.OK).sendFile(Path.join(__dirname, '/html/index.html'));
    } catch(error) {
        endWithError(res, statusCodes.INTERNAL_SERVER_ERROR, error);
    }
});

// Updates the record cache
app.put('/cache-records', jsonParser, async(req, res) => {
    logger.info('Request on /cache-records was made');

    try {
        const tableName = req.body['Table Name'];

        if(tableName === undefined) {
            logger.warn('Response status set to 400');
            res.status(statusCodes.BAD_REQUEST).end();
        }

        airtableInterface.cacheRecords(tableName).then((records) => {
            logger.info(`Sending response`);
            res.status(statusCodes.OK).json(records);
        }).catch((error) => {
            endWithError(res, statusCodes.INTERNAL_SERVER_ERROR, error);
        });
    } catch(error) {
        endWithError(res, statusCodes.INTERNAL_SERVER_ERROR, error);
    }
});

// Searches for records in a table with a given (reliant on the record cache being up to date)
app.get('/search-records', jsonParser, async(req, res) => {
    logger.info('Request on /search-records was made');

    try {
        const tableName = req.body['Table Name'];
        const fieldName = req.body['Field Name'];
        const fieldValue = req.body['Field Value'];
        const isExact = req.body['Is Exact'];

        if(tableName === undefined || fieldName === undefined || fieldValue === undefined || isExact === undefined) {
            logger.warn('Response status set to 400');
            res.status(statusCodes.BAD_REQUEST).end();
        }

        airtableInterface.searchInField(tableName, fieldName, fieldValue, isExact).then((records) => {
            logger.info(`Sending response`);
            res.status(statusCodes.OK).json(records);
        }).catch((error) => {
            endWithError(res, statusCodes.INTERNAL_SERVER_ERROR, error);
        });
    } catch(error) {
        endWithError(res, statusCodes.INTERNAL_SERVER_ERROR, error);
    }
});

// Adds record(s) to the given table
app.post('/add-record', jsonParser, async(req, res) => {
   logger.info('Request on /add-record was made');

   try {
       const tableName = req.body['Table Name'];
       const newRecords = req.body['New Records'];

       airtableInterface.addRecords(tableName, newRecords).then((records) => {
           res.status(statusCodes.CREATED).json(records);
       }).catch((error) => {
           endWithError(res, statusCodes.INTERNAL_SERVER_ERROR, error);
       });
   } catch(error) {
       endWithError(res, statusCodes.INTERNAL_SERVER_ERROR, error);
   }
});

// Deletes record(s) from the given table
app.delete('/delete-record', jsonParser, async(req, res) => {
    logger.info('Request on /delete-record was made');

    try {
        const tableName = req.body['Table Name'];
        const recordIDs = req.body['Record IDs'];

        airtableInterface.deleteRecords(tableName, recordIDs).then((deletedRecords) => {
            logger.info('Sending response');
            res.status(statusCodes.OK).json(deletedRecords);
        }).catch((error) => {
            endWithError(res, statusCodes.INTERNAL_SERVER_ERROR, error);
        });
    } catch(error) {
        endWithError(res, statusCodes.INTERNAL_SERVER_ERROR, error);
    }
});

app.get('/map', async(req, res) => { // TODO: Change HTTP request method
    logger.info('Request on /map was made');

    try {
        mapper.getStaticMap().then(() => {
            logger.info('Sending response');
            res.status(statusCodes.CREATED).end();
        }).catch((error) => {
            endWithError(res, statusCodes.INTERNAL_SERVER_ERROR, error);
        });
    } catch(error) {
        endWithError(res, statusCodes.INTERNAL_SERVER_ERROR, error);
    }
});

app.get('/public/:resource', async(req, res) => { // TODO: Add try-catch
    logger.info('Request on /public/:resource was made');
    
    const resource = req.params.resource;
    logger.info(`Sending resource "${resource}"`);

    // TODO: Determine if path exists before sending response

    res.status(statusCodes.OK).sendFile(Path.join(__dirname, `public/${resource}`));
})

// Logs that an error occurred with stack trace and then sends error http response
function endWithError(res, statusCode, error) {
    // TODO: Try-catch this
    logger.error(`Response status set to ${statusCode}. Received error\n${error}`);
    logger.trace();
    res.status(statusCode).end();
}
