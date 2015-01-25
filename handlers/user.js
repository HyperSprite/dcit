// users
var     logger = require('../lib/logger.js'),
        strTgs = require('../lib/stringThings.js'),
      ObjectId = require('mongoose').Types.ObjectId,
      passport = require('passport');

// Models
     var Users = require('../models/user.js'),
     Optionsdb = require('../models/options.js');

exports.home = function(req, res){
    logger.info(req.params.data);
    if(!req.params.data){
    res.render ('user/home');
    } else if (req.params.data === 'login'){
        res.render ('user/login');
    } else if (req.params.data === 'signup'){
        res.render ('user/signup');
    } else if (req.params.data === 'profile'){
        res.render('user/profile', {
        user : req.user // get the user out of session and pass to template
    });     
    } else if (req.params.data === 'logout'){
        req.logout();
        res.redirect('/');
    }
};


exports.localSignup = function(req, res){
        if(successRedirect){
            res.render('admin/profile');
        }
        if(failureRedirect){
            res.render('user/signup');
            req.session.flash = true;
        }
};

exports.localLogin = function(req, res){
        if(successRedirect){
            res.render('admin/profile');
        }
        if(failureRedirect){
            res.render('user/signup');
            req.session.flash = true;
        }
};
