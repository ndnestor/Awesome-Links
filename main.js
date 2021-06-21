const Express = require('express');

const airtableInterface = require('./airtable-intereface.js');

const app = Express();
const port = 3000;

// Set up server
app.listen(port, () => {
    console.log("[========== The server is listening ==========]");
    airtableInterface.updateRecords('Employees');
});

// -- REQUEST HANDLING -- //

// Test endpoint to see if the server is running
// May be changed to serve a different function later
app.all('/', async(req, res) => {
    console.log("Request on root was made");
    res.send("The server is running");
});

// Updates the record cache
app.get('/update-records', async(req, res) => {
    console.log('/update-records');
    airtableInterface.updateRecords('Employees').then((records) => {
        res.send(records);
    }).catch((error) => {
        console.log(error);
        res.end();
    });
});

// Searches for records in a table with a given
app.get('/search-records', async(req, res) => {
    console.log('/search-records');
    airtableInterface.searchInField('Employees', 'First Name', 'Nathan', true).then((records) => {
        res.send(records);
    }).catch((error) => {
        console.log(error);
        res.end();
    });
});
