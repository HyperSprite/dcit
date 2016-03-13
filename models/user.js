// user.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const addHistory = require('mongoose-history');
const historyOptions = { diffOnly: true };


const userSchema = mongoose.Schema({
  access: Number,
  local: {
    authId: String,
    password: String,
    name: String,
    email: String,
    phone: String,
    createdOn: Date,
    lastAccessed: Date,
  },
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

userSchema.plugin(addHistory, historyOptions);

const User = mongoose.model('User', userSchema);
module.exports = User;

