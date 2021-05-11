const isRoot = process.getuid && process.getuid() === 0;
const fs = require('fs');
const tar = require('tar');
const download = require('./modules/download');
const dircheck = require('./modules/dirfiledif');
const pkggen = require('./modules/pkggen');

console.log("performing startup actions...");
if (!isRoot) return console.log("You must be root to excecute this command!");
if (!fs.existsSync("/etc/ew")) {fs.mkdirSync("/etc/ew"); console.log("created /etc/ew directory.")};
if (!fs.existsSync("/etc/ew/installed")) {fs.mkdirSync("/etc/ew/installed"); console.log("created /etc/ew/installed directory.")};
if (fs.existsSync("/etc/ew/lock")) return console.log("/etc/ew/lock exists, cancelling.");
fs.writeFileSync('/etc/ew/lock', 'ew package manager lock\n');
console.log("created lock file.");
if (!fs.existsSync('/etc/ew/sources.list')) {fs.writeFileSync("/etc/ew/sources.list", " "); console.log("created sources file.")};
if (!fs.existsSync("/etc/ew/packages.json")) {
    console.log("package list file not found, reloading sources");
    updatePackageList();
};

try{
switch (process.argv[2]) {
    case ('reload'):
    case ('-r'):
        updatePackageList();
        break;
    case ('-i'):
    case ('install'):
        install(process.argv[3]);
        break;
    case ('-u'):
    case ('remove'):
        uninstall(process.argv[3]);
        break;
    case ('-pl'):
    case ('packagelist'):
        packagelist();
        break;
    case ('pkggen'):
        pkggen();
        break;
    case ('-h'):
    case ('help'):
    default:
        console.log("list of commands available for ew package manager:\n \n -r: reload package list\n upgrade: upgrade ewpm\n -i: installs a package\n -u: uninstalls a package\n -pl: shows the list of packages that can be installed\n -h: prints list of commands\n");
        break;
}
}

catch(err){
    console.warn("An unknown error has occurred, exiting.." +  `\n more descriptive error: ${err}`);
    fs.unlinkSync("/etc/ew/lock");
    return;
}

function updatePackageList() {
    process.stdout.write("Updating package list...");
   download("https://ewsite.0tcqd.repl.co/packages.json", '/etc/ew/', 'packages.json', function(){ return process.stdout.write('done!\n');});
};

async function install(package) {
    //check if an argument has been specified
    if(process.argv[4]) return console.log("please specify a package to install!");
    const packageList = require("/etc/ew/packages.json");

    let packageURL = packageList[package];
    //check if its a valid package aswell..
    if (!packageURL) return console.log("Invalid package specified, try doing sudo ew -r and see if it resolves the issue.");

    process.stdout.write(`Downloading ${package}... `);
    
    //use download module to download package
    await download(packageURL, '/tmp/', `${package}.ew.tar.gz`, function(){
        tar.extract({
            file: `/tmp/${package}.ew.tar.gz`,
            C: '/',
            sync: 'true'
        })
        fs.unlinkSync(`/tmp/${package}.ew.tar.gz`);
        process.stdout.write("done!\n"); 
    process.stdout.write(`Successfully installed ${package}!\n`);
    process.stdout.write('performing post install actions...');
    //do some dependency checking
    //check if json file exists
    if(!fs.existsSync(`/etc/ew/packages/${package}.json`)){
        console.warn("WARNING: package info file doesn't exist. Cannot perform post install actions, returning...");
        return;
    }
    const json = require(`/etc/ew/packages/${package}.json`);
    //the name of the object key for dependencies is depends
    if (json["depends"]) {
        switch (json.depends.length) {
            case 1:
                console.log(`this package requires ${json.depends.length} dependency, installing now...`);
                break;
            case json.depends.length > 1:
                console.log(`this package requires ${json.depends.length} dependencies, installing them now...`);
        }

        //do a for loop to install the package
        for (let i = 0; i <= json.depends.length; i++) {
            let installedCount = i;
            //get the first result of the array and shift the next dependency to the first result and convert it to a string
            let dependencies = json.depends;
           let dependencyToInstall = dependencies.shift();
            dependencyToInstall = dependencyToInstall.toString();
            //do a check to see if the package is already installed

            if (fs.existsSync(`/etc/ew/installed/${dependencyToInstall}.json`)) {
                console.log(`${dependencyToInstall} is already installed!`);
                //delete the object from the array
                delete(dependencies[0]);
                //continue the for loop for the other dependencies
                continue;
            }

            //install the dependency
            install(dependencyToInstall);
            //clear the spot in the array for another object 
            delete(dependencies[0]);
            installedCount++;
        }

        console.log(`Successfully installed ${package} with ${installedCount} dependencies!`);
    }
    process.stdout.write("done!\n");
});
};

function uninstall(package) {
    //check if a package to remove has been specified and return if it wasnt 
    if (!process.argv[3]) return console.log("Please specify a package to uninstall.");
    process.stdout.write(`removing ${package}...`);

    //check if the package json file is present, if not, we cannot remove it unfortunately. (alternative removal will be added in a future update)
    if (!fs.existsSync(`/etc/ew/packages/${package}.json`)) return console.log("Package JSON file does not exist, cannot remove.");

    //load the json file to read the dirs to delete
    let json = require(`/etc/ew/packages/${package}.json`);

    //assign a variable to the json object key named directoriesToDelete
    //this is required for all packages.
    let directories = json.directoriesToDelete;
    console.log(directories);
    for (let i = 0; i <= directories.length; i++) {
        let directoryToRemove = directories.shift();
        directoryToRemove = directoryToRemove.toString();
        let diritem = dircheck(directoryToRemove);
        if(diritem == 0){
            try{
            fs.unlinkSync(directoryToRemove);
            }
            catch(err){
                console.log(`${directoryToRemove} doesn't exist, continuing..`);
            }
        }
        else if(diritem == 1){
            try{
            fs.rmdirSync(directoryToRemove);
            }
            catch(err){
                console.log(`${directoryToRemove} doesn't exist, continuing..`);
            }
        }
        }
    
        delete(directories[0]);

    process.stdout.write(`done!\n`);
    process.stdout.write(`Successfully uninstalled ${package}!\n`);
}

function packagelist() {
    //get the packages json file 
    const json = require('/etc/ew/packages.json');

    //print the number of packages available
    console.log(Object.keys(json).length + ' packages are available to be downloaded: ');

    //print the package list
    console.log(Object.keys(json));

}

fs.unlinkSync('/etc/ew/lock');