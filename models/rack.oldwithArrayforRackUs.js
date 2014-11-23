var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator'); 

// future to audit rack power, could be manual, could pull from PDUs
var rackPowNowSchema = mongoose.Schema({
    rackPowNowAmps: Number,
    modifiedBy: String,
    modifiedOn: {type: Date, default: Date.now},
});

var rackPowersSchema = mongoose.Schema({
    rackPowMain: {type: String, required: true},
    rackPowCircuit: {type: String, required: true},
    rackPowUnique:{type: String, unique: true,sparse: true},
    rackPowStatus: String,
	rackPowVolts: Number,
	rackPowPhase: Number,
	rackPowAmps: Number,
	rackPowReceptacle: String,
    rackPowNow: [rackPowNowSchema],
    createdBy: String,
    createdOn: {type: Date, default: Date.now},
    modifiedBy: String,
    modifiedOn: {type: Date, default: Date.now},
});

var rackSchema = mongoose.Schema({
	rackParentDC:{ type: mongoose.Schema.Types.ObjectId, ref: 'Datacenter' },
    rackParentCage:{ type: mongoose.Schema.Types.ObjectId, ref: 'Datacenter.cages' },
    rackNickname:String,
    rackName:{type: String, required: true},
    rackUnique:{type: String, unique: true, index:1}, 
    rackDescription: String,
    rackSN: String,
    rackHeight: Number,
    rackWidth: Number,
    rackDepth: Number,
    rackLat: String,
    rackLon: String,
    rackStatus: String,
    rackMake: String,
    rackModel: String,
    rUs:{type: Array, unique: true},
    powers: [rackPowersSchema],
    rackNotes: String,
    createdBy: String,
    createdOn: {type: Date, default: Date.now},
    modifiedBy: String,
    modifiedOn: {type: Date, default: Date.now},
});

// gets rUs based on Rack ID
rackSchema.methods.getrUs = function(){
    return rUs.find({rackId: this._id});
};

// Apply the uniqueValidator plugin to datacenterSchema
rackSchema.plugin(uniqueValidator);

var Rack = mongoose.model('Rack', rackSchema);
module.exports = Rack;
