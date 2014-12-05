var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator'); 

//   Systems 


var fileinfoSchema = mongoose.Schema({
    fileName: {type: String, unique: true,sparse: true, index:1, required: true}, //what the app calls it
    filePath: String, // where it was placed
    fileHRName: String, //what the users see
    fileType: String,  //"csv" for uploadables, "project" for project files, image for equipment images 
    fileDescription: String,
    createdBy: String,
    createdOn: {type: Date, default: Date.now},
    modifiedBy: String,
    modifiedOn: {type: Date, default: Date.now},
});

// Apply the uniqueValidator plugin to datacenterSchema
fileinfoSchema.plugin(uniqueValidator);

var Fileinfo = mongoose.model('Fileinfo', fileinfoSchema);
module.exports = Fileinfo;
