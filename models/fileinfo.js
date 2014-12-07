var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator'); 

//   Systems 


var fileinfoSchema = mongoose.Schema({
    fileName: {type: String, unique: true,sparse: true, index:1, required: true}, //what the app calls it, formidible makes a long string, we dont show this to the user
    filePath: String, // dir and file name like ./userdata/9ikcojeoejoc.csv
    fileHRName: String, //what the users called it and what they see when they see it
    fileType: String,  //"csv" for uploadables, "project" for project files, image for equipment images 
    fileDescription: String, // for csv, it is the db/sub-db it is for
    createdBy: String,
    createdOn: {type: Date, default: Date.now},
    modifiedBy: String,
    modifiedOn: {type: Date, default: Date.now},
});

// Apply the uniqueValidator plugin to datacenterSchema
fileinfoSchema.plugin(uniqueValidator);

var Fileinfo = mongoose.model('Fileinfo', fileinfoSchema);
module.exports = Fileinfo;
