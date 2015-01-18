// users
var     logger = require('../lib/logger.js'),
        strTgs = require('../lib/stringThings.js'),
      ObjectId = require('mongoose').Types.ObjectId;

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
    }
};

