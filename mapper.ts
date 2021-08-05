export {};

// Module imports
const Https = require('https');
const FS = require('fs');

// Script imports
import { methods as airtableInterface } from './airtable-interface';
import { imageManipulator } from './image-manipulator';
import { methods as logger } from './global-logger';
import { statusCodes } from "./http-constants";

//const airtableInterface = require('./airtable-intereface.js');
const settings = require('./settings.js');

// Other variable declarations
const MARKER_ICON_PATH = './public/mapbox-marker.png'; // TODO: Move marker icon out of public folder
const MARKER_FONT_PATH = './fonts/Bahnschrift.fnt';
const MARKER_IMAGE_EXTENSION = 'png';
let cachedVisibleMarkers = [];

// Interface declarations
interface Location {
    Country: string,
    State: string,
    City: string
}

// On cached record callback setup
airtableInterface.addOnCacheCallback(() => methods.cacheVisibleMarkers());


// -- PUBLIC METHODS -- //

export class methods {

    // Returns a feature collection of markers for use with an interactive Mapbox map
    //! Has not been tested with markers that collapse together
    public static cacheVisibleMarkers() {
        logger.info('Caching visible markers');
        return new Promise<void>(async(resolve) => {
            let markerList = [];
            let getLocationCoordsPromises = [];

            // Get locations from Airtable interface
            const locations = airtableInterface.getCachedRecords('Locations');

            // Loop through every location and add a marker to the marker list
            locations.forEach((location: Location) => {

                // Remove all the extra data to simplify things
                location = location['fields'];

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

            // Save visible markers in cache
            cachedVisibleMarkers = getVisibleMarkers(markerFeatureCollection);

            // Create marker images as needed
            cachedVisibleMarkers.forEach((visibleMarker) => {
                const numChildMarkers = visibleMarker.childMarkers.length;
                const newMarkerImagePath = `./public/mapbox-markers/${numChildMarkers}.${MARKER_IMAGE_EXTENSION}`;
                if(numChildMarkers > 1 && !FS.existsSync(newMarkerImagePath)) {

                    // Create the marker image
                    imageManipulator.appendText(MARKER_ICON_PATH, MARKER_FONT_PATH, newMarkerImagePath, `${numChildMarkers}`);
                }
            });

            resolve();
        });
    }

    // Returns the cached visible markers
    public static getCachedVisibleMarkers() {
        return cachedVisibleMarkers;
    }
}


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

            if(res.statusCode !== statusCodes.OK) {
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

// Converts a Mapbox feature collection of markers into an array of visible markers
// TODO: Make interface for markers
function getVisibleMarkers(markers) {
    const visibleMarkers = [];
    const markerCollapseDistance = 1;

    markers.features.forEach((marker) => {
        const markerCoords = marker.geometry.coordinates;

        let createNewVisibleMarker = true;
        for(let i = 0; i < visibleMarkers.length; i++) {
            
            // Get distance between markers
            const markerDistance = distance(markerCoords, visibleMarkers[i].coordinates);
            if(markerDistance < markerCollapseDistance) {

                // Add location to pre-existing visible marker
                visibleMarkers[i].coordinates = averageCoordinates(visibleMarkers[i].coordinates, markerCoords);
                visibleMarkers[i].childMarkers.push(marker);
                createNewVisibleMarker = false;
            }                       
        }

        if(createNewVisibleMarker) {

            // Create new visible marker
            visibleMarkers.push({
                coordinates: markerCoords,
                childMarkers: [marker]
            });
        }
    });

    return visibleMarkers;
}

// Return the distance between point A and point B
function distance(pointA, pointB) {
    return Math.sqrt(Math.pow(pointA[0] - pointB[0], 2) + Math.pow(pointA[1] - pointB[1], 2));
}

// Return the averaged point of point A and point B
function averageCoordinates(pointA, pointB) {
    return [(pointA[0] + pointB[0]) / 2, (pointA[1] + pointB[1]) / 2];
}

function replaceAll(string, searchTarget, replacement) {
    return string.split(searchTarget).join(replacement);
}
