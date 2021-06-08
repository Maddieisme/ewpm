//todo: clean this up as this is really cluttered
const isRoot = process.getuid && process.getuid() === 0;
const fs = require('fs');
const glob  = require('glob');
const tar = require('tar');

console.log("performing startup actions...");
if (!isRoot) return console.log("You must be root to excecute this command!");
if (!fs.existsSync("/etc/ew")) {fs.mkdirSync("/etc/ew"); console.log("created /etc/ew directory.")};
if (!fs.existsSync("/etc/ew/installed")) {fs.mkdirSync("/etc/ew/installed"); console.log("created /etc/ew/installed directory.")};
if (fs.existsSync("/etc/ew/lock")) return console.log("/etc/ew/lock exists, cancelling.");
if (!fs.existsSync('/etc/ew/sources.list')) {fs.writeFileSync("/etc/ew/sources.list", "https://ewsite.0tcqd.repl.co/packages.json"); console.log("created sources file.")};
fs.writeFileSync('/etc/ew/lock', ' ');

try{
    let cmd = process.argv[2];
    console.log('loading modules....');
     let events = {}
     //since the readdir func returns an array, we will turn it into an object
     glob.sync('./modules/*.js').forEach(function(file){
        let dash = file.split("/");
        if(dash.length == 3) {
            let dot = dash[2].split(".");
            if(dot.length == 2) {
                let key = dot[0];
                events[key] = require(file);
                console.log(`Loaded ${file}.`);
            }
        }
    });
    console.clear();
    //this converts the events object into an array of objects
    let funcs = Object.values(events);
    //most actions will be performed in the core module, so we will locate the core module
    let core = funcs.find(c => c.name === "core");
    core[cmd](process.argv[3]);
    //all functions in an export can be found by filtering through the keys

}
catch(err){
    console.warn("An unknown error has occurred, exiting.." +  `\n more descriptive error: ${err}`);
} 

finally{
    fs.unlinkSync("/etc/ew/lock");
    process.exit(0);
}