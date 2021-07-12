// Module imports
const https = require('https');
const FS = require('fs');

// Script imports
const logger = require('./global-logger.js');

// Other variable declarations
const employeeMapImagePath = `${__dirname}/public/employee-map.png`

// -- PUBLIC METHODS -- //

const methods = {
    // Saves a static map of America with locations marked where interns are
    // TODO: Add location functionality
    saveStaticMap: function(locations) {
        logger.info('Getting static map');
        return new Promise((resolve, reject) => {
            try {

                // Get the static map's URL
                const mapStyleUrl = 'https://api.mapbox.com/styles/v1/nathanawesomeinc/ckqtmukm70m0417mu72g1yeee/static/';
                const markerPath = 'pin-l-1+000(-74.00712,40.71455)/';
                const mapBoundsPath = '[-128.6095,21.4392,-60.6592,54.0095]/800x500?access_token=pk.eyJ1IjoibmF0aGFuYXdlc29tZWluYyIsImEiOiJja3F0bW9jMnkyNmdoMnZtejNjMTg0czRyIn0.x6imIZ-pCiJaIOMX3SdoQg';
                const mapUrl = mapStyleUrl + markerPath + mapBoundsPath;

                // Request the static map
                https.get(mapUrl, (res) => {
                    logger.info(`Static map response has status code "${res.statusCode}"`);

                    // Save the static map image as a file
                    const imageWriteStream = FS.createWriteStream(employeeMapImagePath);

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
