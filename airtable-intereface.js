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

// Other variable declarations
const cachedRecords = {};
const MAX_DB_REQUESTS_PER_SECOND = 4; // Airtable can handle 5 with free version. Put 4 just to be safe

var timeSinceLastDbRequest = 1 / MAX_DB_REQUESTS_PER_SECOND * 1000 + 1; // In ms

// Increment timeSinceLastDbRequest every ms
setInterval(() => {
    timeSinceLastDbRequest++;
}, 1);


// -- PUBLIC METHODS -- //

const methods = {
    // Returns an array of records in the specified table and updates record cache
    cacheRecords: function(tableName) {
        logger.info(`Caching records for "${tableName}"`);
        return new Promise((resolve, reject) => {
            try {
                handleDbRequest(() => {
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
                }, reject);

            } catch(error) {
                logger.error(`Could not update record for table "${tableName}"\n${error}`);
                logger.trace();
                reject(error);
            }
        });
    },

    // Returns an array of records by field value in specified table
    searchInField: function(tableName, fieldName, fieldValue, isExact) {
        logger.info(`Searching for record by field value. ` +
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
                    `Looking for "${fieldValue}" in "${fieldName}" in "${tableName}"\n${error}`);
                logger.trace();
                reject(error);
            }
        });
    },

    // Add a record to the specified table
    addRecords: function(tableName, records) {
        logger.info(`Adding record to "${tableName}"`)
        return new Promise((resolve, reject) => {
            try {
                handleDbRequest(() => {
                    airtableBase(tableName).create(records, {typecast: true}).then((addedRecords) => {
                        resolve(addedRecords);
                    }).catch((error) => {
                        logger.error(`Could not add record to "${tableName}"\n${error}`);
                        logger.trace();
                        reject(error);
                    });
                }, reject);

            } catch(error) {
                logger.error(`Could not add record to "${tableName}"\n${error}`);
                logger.trace();
                reject(error);
            }
        });
    },

    // Deletes a record in the specified table
    deleteRecords: function(tableName, recordIDs) {
        logger.info(`Deleting record(s) from "${tableName}" with ID(s) "${recordIDs}"`);
        return new Promise((resolve, reject) => {
            try {
                handleDbRequest(() => {
                    airtableBase(tableName).destroy(recordIDs).then((deletedRecords) => {
                        resolve(deletedRecords);
                    }).catch((error) => {
                        logger.error(`Could not delete record(s) from "${tableName}" with ID(s) "${recordIDs}"\n${error}`);
                        logger.trace();
                        reject(error);
                    });
                }, reject);

            } catch(error) {
                logger.error(`Could not delete record(s) from "${tableName}" with ID(s) "${recordIDs}"\n${error}`);
                logger.trace();
                reject(error);
            }
        });
    }
};

// Allow other files to use methods from this file
module.exports = methods;


// -- PRIVATE METHODS --//

// Prevents database requests occurring too often
//! All database requests should be handled through this
//! Untested method
function handleDbRequest(method, reject) {
    try {
        // Check if we are sending requests too fast
        let timeoutTime = 0;
        if(timeSinceLastDbRequest < (1 / MAX_DB_REQUESTS_PER_SECOND) * 1000) {
            // Request was sent too fast. Wait some time before sending a new one
            logger.info('Deferring database request to prevent overload');
            timeoutTime = 1 / MAX_DB_REQUESTS_PER_SECOND - timeSinceLastDbRequest;
        }

        setTimeout(method, timeoutTime);

        // Reset timeSinceLastDbRequest
        timeSinceLastDbRequest = 0;

    } catch(error) {
        logger.error(`Error occurred while performing database request logic\n${error}`);
        logger.trace();
        reject(error);
    }
}
