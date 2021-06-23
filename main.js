// Module imports
const Express = require('express');

// Script imports
const airtableInterface = require('./airtable-intereface.js');
const logger = require('./global-logger.js');

// Other variable declarations
const app = Express();
const port = 3000;


// -- SERVER SETUP -- //

// Initialization
airtableInterface.updateRecords('Employees');

// Allow connections to the server
app.listen(port, () => {
    logger.info(`[====== The server is listening on port ${port} ======]`);
});


// -- REQUEST HANDLING -- //

// Test endpoint to see if the server is running
// May be changed to serve a different function later
app.all('/', async(req, res) => {
    logger.info("Request on root was made");
    res.send("The server is running");
});

// Updates the record cache
app.get('/update-records', async(req, res) => {
    logger.info('Request on /update-records was made');
    airtableInterface.updateRecords('Employees').then((records) => {
        logger.info(`Sending response`);
        res.send(records);
    }).catch((error) => {
        // TODO: Send error codes and log it
        res.end();
    });
});

// Searches for records in a table with a given
app.get('/search-records', async(req, res) => {
    logger.info('Request on /search-records was made');
    airtableInterface.searchInField('Employees', 'First Name', 'Nathan', true).then((records) => {
        logger.info(`Sending response`);
        res.send(records);
    }).catch((error) => {
        // TODO: Send error codes and log it
        res.end();
    });
});
