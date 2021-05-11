//generates package and build script
const fs = require('fs');
const readline = require("readline");

module.exports = function(){
console.log("welcome to EwPM's package generator! I will guide you along the way to setup the package and its build script. \n Lets begin!");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.question("What is the name of the package? ", function(name) {
    console.log(`generating ${name}/ directory....`);
    fs.mkdirSync(`./${name}`);
    console.log(`generating ${name}'s package info file`);
    fs.writeFileSync(`./${name}/${name}.json`, `{ \n "build": "tar -cvzf ${name}.ew.tar.gz *"\n}` );
    console.log("created package info file!");
        rl.close();
});

rl.on("close", function() {
    console.log("\n package generating done, goodbye!");
    process.exit(0);
});
}
