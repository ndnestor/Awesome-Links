// Module imports
const Express = require('express');
const BodyParser = require('body-parser');

// Script imports
const airtableInterface = require('./airtable-intereface.js');
const logger = require('./global-logger.js');

// Other variable declarations
const app = Express();
const jsonParser = BodyParser.json();
const port = 3000;


// -- SERVER SETUP -- //

// Cache part of database
airtableInterface.cacheRecords('Employees');

// Allow connections to the server
app.listen(port, () => {
    logger.info(`The server is listening on port ${port}`);
});


// -- REQUEST HANDLING -- //

// Test endpoint to see if the server is running
// May be changed to serve a different function later
app.all('/', async(req, res) => {
    logger.info("Request on root was made");
    res.send("The server is running");
});

// Updates the record cache
app.put('/cache-records', jsonParser, async(req, res) => {
    logger.info('Request on /cache-records was made');

    const tableName = req.body["Table Name"];

    if(tableName === undefined) {
        logger.warn('Response status set to 400');
        res.status(400).end();
    }

    airtableInterface.cacheRecords(tableName).then((records) => {
        logger.info(`Sending response`);
        res.send(records);
    }).catch((error) => {
        logger.error(`Response status set to 500. Received error\n${error}`);
        res.status(500).end();
    });
});

// Searches for records in a table with a given (reliant on the record cache being up to date)
app.get('/search-records', jsonParser, async(req, res) => {
    logger.info('Request on /search-records was made');
    const tableName = req.body["Table Name"];
    const fieldName = req.body["Field Name"];
    const fieldValue = req.body["Field Value"];

    if(tableName === undefined || fieldName === undefined || fieldValue === undefined) {
        logger.warn('Response status set to 400');
        res.status(400).end();
    }

    // TODO: Considering making isExact dynamic
    airtableInterface.searchInField(tableName, fieldName, fieldValue, false).then((records) => {
        logger.info(`Sending response`);
        res.send(records);
    }).catch((error) => {
        logger.error(`Response status set to 500. Received error\n${error}`);
        res.status(500).end();
    });
});

// Adds record(s) to the given table
app.post('/add-record', jsonParser, async(req, res) => {
   logger.info('Request on /add-record was made');

   const tableName = req.body['Table Name'];
   const newRecords = req.body['New Records'];

   // TODO: Change database to reflect array values as plural

   airtableInterface.addRecords(tableName, newRecords).then((records) => {
       res.send(records);
   }).catch((error) => {
       logger.error(`Response status set to 500. Received error\n${error}`);
       res.status(500).end();
    });
});

// Deletes record(s) from the given table
app.delete('/delete-record', jsonParser, async(req, res) => {
    logger.info('Rest on /delete-record was made');

    const tableName = req.body['Table Name'];
    const recordIDs = req.body['Record IDs'];

    airtableInterface.deleteRecords(tableName, recordIDs).then((deletedRecords) => {
        res.send(deletedRecords);
    }).catch((error) => {
        logger.error(`Response status set to 500. Received error\n${error}`);
        res.status(500).end();
    });
});
