var        mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator'), 
               Rack = require('../models/rack.js');

var dcCagesSchema = mongoose.Schema({
        cageNickname:{type: String, required: true},
        cageAbbreviation: String,
        cageName:{type: String, required: true},
        cageInMeters:Number,
        cageWattPSM:Number,
        cageNotes:String,
        cageMap:String,
        cageracks:[{ type: mongoose.Schema.ObjectId, ref: 'Rack' }]
});


var dcContactsSchema = mongoose.Schema({
        conGuid:{type: String},
        conType:{type: String, required: true},
        conName:{type: String, required: true},
        conEmail:String,
        conURL:String,    
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
        conPho1Num: Number,
        conPho1Typ: String,
        conPho2Num: Number,
        conPho2Typ: String,
        conPho3Num: Number,
        conPho3Typ: String,        
        conPho4Num: Number,
        conPho4Typ: String,        
        conNotes: String,   
});

var dcNetworkSchema = mongoose.Schema({
        dcNetUnique:{type: String, unique: true, required: true,sparse: true},
        dcNetType:{type: Number, required: true},
        dcNetNetwork:{type: String, required: true},
        dcNetMask:{type: Number, required: true},
        dcNetVlan:Number,
        dcNetDesc: String,
        dcNetGateway:String,
        dcNetDomain:String,
        dcNetDns1:String,
        dcNetDns2:String,
        dcNetNTP1:String,
        dcNetNTP2:String,
        dcNetLdap1:String,
        dcNetLdap2:String,
        dcNetLdapString:String,
        dcNetTftpHost:String,
        dcNetACSFilePath:String,
        createdOn: {type: Date, default: Date.now},
        createdBy: String,
        modifiedOn: {type: Date, default: Date.now},
        modifiedBy: String,
});

var datacenterSchema = mongoose.Schema({
        fullName: {type: String, unique: true, required: true,index:1,sparse: true},
        abbreviation: {type: String, unique: true, required: true, index:1,sparse: true},
        foundingCompany: String,
        createdOn: {type: Date, default: Date.now},
        createdBy: String,
        modifiedOn: {type: Date, default: Date.now},
        modifiedBy: String,
        contacts:[dcContactsSchema],
        cages:[dcCagesSchema],
        networks:[dcNetworkSchema],
        powerNames: Array,
        racks:[{ type: mongoose.Schema.ObjectId, ref: 'Rack' }],
});

// gets Cages based on Datacenter ID
datacenterSchema.methods.getChangeOrders = function(){
    return changeorders.find({datacenterId: this._id});
};

datacenterSchema.methods.getRacks = function(){
    return Racks.find({datacenterId: this._id});
};

// Apply the uniqueValidator plugin to datacenterSchema
datacenterSchema.plugin(uniqueValidator);


var Datacenter = mongoose.model('Datacenter', datacenterSchema);
module.exports = Datacenter;

