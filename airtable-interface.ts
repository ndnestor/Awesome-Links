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
const TABLES_TO_CACHE = ['Employees', 'Locations'];
const CACHE_UPDATE_INTERVAL = 10000; // In ms
const MAX_DB_REQUESTS_PER_SECOND = 4; // Airtable can handle 5 with free version. Put 4 just to be safe
const onCacheUpdateCallbacks = [];
let timeSinceLastDbRequest; // In ms

// Increment timeSinceLastDbRequest every ms
setInterval(() => {
    timeSinceLastDbRequest++;
}, 1);

// Update cached records every so often
setInterval(() => {
    TABLES_TO_CACHE.forEach((tableName) => {

        // Cache records
        const oldCachedRecords = cachedRecords;
        methods.cacheRecords(tableName).then((updatedRecords) => {

            // Call a bunch of methods as needed if the records in cache have changed
            if(oldCachedRecords != cachedRecords) {
                onCacheUpdateCallbacks.forEach((method) => {
                    method();
                });
            }
        });
    });
}, CACHE_UPDATE_INTERVAL);


// -- PUBLIC METHODS -- //

export class methods {
    // Returns an array of records in the specified table and updates the record cache
    public static cacheRecords(tableName: string): Promise<object[]> {
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
    }

    // Return an array of records in the specified table synchronously
    // NOTE: Does not update the cache unlike cacheRecords()
    public static getCachedRecords(tableName: string): object[] {
        const result = cachedRecords[tableName];
        if(result === undefined) {
            logger.warn(`Table "${tableName}" has no cached records`);
        }
        return result;
    }

    // Returns an array of records by field value in the specified table
    public static searchInField(tableName: string, fieldName: string, fieldValue: any, isExact: boolean): Promise<object[]> {
        logger.info(`Searching for record by field value. ` +
            `Looking for "${fieldValue}" in "${fieldName}" in "${tableName}"`);
        return new Promise((resolve, reject) => {
            let searchResults = [];

            // Check if table has been cached
            if(cachedRecords[tableName] !== undefined) {

                // Loop through records in table
                cachedRecords[tableName].forEach(record => {
                    // Find records that match the search query
                    //? Consider changing the search query
                    if(!isExact && typeof record['fields'][fieldName] === 'string') {
                        if(record[fieldName].contains(fieldValue)) {
                            searchResults.push(record);
                        }
                    } else {
                        if(record['fields'][fieldName] === fieldValue) {
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
    }

    // Add a record to the specified table
    public static addRecords(tableName: string, records: object): Promise<object[]> {
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
    }

    // Delete records in the specified table using record IDs
    public static deleteRecords(tableName: string, recordIDs: string[]): Promise<object[]> {
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

    // Adds an item to the onCacheCallbacks array
    public static addOnCacheCallback(method: () => void): void {
        onCacheUpdateCallbacks.push(method);
    }
}


// -- PRIVATE METHODS --//

// Prevents database requests occurring too often
//! All database requests should be handled through this
// TODO: Determine if this method works when multiple requests are deferred at once. It probably does not
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
