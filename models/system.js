const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const addHistory = require('mongoose-history');
const historyOptions = { diffOnly: true };


//   Systems

const systemPortSchema = mongoose.Schema({
  sysPortType: String,
  sysPortName: String,
  sysPortAddress: String,
  sysPortCablePath: String,
  sysPortEndPoint: String,
  sysPortEndPointPre: String,
  sysPortEndPointPort: String,
  sysPortVlan: String,
  sysPortOptions: String,
  sysPortURL: String,
  sysPortCrossover: { type: Boolean, default: false },
  createdBy: String,
  modifiedBy: String,
},
  { timestamps: { createdAt: 'createdOn', updatedAt: 'modifiedOn' },
});

const systemdbSchema = mongoose.Schema({
  systemName: { type: String, unique: true, sparse: true, index: 1, required: true },
  systemEquipSN: { type: String, index: 1 },
  systemAlias: { type: String },
  systemEnviron: { type: String, index: 1 },
  systemRole: { type: String, index: 1 },
  systemInventoryStatus: { type: Boolean },
  systemTemplate: Boolean,
  systemTicket: String,
  systemStatus: String,
  systemOwner: String,
  systemImpact: String,
  systemIsVirtual: { type: Boolean, default: false },
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
  modifiedBy: String,
},
  { timestamps: { createdAt: 'createdOn', updatedAt: 'modifiedOn' },
});

// Apply the uniqueValidator plugin to datacenterSchema
systemdbSchema.plugin(uniqueValidator);

systemdbSchema.plugin(addHistory, historyOptions);

const Systemdb = mongoose.model('Systemdb', systemdbSchema);
module.exports = Systemdb;
