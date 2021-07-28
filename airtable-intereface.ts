// Module imports
const Airtable = require('airtable');

// Script imports
import { methods as logger } from './global-logger';

// Set up airtable
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: 'keyaj98gem663YHBF' //! DO NOT share this API key
});
const airtableBase = Airtable.base('appCiX72O5Fc9qfOo');

// Other variable declarations
const cachedRecords = {};
const tablesToCache = ['Employees', 'Locations'];
const DB_UPDATE_INTERVAL = 10000;
const MAX_DB_REQUESTS_PER_SECOND = 4; // Airtable can handle 5 with free version. Put 4 just to be safe

let timeSinceLastDbRequest = 1 / MAX_DB_REQUESTS_PER_SECOND * 1000 + 1; // In ms

// Increment timeSinceLastDbRequest every ms
setInterval(() => {
    timeSinceLastDbRequest++;
}, 1);

// Update cached records every so often
setInterval(() => {
    tablesToCache.forEach((tableName) => {
        // noinspection JSIgnoredPromiseFromCall
        methods.cacheRecords(tableName);
    });
}, DB_UPDATE_INTERVAL);


// -- PUBLIC METHODS -- //

const methods = {
    // Returns an array of records in the specified table and updates record cache
    cacheRecords: (tableName: string): Promise<object[]> => {
        logger.debug(`Caching records for "${tableName}"`);
        return new Promise((resolve) => {
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
                }).catch((error) => {
                    logger.error(`Could not update cached records due to error\n${error}`);
                });
            });
        });
    },

    // Return an array of records in the specified table synchronously
    // NOTE: Does not update the cache unlike cacheRecords()
    getCachedRecords: (tableName: string): object[] => {
        const result = cachedRecords[tableName];
        if(result === undefined) {
            logger.warn(`Table "${tableName}" has no cached records`);
        }
        return result;
    },

    // Returns an array of records by field value in specified table
    searchInField: (tableName: string, fieldName: string, fieldValue: any, isExact: boolean): Promise<object[]> => {
        logger.info(`Searching for record by field value. ` +
            `Looking for "${fieldValue}" in "${fieldName}" in "${tableName}"`);
        return new Promise((resolve, reject) => {
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
                logger.warn('Trying to search in a table that is not cached (and may not exist)')
                reject();
            }

            resolve(searchResults);
        });
    },

    // Add a record to the specified table
    addRecords: (tableName: string, records: object): Promise<object[]> => {
        logger.info(`Adding record to "${tableName}"`)
        return new Promise((resolve, reject) => {
            handleDbRequest(() => {
                airtableBase(tableName).create(records, {typecast: true}).then((addedRecords) => {
                    resolve(addedRecords);
                }).catch((error) => {
                    logger.error(`Could not add record to table "${tableName}"\n${error}`);
                    reject();
                });
            });
        });
    },

    // Deletes a record in the specified table
    deleteRecords: (tableName: string, recordIDs: string[]): Promise<object[]> => {
        logger.info(`Deleting record(s) from "${tableName}" with ID(s) "${recordIDs}"`);
        return new Promise((resolve, reject) => {
            handleDbRequest(() => {
                airtableBase(tableName).destroy(recordIDs).then((deletedRecords) => {
                    resolve(deletedRecords);
                }).catch((error) => {
                    logger.error(`Could not delete record(s) from "${tableName}" with ID(s) "${recordIDs}"\n${error}`);
                    reject();
                });
            });
        });
    }
};

// Allow other files to use methods from this file
module.exports = methods;


// -- PRIVATE METHODS --//

// Prevents database requests occurring too often
//! All database requests should be handled through this
function handleDbRequest(method): void {
    // Check if we are sending requests too fast
    let timeoutTime = 0;
    if(timeSinceLastDbRequest < (1 / MAX_DB_REQUESTS_PER_SECOND) * 1000) {
        // Request was sent too fast. Wait some time before sending a new one
        logger.debug('Deferring database request to prevent overload');
        timeoutTime = (1 / MAX_DB_REQUESTS_PER_SECOND) * 1000 - timeSinceLastDbRequest;
    }

    // Call the database request method when it is safe to do so
    setTimeout(method, timeoutTime);

    // Reset timeSinceLastDbRequest
    timeSinceLastDbRequest = 0;
}
