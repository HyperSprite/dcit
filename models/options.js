const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const optionsSchema = mongoose.Schema({
  optListName: {type: String, unique: true, sparse: true, require: 1},
  optListKey: {type: String, unique: true, sparse: true, require: 1},
  optListArray: Array,
  createdBy: String,
  modifiedBy: String,
},
  {timestamps: {createdAt: 'createdOn', updatedAt: 'modifiedOn'},
});

// Apply the uniqueValidator plugin to datacenterSchema
optionsSchema.plugin(uniqueValidator);

const Optionsdb = mongoose.model('Optionsdb', optionsSchema);
module.exports = Optionsdb;
