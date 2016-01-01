
const admin = require('./admin');
const ajax = require('./ajax');
const equipment = require('./equipment');
const location = require('./location');
const main = require('./main');
const rack = require('./rack');
const report = require('./report');
const samples = require('./sample');
const system = require('./system');
const user = require('./user');

module.exports = {
  admin: admin,
  ajax: ajax,
  equipment: equipment,
  location: location,
  main: main,
  rack: rack,
  report: report,
  samples: samples,
  system: system,
  user: user,
};
