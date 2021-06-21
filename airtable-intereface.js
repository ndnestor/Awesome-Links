const Airtable = require('airtable');

// Set up airtable
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: 'keyaj98gem663YHBF' //! DO NOT share this API key
});
const airtableBase = Airtable.base('appCiX72O5Fc9qfOo');

const cachedRecords = {};

const methods = {
    // Returns an array of records in the specified table and updates record cache
    updateRecords: function(tableName) {
        return new Promise((resolve, reject) => {
            try {
                let updatedRecords = [];

                airtableBase(tableName).select({
                    view: "Grid view"
                }).eachPage((records, fetchNextPage) => {

                    records.forEach((record) => {
                        updatedRecords.push(record);
                    });
                    fetchNextPage();
                }).then(() => {
                    cachedRecords[tableName] = updatedRecords;
                    resolve(updatedRecords);
                });
            } catch(error) {
                reject(error);
            }
        })
    },

    // Returns an array of records by field value in specified table
    searchInField: function(tableName, fieldName, fieldValue) {
        cachedRecords[tableName].forEach(element => {
            console.log(element);
        });
    }
};

// Allow other files to use methods from this file
module.exports = methods;
