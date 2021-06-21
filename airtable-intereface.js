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
    searchInField: function(tableName, fieldName, fieldValue, isExact) {
        return new Promise((resolve, reject) => {
            try {
                let searchResults = [];

                if(cachedRecords[tableName] !== undefined) {
                    cachedRecords[tableName].forEach(record => {
                        if(isExact) {
                            if(record[fieldName] === fieldValue) {
                                searchResults.push(record);
                            }
                        } else {
                            if(typeof record[fieldName] === 'string') {
                                if(record[fieldName].contains(fieldValue)) {
                                    searchResults.push(record);
                                }
                            } else if(record[fieldName] === fieldValue) {
                                searchResults.push(record);
                            } else {
                                console.log('Record ' + record[fieldName] + ' does not match ' + fieldValue);
                            }
                        }
                    });
                } else {
                    console.log('Requested table has no entrees');
                }

                resolve(searchResults);
            } catch(error) {
                reject(error);
            }
        })
    }
};

// Allow other files to use methods from this file
module.exports = methods;
