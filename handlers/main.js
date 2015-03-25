
var     strTgs = require('../lib/stringThings'),
     accConfig = require('../config/access'),
      ObjectId = require('mongoose').Types.ObjectId;
var     logger = require('../lib/logger');
 
exports.home = function(req, res){
    //logger.info('exports.home');
        context = {
            access : accConfig.accessCheck(req.user),
            user : req.user,
            };
	res.render('home', context);
};

exports.about = function(req, res){
        context = {
            access : accConfig.accessCheck(req.user),
            user : req.user,
            };
	res.render('about', context);
};
