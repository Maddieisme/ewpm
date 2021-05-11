//Download module
//uses some code copied from google

const fs = require('fs');
const http = require('https');

module.exports = async function(url, destination, filename, callback) {
    try{
   await http.get(url,(res) => {
       const filePath = fs.createWriteStream(destination + filename);
       res.pipe(filePath);
    filePath.on('finish',() => {
        filePath.close();
        try{callback()}
        catch(err){
            console.log("an error has occurred in callback:" + err);
        }
        return 0;
    }); 
    });
    }
    catch(err){
        console.error("an unknown error occurred in the download module:" + err);
        return -1;
    }
}