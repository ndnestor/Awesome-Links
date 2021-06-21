const Express = require('express');
const BodyParser = require('body-parser');

const airtableInterface = require('./airtable-intereface.js');

const app = Express();
const port = 3000;

// Set up server
app.listen(port, () => {
    console.log("[========== The server is listening ==========]");
});

// -- REQUEST HANDLING -- //

// Test endpoint to see if the server is running
// May be changed to serve a different function later
app.all('/', async(req, res) => {
    console.log("Request on root was made");
    res.send("The server is running");
});

// Used for testing methods
app.all('/test', async(req, res) => {
    console.log("Test request was made");
    airtableInterface.updateRecords('Employees');
    res.end();
});
