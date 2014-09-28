var mongoose = require('mongoose');

var datacenterSchema = mongoose.Schema({
	fullName: String,
	abbreviation: {type: String, unique: true},
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
    createdOn: Date,
    foundingCompany: String,
    modifiedOn: {type: Date, default: Date.now},
    contact:[{
                    conType:String,
                    conName:String,
                    conEmail:String,
                    conURL:String,
                    conPhone:[{
                                        conPhoNumber:Number,
                                        conPhoType:String,
                                        }],
                    notes: [{
                                    date: {type: Date, default: Date.now},
                                    notes: String,
                                    }],
                    }],
});

var Datacenter = mongoose.model('Datacenter', datacenterSchema);
module.exports = Datacenter;
