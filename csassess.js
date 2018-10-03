var request = require('request');
var exif = require('get-exif');
var fs = require('fs');
var AdmZip = require('adm-zip');
var sortBy = require('array-sort-by');
const IMAGES_PATH = './images';
const ZIP_NAME = './images.zip';
const EXIF_ISO_ID = '34855'

var zipStream = fs.createWriteStream(ZIP_NAME);
//fetch the file with no special permissions
try {
    request
        .get('http://dataservices.campbellsci.ca/uploads/Photos To Review.zip')
        .on('response', function (response) {
            if (response && response.statusCode != 200) {
                console.error(response.statusMessage);
            }           
        })
        .pipe(zipStream);
} catch (e) {
    console.error('Download problem', e);
}

zipStream.on('close', function () {
    var imgZip;
    try {
        //when finished, build up the zip manager object
        imgZip = new AdmZip(ZIP_NAME);
        //overwrite the current images directory with whatever was downloaded
        //could just stream entry directly, but need the files on disk
        imgZip.extractAllTo(IMAGES_PATH, true); // synchronous
        if (fs.lstatSync(IMAGES_PATH).isDirectory()){
            fs.readdir(IMAGES_PATH, function(err, files) {
                var fileIsoVals = [files.length];
                files.forEach(function (name, index) {
                    //synchronous pull out buffer then get exif
                    var exifData = exif(fs.readFileSync(IMAGES_PATH + '/' + name)).Exif;
                    if (exifData) {
                        //object is iso value and the filename
                        fileIsoVals[index] = {
                            name: files[index],
                            iso: exifData[EXIF_ISO_ID]
                        };
                    }                    
                });
                //sort the iso array by the reverse iso value
                sortBy(fileIsoVals, file => -file.iso);
                for (var i = 0; i < fileIsoVals.length; i++) {
                    if (fileIsoVals[i]) {
                        console.log(fileIsoVals[i].name);
                    }
                }
            });
        }
    } catch (e) {
        //if we failed to build a zip, error out
        console.error('Data problem', e);
    }
});