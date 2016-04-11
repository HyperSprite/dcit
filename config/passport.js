const logger = require('../lib/logger.js');
const strTgs = require('../lib/stringThings.js');
const accConfig = require('../config/access');
const Optionsdb = require('../models/options.js');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

// expose this function to our app using module.exports
module.exports = (passport) => {
// required for persistent login sessions
// passport needs ability to serialize and unserialize users out of session
// used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({
  // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true, // allows us to pass back the entire request to the callback
  }, (req, email, password, done) => {
    // DefaultAccess sets the default level for a new user.
    // All access is addeditive
    // 1 = Limited
    // 2 = Read access
    // 3 = Edit access
    // 4 = Delete access
    // 5 = All access
    var defaultAccess = 1;
    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(() => {
      // Check to see if User db exists,
      // if not, set the first user to level 5 access (root)
      User.find((err, users) => {
        if (!users.length) {
          defaultAccess = 5;
          logger.warn('New Local Users db created');
        }
      });
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({ 'local.email': email }, (err, user) => {
        // if there are any errors, return the error
        if (err) return done(err);
        // check to see if theres already a user with that email
        if (user) {
          logger.warn(`Email taken,${email}`);
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        }
        // if there is no user with that email
        // create the user
        var newUser = new User();
        // set the user's local credentials
        newUser.local.email = email;
        newUser.local.password = newUser.generateHash(password);
        newUser.access = defaultAccess;
        newUser.local.createdOn = Date.now();
        logger.warn(`${email} created with acess level ${defaultAccess}`);
        // save the user
        newUser.save((err) => {
          if (err) throw err;
          return done(null, newUser);
        });
      });
    });
  }));
  // logger.info(local.email + ' local account already exists');
  // logger.info(local.email + ' new local account created');
  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true, // allows us to pass back the entire request to the callback
  }, (req, email, password, done) => { // callback with email and password from our form
    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    User.findOne({ 'local.email': email }, (err, user) => {
      // if there are any errors, return the error before anything else
      if (err) {
        return done(err);
          // if no user is found, return the message
      } else if (!user) {
        logger.warn(`ACCESS FAILED, ${email}`);
        return done(null, false, req.flash('loginMessage', 'Opps! Login Failed.')); // req.flash is the way to set flashdata using connect-flash
         // if the user is found but the password is wrong
      } else if (!user.validPassword(password)) {
        logger.warn(`PASSWORD FAILED,${email}`);
        return done(null, false, req.flash('loginMessage', 'Oops! Failed Login.')); // create the loginMessage and save it to session as flashdata
          // all is well, return successful user
      }
      logger.info(`${user.local.email} in time zone ${req.body.timezone}`);
      req.session.ses = {
        timezone: req.body.timezone,
        access: accConfig.accessCheck(user),
      };
      return done(null, user);
    });
  }));
};

// req.session.sesUser: {
//   timezone : timezone,
//   user : {
//     authId :  string,
//     password : string,
//     name : string,
//     email : string,
//     phone : string,
//     createdOn : date,
//     lastAccessed : date,
//   },
//   access : {
//     root :
//     delete :
//     edit :
//     read :
//     noaccess :
//   }
// }
