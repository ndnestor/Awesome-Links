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
var _this = this;
// Module imports
var Express = require('express');
var Path = require('path');
var FS = require('fs');
// Script imports
var logger = require('./global-logger.js');
var airtableInterface = require('./airtable-intereface.js');
var mapper = require('./mapper.js');
require('./console-interface.js');
// Other variable declarations
var app = Express();
var statusCodes = {
    // Success responses
    OK: 200,
    CREATED: 201,
    // Client errors
    BAD_REQUEST: 400,
    // Server errors
    INTERNAL_SERVER_ERROR: 500
};
var sendTypes = {
    STRING: 1,
    FILE: 2,
    JSON: 3
};
var PORT = 8080;
// -- SERVER SETUP -- //
// Allow Express to parse JSON
app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());
// Cache part of database
airtableInterface.cacheRecords('Employees').catch(function () {
    logger.error("Could not do initial record caching for Employees table");
});
airtableInterface.cacheRecords('Locations').catch(function () {
    logger.error("Could not do initial record caching for Locations table");
});
// Allow connections to the server
app.listen(PORT, function () {
    logger.info("The server is listening on port \"" + PORT + "\"");
});
// -- REQUEST HANDLING -- //
// Sends the root html file
app.all('/', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        logger.info('Request on root was made');
        try {
            endResponse(res, statusCodes.OK, sendTypes.FILE, Path.join(Path.join(__dirname, '/html/index.html')));
        }
        catch (error) {
            logger.error(error);
            logger.trace();
            endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
        }
        return [2 /*return*/];
    });
}); });
// Updates the record cache
app.put('/cache-records', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var tableName;
    return __generator(this, function (_a) {
        logger.info('Request on /cache-records was made');
        try {
            tableName = req.body['Table Name'];
            if (tableName === undefined) {
                endResponse(res, statusCodes.BAD_REQUEST);
            }
            airtableInterface.cacheRecords(tableName).then(function (records) {
                endResponse(res, statusCodes.OK, sendTypes.JSON, records);
            }).catch(function () {
                endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
            });
        }
        catch (error) {
            logger.error(error);
            logger.trace();
            endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
        }
        return [2 /*return*/];
    });
}); });
// Searches for records in a table with a given (reliant on the record cache being up to date)
app.get('/search-records', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var tableName, fieldName, fieldValue, isExact;
    return __generator(this, function (_a) {
        logger.info('Request on /search-records was made');
        try {
            tableName = req.body['Table Name'];
            fieldName = req.body['Field Name'];
            fieldValue = req.body['Field Value'];
            isExact = req.body['Is Exact'];
            if (tableName === undefined || fieldName === undefined || fieldValue === undefined || isExact === undefined) {
                endResponse(res, statusCodes.BAD_REQUEST);
            }
            airtableInterface.searchInField(tableName, fieldName, fieldValue, isExact).then(function (records) {
                endResponse(res, statusCodes.OK, sendTypes.JSON, records);
            }).catch(function () {
                endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
            });
        }
        catch (error) {
            logger.error(error);
            logger.trace();
            endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
        }
        return [2 /*return*/];
    });
}); });
// Adds record(s) to the given table
app.post('/add-record', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var tableName, newRecords;
    return __generator(this, function (_a) {
        logger.info('Request on /add-record was made');
        try {
            tableName = req.body['Table Name'];
            newRecords = req.body['New Records'];
            airtableInterface.addRecords(tableName, newRecords).then(function (records) {
                endResponse(res, statusCodes.CREATED, sendTypes.JSON, records);
            }).catch(function () {
                endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
            });
        }
        catch (error) {
            logger.error(error);
            logger.trace();
            endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
        }
        return [2 /*return*/];
    });
}); });
// Deletes record(s) from the given table
app.delete('/delete-record', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var tableName, recordIDs;
    return __generator(this, function (_a) {
        logger.info('Request on /delete-record was made');
        try {
            tableName = req.body['Table Name'];
            recordIDs = req.body['Record IDs'];
            airtableInterface.deleteRecords(tableName, recordIDs).then(function (deletedRecords) {
                endResponse(res, statusCodes.OK, sendTypes.JSON, deletedRecords);
            }).catch(function () {
                endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
            });
        }
        catch (error) {
            logger.error(error);
            logger.trace();
            endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
        }
        return [2 /*return*/];
    });
}); });
// Updates the static map image
app.put('/update-map', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        logger.info('Request on /update-map was made');
        try {
            mapper.saveStaticMap().then(function () {
                endResponse(res, statusCodes.CREATED);
            }).catch(function () {
                endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
            });
        }
        catch (error) {
            logger.error(error);
            logger.trace();
            endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
        }
        return [2 /*return*/];
    });
}); });
// Sends Mapbox marker feature collection for use with interactive map
app.get('/markers', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        logger.info('Request on /markers was made');
        try {
            mapper.getMarkers().then(function (markers) {
                endResponse(res, statusCodes.OK, sendTypes.JSON, markers);
            }).catch(function () {
                endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
            });
        }
        catch (error) {
            logger.error(error);
            logger.trace();
            endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
        }
        return [2 /*return*/];
    });
}); });
// Sends a file given a path from the public folder
app.get('/public/:resource', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var resource, pathToResource;
    return __generator(this, function (_a) {
        logger.info('Request on /public/:resource was made');
        try {
            resource = req.params.resource;
            pathToResource = Path.join(__dirname, "public/" + resource);
            if (FS.existsSync(pathToResource)) {
                logger.info("Sending resource \"" + resource + "\"");
                endResponse(res, statusCodes.OK, sendTypes.FILE, Path.join(__dirname, "public/" + resource));
            }
            else {
                logger.warn("Path \"" + pathToResource + "\" does not exist");
                endResponse(res, statusCodes.BAD_REQUEST);
            }
        }
        catch (error) {
            logger.error(error);
            logger.trace();
            endResponse(res, statusCodes.INTERNAL_SERVER_ERROR);
        }
        return [2 /*return*/];
    });
}); });
// TODO: Flesh out method to handle changing content headers
function endResponse(res, statusCode, sendType, sendContent) {
    if (sendType === void 0) { sendType = undefined; }
    if (sendContent === void 0) { sendContent = undefined; }
    try {
        // Send log message based on status code
        var logMessageToSend = '';
        logMessageToSend += "Ending response with status code " + statusCode;
        switch (statusCode.toString()[0]) {
            case '2':
                // 200s - success status codes
                logMessageToSend += '. This is a success code';
                logger.info(logMessageToSend);
                break;
            case '4':
                // 400s - client error status codes
                logMessageToSend += '. This is a client error code';
                logger.warn(logMessageToSend);
                break;
            case '5':
                // 500s - server error status codes
                logMessageToSend += '. This is a server error code';
                logger.error(logMessageToSend);
                break;
            default:
                logMessageToSend += '. This status code family is not set up properly for logging';
                logger.warn(logMessageToSend);
        }
    }
    catch (error) {
        logger.error("Something went wrong with logging an HTTP response\n" + error);
        logger.trace();
    }
    try {
        // Set status code
        res.status(statusCode);
        // End the response appropriately
        if (sendType === undefined) {
            res.end();
        }
        else {
            if (sendContent === undefined) {
                logger.error('Send type was defined but send content was not. Ending response with no send content');
            }
            else if (sendType === sendTypes.FILE) {
                res.sendFile(sendContent);
            }
            else if (sendType === sendTypes.STRING) {
                res.send(sendContent);
            }
            else if (sendType === sendTypes.JSON) {
                res.json(sendContent);
            }
            else {
                logger.error("Specified send type does not exist. Ending response with status code \n                " + statusCodes.INTERNAL_SERVER_ERROR + " with no response content");
                logger.trace();
                res.statusCode(statusCodes.INTERNAL_SERVER_ERROR).end();
            }
        }
    }
    catch (error) {
        logger.error("Something went wrong in response sending logic\n" + error + "\nEnding response with status code \n        " + statusCodes.INTERNAL_SERVER_ERROR + " with no response content");
        logger.trace();
        res.status(statusCodes.INTERNAL_SERVER_ERROR).end();
    }
}
//# sourceMappingURL=main.js.map