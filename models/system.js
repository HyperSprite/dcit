var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator'); 

//   Systems 

var systemPortSchema = mongoose.Schema({
    sysPortType: String,
    sysPortName: String,
    sysPortAddress: String,
    sysPortCablePath: String,
    sysPortEndPoint: String,
    sysPortEndPointPre: String,
    sysPortEndPointPort: String,
    sysPortVlan: Number,
    sysPortOptions: String,
    sysPortURL: String,
    sysPortCrossover: Boolean,
    createdBy: String,
    createdOn: {type: Date, default: Date.now},
    modifiedBy: String,
    modifiedOn: {type: Date, default: Date.now},

});

var systemdbSchema = mongoose.Schema({
    systemName: {type: String, unique: true,sparse: true, index:1},
    systemEquipSN: {type: String, index:1},
    systemEnviron: String,
    systemRole: String,
    systemInventoryStatus: Boolean,
    systemTicket: String,
    systemStatus: String,
    systemOwner: String,
    systemImpact: String,
    systemIsVirual: Boolean,
    systemParentId: String,
    systemOSType: String,
    systemOSVersion: String,
    systemApplications: String,
    systemSupLic: String,
    systemSupEndDate: Date,
    systemInstall: Date,
    systemStart: Date,
    systemEnd: Date,
    systemNotes: String,
    systemPorts: [systemPortSchema],
    createdBy: String,
    createdOn: {type: Date, default: Date.now},
    modifiedBy: String,
    modifiedOn: {type: Date, default: Date.now},
});

// Apply the uniqueValidator plugin to datacenterSchema
systemdbSchema.plugin(uniqueValidator);

var Systemdb = mongoose.model('Systemdb', systemdbSchema);
module.exports = Systemdb;
