//differentiate between files and directories
//helps with removal of quite a few packages
fs = require('fs');

module.exports = function(item){
    try{
    let objectToCheck = fs.statSync(item);
    if(fs.statSync(item).isDirectory()) return 1;
    else if(fs.statSync(item).isFile()) return 0;
    }
    catch(err){
        return undefined;
    }
}