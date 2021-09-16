const fs = require('fs');
console.log("before copy");
copy();
console.log("after copy");

function copy() {
    fs.copyFileSync("config.json", "config-bkp.json", fs.constants.COPYFILE_EXCL);
}