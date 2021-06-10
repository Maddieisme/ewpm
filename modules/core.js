//some imports
const fs = require('fs');
const tar = require('tar');
const download = require('./deps/download');
const dircheck = require('./deps/dirfiledif');

module.exports.name = "core"

module.exports.install = (async (package) => {
    //check if an argument has been specified
    this.package = package;
    if(!package) return console.log("please specify a package to install!");
    const packageList = require("/etc/ew/packages.json");

    let packageURL = packageList[this.package];
    //check if its a valid package aswell..
    if (!packageURL) return console.log("Invalid package specified, try doing sudo ew -r and see if it resolves the issue.");

    console.log(`Downloading ${package}... `);
    
    //use download module to download package
    download(packageURL, '/tmp/', `${package}.ew.tar.gz`, function(){
        console.log(`done!\n extracting ${package} to /...`);
        tar.extract({
            file: `/tmp/${package}.ew.tar.gz`,
            C: '/',
            sync: 'true'
        })
        
    fs.unlinkSync(`/tmp/${package}.ew.tar.gz`);
    process.stdout.write("done!\n"); 
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

        console.log(colors.green, `Successfully installed ${package} with ${installedCount} dependencies!`);
    }
    process.stdout.write("done!\n");
    process.stdout.write(`Successfully installed ${package}!\n`);
});
});

module.exports.uninstall = async function(package) {
    //check if a package to remove has been specified and return if it wasnt 
    if (!process.argv[3]) return console.log("Please specify a package to uninstall.");
    process.stdout.write(`removing ${package}...`);

    //check if the package json file is present, if not, we cannot remove it unfortunately. (alternative removal will be added in a future update)
    if (!fs.existsSync(`/etc/ew/packages/${package}.json`)) return console.log("Package JSON file does not exist, this means the package is already uninstalled.");

    //load the json file to read the dirs to delete
    let json = require(`/etc/ew/packages/${package}.json`);

    //assign a variable to the json object key named directoriesToDelete
    //this is required for all packages.
    let directories = json.directoriesToDelete;
    for (let i = 0; i <= directories.length; i++) {
        let directoryToRemove = directories.shift();
        directoryToRemove = directoryToRemove.toString();
        let diritem = dircheck(directoryToRemove);
        if(diritem == 0){
            fs.unlinkSync(directoryToRemove);
        }
        else if(diritem == 1){
            fs.rmdirSync(directoryToRemove);
        }
        }
    
        delete(directories[0]);

    process.stdout.write(`done!\n`);
    process.stdout.write(`Successfully uninstalled ${package}!\n`);
};

module.exports.packagelist = () => {
    //get the packages json file 
    const json = require('/etc/ew/packages.json');

    //print the number of packages available
    console.log(Object.keys(json).length + ' packages are available to be downloaded: ');

    //print the package list
    console.log(Object.keys(json));

}

module.exports = module.exports.install(process.argv[2]);