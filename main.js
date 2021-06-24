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
airtableInterface.cacheRecords('Employees');

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
app.get('/cache-records', async(req, res) => {
    logger.info('Request on /cache-records was made');
    airtableInterface.cacheRecords('Employees').then((records) => {
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

// Adds record(s) to the given table
app.get('/add-record', async(req, res) => {
   logger.info('Request on /add-record was made');
   const newRecord = {};
   newRecord['fields'] = {};
   const fields = newRecord['fields'];
   fields['First Name'] = 'John';
   fields['Last Name'] = 'Doe';
   fields['Is Intern'] = true;
   fields['Is Current Employee'] = true;
   fields['Nickname'] = '';
   fields['Birthday'] = '2000-01-20';
   // TODO: Change database to reflect array values as plural
   fields['Email'] = ['recAQEocPLU7y3cLs'];
   fields['Phone'] = ['recGx1QuzIblMY7gG'];
   fields['Position'] = 'Test Dummy';
   fields['Jobs'] = ['recCyh1l0kr0tkhzu'];
   fields['Description'] = 'A test persons for the database';
   fields['Employed Time'] = ['recQlfWTCGIcjH08r'];

   airtableInterface.addRecords('Employees', [newRecord]).then((records) => {
       res.send(records);
   }).catch((error) => {
       // TODO: Send error codes and log it
        res.end();
    });
});

// Deletes record(s) from the given table
app.get('/delete-record', async(req, res) => {
    logger.info('Rest on /delete-record was made');
    airtableInterface.deleteRecords('Employees', ['rec9dDQuQHFEbhxa8']).then((deletedRecords) => {
        res.send(deletedRecords);
    }).catch((error) => {
        // TODO: Send error codes and log it
        res.end();
    });
});
