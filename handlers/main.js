
var     logger = require('../lib/logger.js'),
        strTgs = require('../lib/stringThings.js'),
      ObjectId = require('mongoose').Types.ObjectId;

 
exports.home = function(req, res){
    logger.info('exports.home');
        context = {
            access : strTgs.accessCheck(req.user),
            user : req.user,
            };
	res.render('home', context);
};

exports.about = function(req, res){
        context = {
            access : strTgs.accessCheck(req.user),
            user : req.user,
            };
	res.render('about', context);
};






