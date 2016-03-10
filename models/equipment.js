var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

// Equipment

var equipRMASchema = mongoose.Schema({
  equipRMAOpened: Date,
  equipRMAClosed: Date,
  equipRMANumber: String,
  equipRMANotes: String,
  equipRMATicket: String,
  createdBy: String,
  createdOn: {type: Date, default: Date.now},
  modifiedBy: String,
  modifiedOn: {type: Date, default: Date.now},
});

var equipPortSchema = mongoose.Schema({
  equipPortType: String,
  equipPortsAddr: {type: String, unique: true, sparse: true},
  equipPortName: String,
  equipPortsOpt: String,
  createdBy: String,
  createdOn: {type: Date, default: Date.now},
  modifiedBy: String,
  modifiedOn: {type: Date, default: Date.now},
});

var equipmentSchema = mongoose.Schema({
  equipLocation: {type: String, index: 1},
  equipSN: {type: String, unique: true, index: 1, sparse: true, required: true},
  equipAssetTag: String,
  equipRMAs: [equipRMASchema],
  equipPorts:[equipPortSchema],
  equipTicketNumber: String,
  equipInventoryStatus: {type: Boolean, default: false},
  equipStatus: String,
  equipIsVirtual: {type: Boolean, default: false},
  equipEOL: {type: Boolean, default: false},
  equipType: String,
  equipMake: String,
  equipModel: String,
  equipSubModel: String,
  equipRUHieght: Number,
  equipParent: String,
  equipImgFront: String,
  equipImgRear: String,
  equipImgInternal: String,
  equipFirmware: String,
  equipIPMIv: String,
  equipMobo: String,
  equipCPUCount: Number,
  equipCPUCores: Number,
  equipCPUType: String,
  equipMemType: String,
  equipMemTotal: String,
  equipRaidType: String,
  equipRaidLayout: String,
  equipHDDCount: String,
  equipHDDType: String,
  equipNICCount: Number,
  equipNICType: String,
  equipPSUCount: Number,
  equipPSUDraw: Number,
  equipAddOns: String,
  equipReceived: {type: Date},
  equipAcquisition: Date,
  equipInService: Date,
  equipEndOfLife: Date,
  equipWarrantyMo: Number,
  equipPONum: String,
  equipInvoice: String,
  equipProjectNum: String,
  equipLicense: String,
  equipMaintAgree: String,
  equipPurchaseType: String,
  equipPurchaser: String,
  equipPurchaseTerms: String,
  equipPurchaseEnd: Date,
  equipNotes: String,
  createdBy: String,
  createdOn: {type: Date, default: Date.now},
  modifiedBy: String,
  modifiedOn: {type: Date, default: Date.now},
});

// Apply the uniqueValidator plugin to datacenterSchema
equipmentSchema.plugin(uniqueValidator);

equipmentSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' });

equipmentSchema.virtual('equipLocRack').get(function() {
  var cutLine = this.equipLocation.lastIndexOf('_');
  return this.equipLocation.substring(0, cutLine);
});

equipmentSchema.virtual('equipLocRU').get(function() {
  var cutLine = this.equipLocation.lastIndexOf('_');
  return this.equipLocation.slice(cutLine + 1);
});

equipmentSchema.virtual('dcAbbr').get(function() {
  var start = this.equipLocation.indexOf('-');
  return this.equipLocation.substring(start + 1);
});

var Equipment = mongoose.model('Equipment', equipmentSchema);
module.exports = Equipment;


