const credentials = require('../credentials.js');

module.exports = {
  uploadDir: credentials.uploadDir,
  logDirectory: credentials.logDirectory,
  fileName: {
    accessLog: 'accessLog',
    appMainLog: 'appMainLog',
    exceptionLog: 'exceptionLog',
    uploadLog: 'uploadLog',
  },
};

// var logconfig = require('../lib/logconfig.js');
// logconfig.uploadDir
