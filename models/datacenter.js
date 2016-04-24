const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Rack = require('../models/rack.js');
const addHistory = require('mongoose-history');
const historyOptions = { diffOnly: true };


const dcCagesSchema = mongoose.Schema({
  cageNickname: {type: String, required: true},
  cageAbbreviation: String,
  cageName: {type: String, required: true},
  cageInMeters: Number,
  cageWattPSM: Number,
  cageNotes: String,
  cageMap: String,
  cageracks: [{ type: mongoose.Schema.ObjectId, ref: 'Rack' }],
},
  {timestamps: {createdAt: 'createdOn', updatedAt: 'modifiedOn'},
});


const dcContactsSchema = mongoose.Schema({
  conGuid: {type: String},
  conType: {type: String, required: true},
  conName: {type: String, required: true},
  conEmail: String,
  conURL: String,
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
  conPho1Num: String,
  conPho1Typ: String,
  conPho2Num: String,
  conPho2Typ: String,
  conPho3Num: String,
  conPho3Typ: String,
  conPho4Num: String,
  conPho4Typ: String,
  conNotes: String,
},
  {timestamps: {createdAt: 'createdOn', updatedAt: 'modifiedOn'},
});

const dcNetworkSchema = mongoose.Schema({
  dcNetUnique: {type: String, unique: true, required: true, sparse: true},
  dcNetType: {type: Number, required: true},
  dcNetNetwork: {type: String, required: true},
  dcNetMask: {type: Number, required: true},
  dcNetVlan: Number,
  dcNetDesc: String,
  dcNetGateway: String,
  dcNetDomain: String,
  dcNetDns1: String,
  dcNetDns2: String,
  dcNetNTP1: String,
  dcNetNTP2: String,
  dcNetLdap1: String,
  dcNetLdap2: String,
  dcNetLdapString: String,
  dcNetTftpHost: String,
  dcNetACSFilePath: String,
  createdBy: String,
  modifiedBy: String,
},
  {timestamps: {createdAt: 'createdOn', updatedAt: 'modifiedOn'},
});

const datacenterSchema = mongoose.Schema({
  fullName: {type: String, unique: true, required: true, index:1, sparse: true},
  abbreviation: {type: String, unique: true, required: true, index:1, sparse: true},
  foundingCompany: String,
  createdBy: String,
  modifiedBy: String,
  contacts: [dcContactsSchema],
  cages: [dcCagesSchema],
  networks: [dcNetworkSchema],
  powerNames: Array,
  racks: [{ type: mongoose.Schema.ObjectId, ref: 'Rack' }],
},
  {timestamps: {createdAt: 'createdOn', updatedAt: 'modifiedOn'},
});

// gets Cages based on Datacenter ID
datacenterSchema.methods.getChangeOrders = function() {
  return changeorders.find({datacenterId: this._id});
};

datacenterSchema.methods.getRacks = function(){
  return Racks.find({datacenterId: this._id});
};

// Apply the uniqueValidator plugin to datacenterSchema
datacenterSchema.plugin(uniqueValidator);

datacenterSchema.plugin(addHistory, historyOptions);

const Datacenter = mongoose.model('Datacenter', datacenterSchema);
module.exports = Datacenter;
