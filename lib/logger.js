var logconfig = require('./../logconfig.js');
var winston = require('winston');
winston.emitErrs = true;
var logger = new (winston.Logger)({


transports: [
    new (winston.transports.Console)({ json: false, timestamp: true, colorize: true }),
    new winston.transports.DailyRotateFile({filename: logconfig.logDir+logconfig.appMainLog, json: false })
 ],

  exceptionHandlers: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.DailyRotateFile({ filename: logconfig.logDir+logconfig.appMainLog, json: false })
  ],
  exitOnError: true
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};


// var logger = require('../lib/logger.js');


