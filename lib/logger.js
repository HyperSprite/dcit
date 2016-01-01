var logConfig = require('../config/log');
var winston = require('winston');
var MongoDB = require('winston-mongodb').MongoDB;
winston.emitErrs = true;

var logger = new (winston.Logger)({
transports: [
    new (winston.transports.Console)({ json: false, timestamp: true, colorize: true }),
/*    new (winston.transports.MongoDB)({
      db: 'log',
      host: 'mongodb://localhost:27017/dcit'
      //host: 'logConfig.mongodbHost',
      //username: 'logConfig.userneme',
      //password: 'logConfig.password'
    }),  */
 ],
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};


// var logger = require('../lib/logger.js');


