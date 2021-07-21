// TODO: Consider removing this file
// Create settings object
const logger = require("./global-logger.js");
const settings = {};

// Mapbox settings
addProperty('MAPBOX_TOKEN', 'pk.eyJ1IjoibmF0aGFuYXdlc29tZWluYyIsImEiOiJja3F0bW9jMnkyNmdoMnZtejNjMTg0czRyIn0.x6imIZ-pCiJaIOMX3SdoQg');
addProperty('MAPBOX_STYLE_KEY', 'nathanawesomeinc/ckqtmukm70m0417mu72g1yeee');

// TODO: Allow for adding multiple properties at once with an array
// TODO: Consider adding something for intellij/ intellisense to recognize added properties
// TODO: Write description comment here
function addProperty(key, value) {

    // Create read-only properties
    Object.defineProperty(settings, key, {
        value: value,
        enumerable: true
    });
}

// Allow other files to use methods from this file
module.exports = settings;
