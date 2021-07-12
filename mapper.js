// Module imports
const https = require('https');

// Script imports
const logger = require('./global-logger.js');

const methods = {
    getStaticMap: function(locations) {
        logger.info('Getting static map');
        return new Promise((resolve, reject) => {
            try {
                const mapUrl = `https://api.mapbox.com/styles/v1/nathanawesomeinc/ckqtmukm70m0417mu72g1yeee/static/pin-s-1+000(40.7,-74)/[-116.4159,29.7115,-78.9931,47.8859]/709x426?access_token=pk.eyJ1IjoibmF0aGFuYXdlc29tZWluYyIsImEiOiJja3F0bW9jMnkyNmdoMnZtejNjMTg0czRyIn0.x6imIZ-pCiJaIOMX3SdoQg`

                https.get(mapUrl, (res) => {
                    logger.info(`Static map response has status code "${res.statusCode}"`);

                    let mapImage = ''

                    res.on('data', (dataChunk) => {
                        mapImage += dataChunk;
                    });

                    res.on('end', () => {
                        resolve(mapImage);
                    });

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

//methods.getStaticMap();

module.exports = methods;
