//differentiate between files and directories
//helps with removal of quite a few packages
fs = require('fs');

module.exports = function(item){
    let objectToCheck = fs.statSync(item);
    if(fs.isDirectory(objectToCheck)) return 1;
    else if(fs.isFile(objectToCheck)) return 0;
    else return undefined;
}