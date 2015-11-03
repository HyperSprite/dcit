// user.js

var        mongoose = require('mongoose'),
             bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    access: Number,    
    local:{
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

var User = mongoose.model('User', userSchema);
module.exports = User;

