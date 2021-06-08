const download = require('./deps/download');
const fs = require('fs');


// asynchronous source handling

    module.exports.add = (async (url, cb) => {
       /*await download(url, '/etc/ew/sources', `/etc/ew/sources/${url}.json`, function(){
        let output = fs.readFileSync(`/etc/ew/sources/${url}.json`);
        console.log(output);
        fs.writeFileSync('/etc/ew/sources.json');
        cb();
       });
       */
      console.log('workie');
    });