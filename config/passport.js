var logconfig = require('./../logconfig.js'),
       strTgs = require('../lib/stringThings.js'),
    Optionsdb = require('../models/options.js');

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User            = require('../models/user');
var winston = require('winston');
var logger = new (winston.Logger)({
  transports: [
    new winston.transports.DailyRotateFile({filename: logconfig.logDir+logconfig.fileName.accessLog, json: false}),
    ],
  exitOnError: true
});

exports.accessCheck = function (check){
var access = new Object();
if(!check){access.noAccess=1;}else{
if(check.access > 4){access.root = 1;}
if(check.access > 3){access.delete = 1;}
if(check.access > 2){access.edit = 1;}
if(check.access > 1){access.read = 1;}
}
return access;
};

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
            logger.info(user.local.email+' in time zone '+req.body.timezone);
           
            req.session.ses = {
                timezone : req.body.timezone,
                access : exports.accessCheck(user),
            };
            return done(null, user);
        
        }
        });

    }));

};
/*
req.session.sesUser :{
    timezone : timezone,
    user : {
            authId :  string,
            password : string,
            name : string,
            email : string,
            phone : string,
            createdOn : date,
            lastAccessed : date,
        },
    access : {
        root :
        delete :
        edit :
        read :
        noaccess : 
        }


    }
    }


}




*/