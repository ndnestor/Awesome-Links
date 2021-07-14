// Module imports
const Https = require('https');
const FS = require('fs');

// Script imports
const logger = require('./global-logger.js');

// Other variable declarations
//! Do not share the mapbox access token TODO: Implement this
const MAPBOX_TOKEN = 'pk.eyJ1IjoibmF0aGFuYXdlc29tZWluYyIsImEiOiJja3F0bW9jMnkyNmdoMnZtejNjMTg0czRyIn0.x6imIZ-pCiJaIOMX3SdoQg';
const EMPLOYEE_MAP_IMAGE_PATH = `${__dirname}/public/employee-map.png`;
const PIN_NAME = 'pin-l';
const PIN_LABEL = '1';
const PIN_COLOR = '000'; // Hexadecimal value

// -- PUBLIC METHODS -- //

const methods = {
    // Saves a static map of America with locations marked where interns are
    // TODO: Add location functionality
    saveStaticMap: function(locations) {
        logger.info('Getting static map');
        return new Promise(async (resolve, reject) => {
            try {
                //! Placeholder. Should be removed later
                locations = [{country: 'United States', state: 'Kentucky', city: 'Lexington'}];

                // Get the static map's URL
                const mapStyleUrl = 'https://api.mapbox.com/styles/v1/nathanawesomeinc/ckqtmukm70m0417mu72g1yeee/static/';

                let markerPath = '';
                let getLocationCoordsPromises = [];
                locations.forEach((location) => {
                    getLocationCoordsPromises.push(getLocationCoords(location).then((coords) => {
                        if(coords === undefined) {
                            // TODO: Possibly add the specific location in the log
                            logger.warn('Could not mark location because coordinates could not be obtained');
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

                // TODO: Determine if I need anything besides await Promise.all();
                let checkingTime = 1000; // TODO: Make global constant?
                while(!await Promise.all(getLocationCoordsPromises)) {
                    logger.debug('Waiting for promises');
                    await function () {
                        return new Promise((resolve) => setTimeout(resolve, checkingTime))
                    };
                }
                logger.debug('Promises completed');
                markerPath += '/';
                logger.debug(markerPath);

                //const markerPath = 'pin-l-1+000(-74.00712,40.71455)/';
                const mapBoundsPath = `[-128.6095,21.4392,-60.6592,54.0095]/800x500?access_token=${MAPBOX_TOKEN}`;
                const mapUrl = mapStyleUrl + markerPath + mapBoundsPath;
                logger.debug(mapUrl);

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

                    resolve();

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
    }
}

// Allow other files to use methods from this file
module.exports = methods;

// -- PRIVATE METHODS -- //

// Get the longitude and latitude of a location
function getLocationCoords(location) {
    return new Promise((resolve, reject) => {
        try {
            // TODO: Check if location is well formatted (no white spaces at the end, etc)
            // Prepare location for use in URL
            const country = replaceAll(location.country, ' ', '+');
            const state = replaceAll(location.state, ' ', '+');
            const city = replaceAll(location.city, ' ', '+');

            // TODO: Shorten this line
            const LOCATION_URL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${city}+${state}+${country}.json?access_token=${MAPBOX_TOKEN}`;

            Https.get(LOCATION_URL, (res) => {
                logger.info(`Location geocoding response has status code "${res.statusCode}"`);

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
                logger.error(`Could not get location geocoding information due to error\n${error}`);
                logger.trace();
                reject(error);
            });
        } catch(error) {
            logger.error(`Could not get location geocoding information due to error\n${error}`);
            logger.trace();
            reject(error);
        }
    });
}

function replaceAll(string, searchTarget, replacement) {
    return string.split(searchTarget).join(replacement);
}
