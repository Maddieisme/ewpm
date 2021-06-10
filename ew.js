//todo: clean this up as this is really cluttered
const isRoot = process.getuid && process.getuid() === 0;
const fs = require('fs');
const tar = require('tar');

console.log("performing startup actions...");
if (!isRoot) return console.log("You must be root to excecute this command!");
if (!fs.existsSync("/etc/ew")) {fs.mkdirSync("/etc/ew"); console.log("created /etc/ew directory.")};
if (!fs.existsSync("/etc/ew/installed")) {fs.mkdirSync("/etc/ew/installed"); console.log("created /etc/ew/installed directory.")};
if (fs.existsSync("/etc/ew/lock")) return console.log("/etc/ew/lock exists, cancelling.");
if (!fs.existsSync("/etc/ew/modules.json")) {fs.writeFileSync('/etc/ew/modules.json', '{\n "core": "./modules/core.js", \n "pkggen": "./modules/pkggen.js", \n "sourceHandler": "./modules/sourcehandler.js" \n }'); console.log("created module config file.");}
if (!fs.existsSync('/etc/ew/sources.list')) {fs.writeFileSync("/etc/ew/sources.list", "https://ewsite.0tcqd.repl.co/packages.json"); console.log("created sources file.")};
fs.writeFileSync('/etc/ew/lock', `${process.argv}`);
try {
    console.log('loading modules....');
    const modsToLoad = require('/etc/ew/modules.json');
    console.log(modsToLoad);
}
catch(err){
    console.warn("An unknown error has occurred, exiting.." +  `\n more descriptive error: ${err}`);
} 

finally{
    fs.unlinkSync("/etc/ew/lock");
    process.exit(0);
}