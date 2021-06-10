//download module
//primarily used in ewpm, but can be forked and used in other projects
//exits on -1 on callback error, 1 on regular error, and 0 on no error.

const fs = require('fs');
var http;

module.exports = function(url, destination, filename, cb) {
    if(url.toString().startsWith('http://')){
        http = require('http');
    }
    else if(url.toString().startsWith('https://')){
        http = require('https');
    }
    try{
   http.get(url,(res) => {
       const filePath = fs.createWriteStream(destination + filename);
       res.pipe(filePath);
    filePath.on('finish',() => {
        filePath.close();
        try{cb()}
        catch(err){
            console.log("an error has occurred in callback:" + err);
            process.exit(-1);
        }
        process.exit(0);
    }); 
    });
    }
    catch(err){
        console.log(`An error has occurred: ${err}`);
        process.exit(1);
    }
}