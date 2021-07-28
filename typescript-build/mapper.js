"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// Module imports
var Https = require('https');
var FS = require('fs');
// Script imports
var logger = require('./global-logger.js');
var airtableInterface = require('./airtable-intereface.js');
var settings = require('./settings.js');
// Other variable declarations
var EMPLOYEE_MAP_IMAGE_PATH = __dirname + "/public/employee-map.png";
var PIN_NAME = 'pin-l';
var PIN_LABEL = '1';
var PIN_COLOR = '000'; // Hexadecimal value
// -- PUBLIC METHODS -- //
var methods = {
    // Saves a static map of America with locations marked where interns
    //! This method is deprecated which is why it has one big try-catch block rather than specific error checks
    saveStaticMap: function () {
        logger.info('Getting static map');
        return new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
            var locations, mapStyleUrl, markerPath_1, getLocationCoordsPromises_1, mapBoundsPath, mapUrl, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        locations = airtableInterface.getCachedRecords('Locations');
                        mapStyleUrl = "https://api.mapbox.com/styles/v1/" + settings.MAPBOX_STYLE_KEY + "/static/";
                        markerPath_1 = '';
                        getLocationCoordsPromises_1 = [];
                        locations.forEach(function (location) {
                            // Remove all the extra data to simplify things
                            location = location.fields;
                            // Get location coordinates
                            getLocationCoordsPromises_1.push(getLocationCoords(location).then(function (coords) {
                                if (coords === undefined) {
                                    logger.warn("Could not mark location \"" + location + "\" because coordinates could not be obtained");
                                }
                                else {
                                    if (markerPath_1 !== '') {
                                        markerPath_1 += ',';
                                    }
                                    markerPath_1 += PIN_NAME + "-" + PIN_LABEL + "+" + PIN_COLOR + "(" + coords.x + "," + coords.y + ")";
                                }
                            }).catch(function (error) {
                                logger.error("Could not add location coords to marker path due to error\n" + error);
                                logger.trace();
                            }));
                        });
                        // Wait for promises to resolve
                        return [4 /*yield*/, Promise.all(getLocationCoordsPromises_1)];
                    case 1:
                        // Wait for promises to resolve
                        _a.sent();
                        markerPath_1 += '/';
                        mapBoundsPath = "[-128.6095,21.4392,-60.6592,54.0095]/800x500?access_token=" + settings.MAPBOX_TOKEN;
                        mapUrl = mapStyleUrl + markerPath_1 + mapBoundsPath;
                        // Request the static map
                        Https.get(mapUrl, function (res) {
                            logger.info("Static map response has status code \"" + res.statusCode + "\"");
                            // Save the static map image as a file
                            var imageWriteStream = FS.createWriteStream(EMPLOYEE_MAP_IMAGE_PATH);
                            res.pipe(imageWriteStream);
                            imageWriteStream.on('finish', function () {
                                imageWriteStream.close();
                                logger.info('Saved map image');
                            }).on('error', function (error) {
                                logger.error("Could not save map image due to error\n" + error);
                                logger.trace();
                                reject(error);
                            });
                            resolve(undefined);
                            // TODO: Fix the way errors are handled here
                        }).on('error', function (error) {
                            logger.error("Could not get static map due to error\n" + error);
                            logger.trace();
                            reject(error);
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        logger.error("Could not get static map due to error\n" + error_1);
                        logger.trace();
                        reject(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    },
    // Returns a feature collection of markers for use with an interactive Mapbox map
    getMarkers: function () {
        logger.info('Getting feature collection of markers');
        return new Promise(function (resolve) { return __awaiter(void 0, void 0, void 0, function () {
            var markerList, getLocationCoordsPromises, locations, markerFeatureCollection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        markerList = [];
                        getLocationCoordsPromises = [];
                        locations = airtableInterface.getCachedRecords('Locations');
                        // Loop through every location and add a marker to the marker list
                        locations.forEach(function (location) {
                            // Remove all the extra data to simplify things
                            location = location.fields;
                            // Add markers to marker list
                            getLocationCoordsPromises.push(getLocationCoords(location).then(function (coords) {
                                markerList.push({
                                    type: 'Feature',
                                    geometry: {
                                        type: 'Point',
                                        coordinates: [coords.x, coords.y]
                                    },
                                    properties: {
                                        title: 'Mapbox',
                                        description: location.City + ", " + location.State + ", " + location.Country
                                    }
                                });
                            }));
                        });
                        markerFeatureCollection = {
                            type: 'FeatureCollection',
                            features: []
                        };
                        // Wait for market list to be complete
                        return [4 /*yield*/, Promise.all(getLocationCoordsPromises)];
                    case 1:
                        // Wait for market list to be complete
                        _a.sent();
                        // Complete the Mapbox feature collection structure
                        markerFeatureCollection.features = markerList;
                        // Send marker collection
                        resolve(markerFeatureCollection);
                        return [2 /*return*/];
                }
            });
        }); });
    }
};
// Allow other files to use methods from this file
module.exports = methods;
// -- PRIVATE METHODS -- //
// Get the longitude and latitude of a location
function getLocationCoords(location) {
    return new Promise(function (resolve, reject) {
        // Prepare location for use in URL
        var country = replaceAll(location.Country.trim(), ' ', '+');
        var state = replaceAll(location.State.trim(), ' ', '+');
        var city = replaceAll(location.City.trim(), ' ', '+');
        var LOCATION_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + city + "+" + state + "+" + country + "\n                              .json?access_token=" + settings.MAPBOX_TOKEN;
        Https.get(LOCATION_URL, function (res) {
            logger.info("Location geocoding response has status code \"" + res.statusCode + "\"");
            // TODO: Consider making status codes a global setting
            if (res.statusCode !== 200) {
                logger.warn("Mapbox geocoding API for coordinates has response code \"" + res.statusCode + "\"");
                reject();
            }
            var geocodingData = '';
            res.on('data', function (dataChunk) {
                geocodingData += dataChunk;
            });
            res.on('end', function () {
                // Return the longitude-latitude coordinates of the location
                var center = JSON.parse(geocodingData).features[0]['center'];
                resolve({ x: center[0], y: center[1] });
            });
        }).on('error', function (error) {
            logger.warn("Could not get location geocoding information due to error\n" + error);
            reject();
        });
    });
}
function replaceAll(string, searchTarget, replacement) {
    return string.split(searchTarget).join(replacement);
}
//# sourceMappingURL=mapper.js.map