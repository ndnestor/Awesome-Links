export {};

// Module imports
const Https = require('https');
const FS = require('fs');

// Script imports
const logger = require('./global-logger.js');
const airtableInterface = require('./airtable-intereface.js');
const settings = require('./settings.js');

// Other variable declarations
const EMPLOYEE_MAP_IMAGE_PATH = `${__dirname}/public/employee-map.png`;
const PIN_NAME = 'pin-l';
const PIN_LABEL = '1';
const PIN_COLOR = '000'; // Hexadecimal value

// Interface declarations
interface Location {
    Country: string,
    State: string,
    City: string
}


// -- PUBLIC METHODS -- //

const methods = {
    // Saves a static map of America with locations marked where interns
    //! This method is deprecated which is why it has one big try-catch block rather than specific error checks
    saveStaticMap: () => {
        logger.info('Getting static map');
        return new Promise(async (resolve, reject) => {
            try {

                // Get locations from Airtable using the Airtable interface
                const locations = airtableInterface.getCachedRecords('Locations');

                // Get the static map's URL
                const mapStyleUrl = `https://api.mapbox.com/styles/v1/${settings.MAPBOX_STYLE_KEY}/static/`;

                let markerPath = '';
                let getLocationCoordsPromises = [];
                locations.forEach((location) => {

                    // Remove all the extra data to simplify things
                    location = location.fields;

                    // Get location coordinates
                    getLocationCoordsPromises.push(getLocationCoords(location).then((coords) => {
                        if(coords === undefined) {
                            logger.warn(`Could not mark location "${location}" because coordinates could not be obtained`);
                        } else {
                            if(markerPath !== '') {
                                markerPath += ',';
                            }
                            markerPath += `${PIN_NAME}-${PIN_LABEL}+${PIN_COLOR}(${coords.x},${coords.y})`;
                        }
                    }).catch((error) => {
                        logger.error(`Could not add location coords to marker path due to error\n${error}`);
                        logger.trace();
                    }));
                });

                // Wait for promises to resolve
                await Promise.all(getLocationCoordsPromises);


                markerPath += '/';

                const mapBoundsPath = `[-128.6095,21.4392,-60.6592,54.0095]/800x500?access_token=${settings.MAPBOX_TOKEN}`;
                const mapUrl = mapStyleUrl + markerPath + mapBoundsPath;

                // Request the static map
                Https.get(mapUrl, (res) => {
                    logger.info(`Static map response has status code "${res.statusCode}"`);

                    // Save the static map image as a file
                    const imageWriteStream = FS.createWriteStream(EMPLOYEE_MAP_IMAGE_PATH);

                    res.pipe(imageWriteStream);

                    imageWriteStream.on('finish', () => {
                        imageWriteStream.close();
                        logger.info('Saved map image');

                    }).on('error', (error) => {
                        logger.error(`Could not save map image due to error\n${error}`);
                        logger.trace();
                        reject(error);
                    });

                    resolve(undefined);

                    // TODO: Fix the way errors are handled here
                }).on('error', (error) => {
                    logger.error(`Could not get static map due to error\n${error}`);
                    logger.trace();
                    reject(error);
                });
            } catch(error) {
                logger.error(`Could not get static map due to error\n${error}`);
                logger.trace();
                reject(error);
            }
        });
    },

    // Returns a feature collection of markers for use with an interactive Mapbox map
    getMarkers: () => {
        logger.info('Getting feature collection of markers');
        return new Promise(async(resolve) => {
            let markerList = [];
            let getLocationCoordsPromises = [];

            // Get locations from Airtable interface
            const locations = airtableInterface.getCachedRecords('Locations');

            // Loop through every location and add a marker to the marker list
            locations.forEach((location) => {

                // Remove all the extra data to simplify things
                location = location.fields;

                // Add markers to marker list
                getLocationCoordsPromises.push(getLocationCoords(location).then((coords) => {
                    markerList.push({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [coords.x, coords.y]
                        },
                        properties: {
                            title: 'Mapbox',
                            description: `${location.City}, ${location.State}, ${location.Country}`
                        }
                    });
                }));
            });

            // Create the Mapbox feature collection structure
            const markerFeatureCollection = {
                type: 'FeatureCollection',
                features: []
            }

            // Wait for market list to be complete
            await Promise.all(getLocationCoordsPromises);

            // Complete the Mapbox feature collection structure
            markerFeatureCollection.features = markerList;

            // Send marker collection
            resolve(markerFeatureCollection);
        });
    }
}

// Allow other files to use methods from this file
module.exports = methods;


// -- PRIVATE METHODS -- //

// Get the longitude and latitude of a location
function getLocationCoords(location: Location ): Promise<{ x: Number, y: Number }> {
    return new Promise((resolve, reject) => {

        // Prepare location for use in URL
        const country = replaceAll(location.Country.trim(), ' ', '+');
        const state = replaceAll(location.State.trim(), ' ', '+');
        const city = replaceAll(location.City.trim(), ' ', '+');

        const LOCATION_URL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${city}+${state}+${country}
                              .json?access_token=${settings.MAPBOX_TOKEN}`;

        Https.get(LOCATION_URL, (res) => {
            logger.info(`Location geocoding response has status code "${res.statusCode}"`);

            // TODO: Consider making status codes a global setting
            if(res.statusCode !== 200) {
                logger.warn(`Mapbox geocoding API for coordinates has response code "${res.statusCode}"`);
                reject();
            }

            let geocodingData = '';
            res.on('data', (dataChunk) => {
                geocodingData += dataChunk;
            });

            res.on('end', () => {
                // Return the longitude-latitude coordinates of the location
                let center = JSON.parse(geocodingData).features[0]['center'];
                resolve({ x: center[0], y: center[1] });
            });

        }).on('error', (error) => {
            logger.warn(`Could not get location geocoding information due to error\n${error}`);
            reject();
        });
    });
}

function replaceAll(string, searchTarget, replacement) {
    return string.split(searchTarget).join(replacement);
}
