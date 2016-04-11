// users
const logger = require('../lib/logger.js');
const strTgs = require('../lib/stringThings.js');
const ObjectId = require('mongoose').Types.ObjectId;
const passport = require('passport');
const Users = require('../models/user.js');
const Optionsdb = require('../models/options.js');
const VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

exports.home = (req, res) => {
  // logger.info(req.params.data);
  // logger.info('req.headers.referer'+req.headers.referer);
  if (!req.params.data) {
    res.render('user/home');
  } else if (req.params.data === 'login') {
    res.render('user/login');
  } else if (req.params.data === 'signup') {
    res.render('user/signup');
  } else if (req.params.data === 'profile') {
    res.render('user/profile', {
      user: req.user, // get the user out of session and pass to template
    });
  } else if (req.params.data === 'logout') {
    req.logout();
    res.redirect('/');
  }
};


exports.localSignup = (req, res, next) => {
  passport.authenticate('local-signup', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.session.flash = {
        type: 'danger',
        intro: 'Signup Failed!',
        message: 'Your emial address or password are not valid or is a duplicate!',
      };
      return res.redirect(303, '/user/signup');
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      return res.redirect(303, '/user/profile');
    });
  })(req, res, next);
};

exports.localLogin = (req, res, next) => {
  passport.authenticate('local-login', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.session.flash = {
        type: 'danger',
        intro: 'Login Failed!',
        message: 'Username or password not valid!',
      };
      return res.redirect(303, '/');
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      return res.redirect(303, req.body.requrl);
    });
  })(req, res, next);
};
