var winston = require('winston');
winston.emitErrs = true;
var logger = new (winston.Logger)({


transports: [
    new (winston.transports.Console)({ json: false, timestamp: true, colorize: true }),
    new winston.transports.DailyRotateFile({filename: '../logs/appMainLog', json: false })
 ],

  exceptionHandlers: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.DailyRotateFile({ filename: '../logs/exceptions.log', json: false })
  ],
  exitOnError: true
});
winston.add(winston.transports.DailyRotateFile, {
  filename: '../logs/MainLog.'
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};


// var logger = require('../lib/logger.js');


