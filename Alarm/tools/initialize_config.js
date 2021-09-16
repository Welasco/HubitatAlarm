const fs = require('fs');
const path = require("path");
// path.resolve(__dirname, "../file.xml")

function init() {
    try {
        fs.copyFileSync(path.resolve(__dirname, './config.json'), path.resolve(__dirname, '../config/config.json'), fs.constants.COPYFILE_EXCL);
        console.log('[initialize_config] config.json not found. Initializing config.json.')
    } catch (error) {
        //console.log('[initialize_config] Error initializing config.json. Error: '+error)
    }
}

module.exports.init = init;