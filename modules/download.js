//Download module
//uses some code copied from google

const fs = require('fs');
const http = require('https');

module.exports = function(url, destination, filename, callback) {
    try{
   http.get(url,(res) => {
       const filePath = fs.createWriteStream(destination + filename);
       res.pipe(filePath);
    filePath.on('finish',() => {
        filePath.close();
        return 0;
    }); 
    });
    try {
        callback()
        if(err) throw cberr;
    }
    catch(cberr){
        return console.log("callback returned an error");
    }
    }
    catch(err){
        console.error("an unknown error occurred in the download module:" + err);
        return -1;
    }
}