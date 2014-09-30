var mongoose = require('mongoose');

var datacenterSchema = mongoose.Schema({
	fullName: String,
	abbreviation: {type: String, unique: true},
    createdOn: Date,
    foundingCompany: String,
    createdOn: Date,
    modifiedOn: {type: Date, default: Date.now},
    contacts:[{
        address1: String,
        address2: String,
        address3: String,
        address4: String,
        city: String,
        state: String,
        country: String,
        zip: String,
        lat: Number,
        lon: Number,
        conType:String,
        conName:String,
        conEmail:String,
        conURL:String,
        conPhones:[{conPhoNumber:Number,conPhoType:String}],
        conNotes: [{conNoteDate: {type: Date, default: Date.now},conNote: String}],
    }],
});

var Datacenter = mongoose.model('Datacenter', datacenterSchema);
module.exports = Datacenter;
