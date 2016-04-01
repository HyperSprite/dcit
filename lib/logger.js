const logConfig = require('../config/log');
const winston = require('winston');
var logger;

winston.emitErrs = true;
logger = new winston.Logger();

if (process.env.NODE_ENV === 'production') {
  logger
    .add(require('winston-daily-rotate-file'), {
      json: false,
      timestamp: true,
      level: 'warn',
      filename: logConfig.logDirectory + logConfig.fileName.appMainLog,
    })
    .add(winston.transports.Console, {
      json: false,
      timestamp: true,
      colorize: true,
      level: 'warn',
    });
} else {
  logger
    .add(winston.transports.Console, {
      json: false,
      timestamp: true,
      colorize: true,
    })
    .add(require('winston-daily-rotate-file'), {
      json: false,
      timestamp: true,
      level: 'warn',
      filename: logConfig.logDirectory + logConfig.fileName.appMainLog,
    });
}

logger.stream = {
  write: function (message, encoding) {
    logger.info(message);
  },
};

module.exports = logger;

// var logger = require('../lib/logger.js');
