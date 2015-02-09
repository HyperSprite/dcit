// https://scotch.io/tutorials/easy-node-authentication-setup-and-local
// config/passport.js
//var flash    = require('connect-flash');
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User            = require('../models/user');
var winston = require('winston');
var logger = new (winston.Logger)({
  transports: [
    new winston.transports.DailyRotateFile({filename: '../logs/accessLog', json: false}),
    ],
  exitOnError: true
});

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        // DefaultAcess sets the default level for a new user.
        // All access is addeditive
        // 1 = Limited
        // 2 = Read access
        // 3 = Edit access
        // 4 = Delete access
        // 5 = All access
        var defaultAcess = 1;
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {
        // Check to see if User db exists, 
        // if not, set the first user to level 5 access (root)
        User.find(function(err, users){
            if(!users.length){
                defaultAcess = 5;
                logger.warn('New Local Users db created');
            }
        });
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                logger.warn('Email taken,'+email);
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                
            } else {
                
                // if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);
                newUser.access = defaultAcess;
                newUser.createdOn = Date.now();
                logger.warn(email+' created with acess level '+defaultAcess);

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;

                    return done(null, newUser);
                });
            }

        });    

        });

    }));
// logger.info(local.email + ' local account already exists');
// logger.info(local.email + ' new local account created');

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err){
                return done(err);
            // if no user is found, return the message
            }else if (!user){
                logger.warn('ACCESS FAILED,'+email);
                return done(null, false, req.flash('loginMessage', 'Opps! Login Failed.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            }else if (!user.validPassword(password)){
               logger.warn('PASSWORD FAILED,'+email);
                return done(null, false, req.flash('loginMessage', 'Oops! Failed Login.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
           }else{
            return done(null, user);
        }
        });

    }));

};
// logger.info('ACCESS FAILED >'+local.email + ' no local account!');
// logger.info('ACCESS FAILED >'+local.email + ' incorrect local password!');
// logger.info('ACCESS granted for >'+local.email);