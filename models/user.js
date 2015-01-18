// user.js

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
        authId: String,
        password: String,
        name: String,
        email: String,
        phone: String,
        roles: Array,
        createdOn: Date,
        lastAccessed: Date,
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

var User = mongoose.model('User', userSchema);
module.exports = User;