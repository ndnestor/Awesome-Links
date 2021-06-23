// Module imports
const Airtable = require('airtable');

// Script imports
const logger = require('./global-logger');

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
        logger.info(`Updating record cache for "${tableName}"`)
        return new Promise((resolve, reject) => {
            try {
                let updatedRecords = [];

                // Select the desired table and loop through records
                airtableBase(tableName).select({
                    view: 'Grid view'
                }).eachPage((records, fetchNextPage) => {

                    records.forEach((record) => {
                        updatedRecords.push(record);
                    });
                    fetchNextPage();
                }).then(() => {

                    // Update the cache
                    cachedRecords[tableName] = updatedRecords;
                    resolve(updatedRecords);
                });
            } catch(error) {
                logger.error(`Could not update record for table "${tableName}"\n` +
                    `${error}`);
                logger.trace();
                reject(error);
            }
        });
    },

    // Returns an array of records by field value in specified table
    searchInField: function(tableName, fieldName, fieldValue, isExact) {
        logger.info(`Searching for record by field value\n` +
            `Looking for "${fieldValue}" in "${fieldName}" in "${tableName}"`);
        return new Promise((resolve, reject) => {
            try {
                let searchResults = [];

                // Check if table has been cached
                if(cachedRecords[tableName] !== undefined) {

                    // Loop through records in table
                    cachedRecords[tableName].forEach(record => {
                        // Find records that match the search query
                        //? Consider changing the search query later
                        if(isExact) {
                            if(record['fields'][fieldName] === fieldValue) {
                                searchResults.push(record);
                            }
                        } else {
                            if(typeof record['fields'][fieldName] === 'string') {
                                if(record[fieldName].contains(fieldValue)) {
                                    searchResults.push(record);
                                }
                            } else if(record['fields'][fieldName] === fieldValue) {
                                searchResults.push(record);
                            }
                        }
                    });
                } else {
                    logger.warn('Trying to search in a table that is not cached (and may not exist)');
                }

                resolve(searchResults);
            } catch(error) {
                logger.error(`Could not search for record by field value\n` +
                    `Looking for "${fieldValue}" in "${fieldName}" in "${tableName}"\n` +
                    `${error}`);
                logger.trace();
                reject(error);
            }
        });
    }
};

// Allow other files to use methods from this file
module.exports = methods;
