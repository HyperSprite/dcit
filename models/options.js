var        mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator');


var optionsSchema = mongoose.Schema({
    optListName: {type: String, unique: true,sparse: true,require:1},
    optListKey: {type: String, unique: true,sparse: true,require:1},
    optListArray: Array,
    createdBy: String,
    createdOn: {type: Date, default: Date.now},
    modifiedBy: String,
    modifiedOn: {type: Date, default: Date.now},
});

// Apply the uniqueValidator plugin to datacenterSchema
optionsSchema.plugin(uniqueValidator);

var Optionsdb = mongoose.model('Optionsdb', optionsSchema);
module.exports = Optionsdb;


