const async = require('async');
const logger = require('../lib/logger');
const strTgs = require('../lib/stringThings');
const accConfig = require('../config/access');
const csv = require('fast-csv');
const dates = require('../lib/dates');
const moment = require('moment');
const ObjectId = require('mongoose').Types.ObjectId;
const IpSubnetCalculator = require('ip-subnet-calculator');
const addContext = require('contextualizer');
const objToQString = require('../lib/obj-to-qstring');

// Models
const Models = require('../models');


var start = '';
var editLoad = 0;
var dcabbr = '';
var dcInfo = '';
var dcInfoSplit = '';
var dcSubId = '';
var dcId = '';

var query;

module.exports.dcReport = (req, res, next) => {
  Models.Systemdb.distinct('systemEnviron').exec((err, env) => {
    // if (err) return next(err);
    // logger.info(env);
    Models.Systemdb.distinct('systemRole').exec((err, role) => {
      if (err) return next(err);
      // logger.info(role);
      Models.Equipment.distinct('equipMake').exec((err, make) => {
        if (err) return next(err);
        var context = {
          access: accConfig.accessCheck(req.user),
          titleNow: 'Reports',
          reportType: req.body.systemEnviron,
          drop1: 'Environment',
          drop1url: '/reports/env-',
          drop1each: env.sort(),
          drop2: 'Roles',
          drop2url: '/reports/role-',
          drop2each: role.sort(),
          drop3: 'Make',
          drop3url: '/reports/make-',
          drop3each: make.sort(),
        };
        return res.render('asset/env-role-report', context);
      });
    });
  });
};

/*
function reduceRoles(element, index, array) {
  console.log('a[' + index + '] = ' + element);
}
        result.reduce(function(preVal, curVal, curIndx, ) {
        })
        // console.dir(result);
*/
// This report requires MongoDB 3.2 or higher for the $lookup (left join).
module.exports.reportByInserviceEnv = (req, res, next) => {
  var findThis = (req.query.dcAbbr || 'rsys');
  Models.Systemdb.aggregate([
    {$match:
      {$or: [
        {'systemStatus': 'Production App'},
        {'systemStatus': 'Production DB'},
      ]},
      },
      {$lookup:
        { from: 'equipment',
          localField: 'systemEquipSN',
          foreignField: 'equipSN',
          as: 'equip',
        },
      },
      {$match:
        { 'equip.equipLocation': { '$regex': findThis, '$options': 'i'},
      },
      },

      {$match:
        { $or: [
          {'equip.equipStatus': 'In Service'},
          {'equip.equipStatus': 'In Service with issues'},
        ]},
      },
      {$group:
      {
        _id: { env: '$systemEnviron', dcAbbr: '$dcAbbr'},
        countApp: {$sum: { $cond: [{$eq: [ '$systemStatus', 'Production App' ]}, 1, 0]}},
        countDb: {$sum: { $cond: [{$eq: [ '$systemStatus', 'Production DB' ]}, 1, 0]}},
      },
      },
      {$sort:
      {
        '_id.env': 1,
        'countApp': -1,
        'countDb': -1,
      },
      },
      { $project:
      {
        '_id': 0,
        'env': '$_id.env',
        'dcAbbr': '$_dc.dcAbbr',
        'countApp': '$countApp',
        'countDb': '$countDb',
      },
      },
  ],
  (err, result) => {
    if (err) return next(err);
    //  result.forEach(reduceRoles);
    res.json(result);
  });
};

module.exports.reportByInserviceEnvRole = (req, res, next) => {
  var inEnv = (req.query.inEnv || 'dc1');
  var findThis = (req.query.dcAbbr || 'rsys');
  Models.Systemdb.aggregate([
    {$match:
      {$or: [
        {'systemStatus': 'Production App'},
        {'systemStatus': 'Production DB'},
      ]},
      },
      {$lookup:
        { from: 'equipment',
          localField: 'systemEquipSN',
          foreignField: 'equipSN',
          as: 'equip',
        },
      },
      {$match:
        { 'equip.equipLocation': { '$regex': findThis, '$options': 'i'},
      },
      },

      {$match:
        { $or: [
          {'equip.equipStatus': 'In Service'},
          {'equip.equipStatus': 'In Service with issues'},
        ]},
      },
      {$match:
        { 'systemEnviron': inEnv},
      },
      {$group:
      {
        _id: { env: '$systemEnviron', sysEnv: '$systemEnviron', sysRole: '$systemRole'},
        countApp: {$sum: { $cond: [{$eq: [ '$systemStatus', 'Production App' ]}, 1, 0]}},
        countDb: {$sum: { $cond: [{$eq: [ '$systemStatus', 'Production DB' ]}, 1, 0]}},
      },
      },
      {$sort:
      {
        '_id.env': 1,
        'countApp': -1,
        'countDb': -1,
      },
      },
      { $project:
      {
        '_id': 0,
        'env': '$_id.env',
        'role': '$_id.sysRole',
        'countApp': '$countApp',
        'countDb': '$countDb',
      },
      },
  ],
  (err, result) => {
    if (err) return next(err);
    // console.dir(result);
    res.json(result);
  });
};


//  /////////////////////////////////////////////////////////////////////////
//  _______ EquipSys Report Switch __________________________________________________
//  ////////////////////////////////////////////////////////////////////////

function queryString(findThis, opt, searchIn) {
  //    logger.info('searchIn '+searchIn);
  switch (opt) {
    case 2: // by Environment
      query = Models.Systemdb.find({
        systemEnviron: findThis
      });
      //        logger.info('query2'+query);
      break;
    case 3: // by Role
      query = Models.Systemdb.find({
        systemRole: findThis
      });
      //        logger.info('query3'+query);
      break;
    case 4: // by System Name (no longer used, now uses Multi)
      query = Models.Systemdb.find({
        'systemName': {
          '$regex': findThis,
          '$options': 'i',
        }
      });
      break;
    case 8: // multi SystemDB
      switch (searchIn) {
        case 'systemName':
          findThis = strTgs.csTrim(findThis);
          query = Models.Systemdb.find({
            'systemName': {
              '$regex': findThis,
              '$options': 'i',
            }
          });
          break;
        case 'systemAlias':
          findThis = strTgs.cTrim(findThis);
          query = Models.Systemdb.find({
            'systemAlias': {
              '$regex': findThis,
              '$options': 'i',
            }
          });
          break;
        case 'systemParentId':
          findThis = strTgs.cTrim(findThis);
          query = Models.Systemdb.find({
            'systemParentId': {
              '$regex': findThis,
              '$options': 'i',
            }
          });
          break;
        case 'systemTicket':
          findThis = strTgs.cTrim(findThis);
          query = Models.Systemdb.find({
            'systemTicket': {
              '$regex': findThis,
              '$options': 'i',
            }
          });
          break;
        case 'modifiedBy':
          findThis = findThis;
          query = Models.Systemdb.find({
            'modifiedBy': {
              '$regex': findThis,
              '$options': 'i',
            }
          });
          break;
        case 'sysPortCablePath':
          findThis = strTgs.stTrim(findThis);
          query = Models.Systemdb.find({
            'systemPorts.sysPortCablePath': {
              '$regex': findThis,
              '$options': 'i',
            }
          });
          break;
        case 'sysPortEndPoint':
          findThis = strTgs.stTrim(findThis);
          query = Models.Systemdb.find({
            'systemPorts.sysPortEndPoint': {
              '$regex': findThis,
              '$options': 'i',
            }
          });
          break;
        case 'sysPortAddress':
          findThis = strTgs.stTrim(findThis);
          query = Models.Systemdb.find({
            'systemPorts.sysPortAddress': {
              '$regex': findThis,
              '$options': 'i',
            }
          });
          break;
        case 'sysPortVlan':
          findThis = strTgs.stTrim(findThis);
          query = Models.Systemdb.find({ 'systemPorts.sysPortVlan': findThis });
          break;
        default:
          //                logger.info('no opt for queryString');
          break;
      }
      break;
    case 10: // Equipment SN (no longer used, now uses Multi)
      query = Models.Equipment.find({
        'equipSN': {
          '$regex': findThis,
          '$options': 'i',
        }
      });
      break;
    case 11: // by Make
      query = Models.Equipment.find({
        equipMake: findThis
      });
      //        logger.info('query11'+query);
      break;
    case 12: // Homeless equipment
      query = Models.Equipment.find({
        equipLocation: '',
      });
      //        logger.info('query12'+query);
      break;
    case 13: // Not In Service
      query = Models.Equipment.find({
        'equipStatus': {
          $nin: ['In Service', 'In Service with issues', 'End of Life', 'End of Life - Recycled', 'End of Life - RMA'],
        },
      });
      //        logger.info('query13'+query);
      break;
    case 14: // End of life
      query = Models.Equipment.find({
        'equipStatus': {
          $in: ['End of Life', 'Missing', 'End of Life - Recycled', 'End of Life - RMA', 'End of Life - Transfered', 'Parts Only']
        },
      });
      //        logger.info('query13'+query);
      break;
    case 15: // Spares
      query = Models.Equipment.find({
        'equipStatus': {
          $in: [
            'Not yet ordered',
            'Ordered',
            'In transit',
            'Received',
            'Spare',
            'Spare with issues',
            'Assigned',
          ],
        },
      });
      //        logger.info('query13'+query);
      break;
    case 18: // multi Equipment
      switch (searchIn) {
        case 'equipSN':
          findThis = strTgs.cTrim(findThis);
          query = Models.Equipment.find({
            'equipSN': {
              '$regex': findThis,
              '$options': 'i',
            },
          });
          break;
        case 'equipParent':
          findThis = strTgs.sTrim(findThis);
          query = Models.Equipment.find({
            'equipParent': {
              '$regex': findThis,
              '$options': 'i',
            },
          });
          break;
        case 'equipAssetTag':
          findThis = strTgs.sTrim(findThis);
          query = Models.Equipment.find({
            'equipAssetTag': {
              '$regex': findThis,
              '$options': 'i',
            },
          });
          break;
        case 'equipTicketNumber':
          findThis = strTgs.cTrim(findThis);
          query = Models.Equipment.find({
            'equipTicketNumber': {
              '$regex': findThis,
              '$options': 'i',
            },
          });
          break;
        case 'equipPONum':
          findThis = strTgs.uTrim(findThis);
          query = Models.Equipment.find({
            'equipPONum': {
              '$regex': findThis,
              '$options': 'i',
            },
          });
          break;
        case 'equipInvoice':
          findThis = strTgs.uTrim(findThis);
          query = Models.Equipment.find({
            'equipInvoice': {
              '$regex': findThis,
              '$options': 'i',
            },
          });
          break;
        case 'equipProjectNum':
          findThis = strTgs.uTrim(findThis);
          query = Models.Equipment.find({
            'equipProjectNum': {
              '$regex': findThis,
              '$options': 'i',
            },
          });
          break;
        case 'modifiedBy':
          query = Models.Equipment.find({
            'modifiedBy': {
              '$regex': findThis,
              '$options': 'i',
            },
          });
          break;
        case 'equipPortsAddr':
          findThis = strTgs.mTrim(findThis);
          query = Models.Equipment.find({
            'equipPorts.equipPortsAddr': {
              '$regex': findThis,
              '$options': 'i',
            },
          });
          break;
        case 'equipLocation':
          findThis = strTgs.sTrim(findThis);
          query = Models.Equipment.find({
            'equipLocation': {
              '$regex': findThis,
              '$options': 'i',
            },
          });
          break;


        default:
          // logger.info('no opt for queryString');
          break;
      }
      break;
    default:
      //        logger.info('no opt for queryString');
      break;
  }
  return query;
}


// -------------------------------------------------------------
//           list by Env and Role env-role-reports
// -------------------------------------------------------------

module.exports.dcByEnvRole = (req, res, next) => {
  var lastSearch;
  var editLoad;
  var searchDb;
  var searchIn;
  var searchFor;
  if (!req.params.datacenter) {
    editLoad = 1;
    //            logger.info('none slected');
  } else {
    lastSearch = searchIn; // .substring (req.params.datacenter.indexOf('~')+1);
    start = req.params.datacenter.indexOf('-');
    searchFor = req.params.datacenter.substring(start + 1);
    if (req.params.datacenter.indexOf('env') != -1) {
      editLoad = 2;
    } else if (req.params.datacenter.indexOf('role') != -1) {
      editLoad = 3;
    } else if (req.params.datacenter.indexOf('system') != -1) {
      editLoad = 4;
      searchFor = strTgs.csTrim(req.query.systemName);
    } else if (req.params.datacenter.indexOf('equipment') != -1) {
      editLoad = 10;
      searchFor = strTgs.cTrim(req.query.equipSN);
    } else if (req.params.datacenter.indexOf('make') != -1) {
      editLoad = 11;
    } else if (req.params.datacenter.indexOf('homeless') != -1) {
      editLoad = 12;
    } else if (req.params.datacenter.indexOf('eqnis') != -1) {
      editLoad = 13;
    } else if (req.params.datacenter.indexOf('eol') != -1) {
      editLoad = 14;
    } else if (req.params.datacenter.indexOf('spares') != -1) {
      editLoad = 15;
    } else if (req.params.datacenter.indexOf('multi') != -1) {
      lastSearch = req.query.searchIn;
      searchIn = req.query.searchIn.substring(req.query.searchIn.indexOf('~') + 1);
      // logger.info('searchIn '+searchIn);
      searchFor = req.query.searchFor;
      // logger.info('searchFor '+searchFor);
      if (req.query.searchIn.indexOf('system') != -1) {
        editLoad = 8;
      } else if (req.query.searchIn.indexOf('equipment') != -1) {
        editLoad = 18;
      }
    } else {
      editLoad = 1;
      // logger.info('none slected');
    }
  }
  // logger.info('page type selected >'+editLoad);

  Models.Systemdb.distinct('systemEnviron').exec((err, env) => {
    if (err) return next(err);
    // logger.info(env);
    Models.Systemdb.distinct('systemRole').exec((err, role) => {
      if (err) return next(err);
      // logger.info(role);
      Models.Equipment.distinct('equipMake').exec((err, make) => {
        if (err) return next(err);
        if (editLoad > 1 && editLoad < 9) {
          // this looks for 'list' as the / url. if it exists, it prints the datacenter list
          query = queryString(searchFor, editLoad, searchIn);
          query.sort({
            'systemName': 'asc',
          }).exec((err, sys) => {
            if (err) return next(err);
            //        logger.info('2-9 >'+searchFor);
            Models.Equipment.find({}, 'equipLocation equipSN equipParent equipStatus equipType equipMake equipModel equipSubModel equipRUHieght equipAddOns modifiedOn equipAcquisition equipEndOfLife equipWarrantyMo equipPONum equipInvoice equipProjectNum equipNotes', (err, eqs) => {
              // logger.info('system-list'+sys);
              var context = {
                titleNow: `.. ${searchFor}`,
                equipsys: 'true',
                reportType: req.body.systemEnviron,
                drop1: 'Environment',
                drop1url: '/reports/env-',
                drop1each: env.sort(),
                drop2: 'Roles',
                drop2url: '/reports/role-',
                drop2each: role.sort(),
                drop3: 'Make',
                drop3url: '/reports/make-',
                drop3each: make.sort(),
                lastSearch: lastSearch,
                eqs: sys.map((sy) => {
                  var tempSys = strTgs.findThisInThatMulti(sy.systemEquipSN, eqs, 'equipSN');
                  // rack.populate('rackParentDC', 'abbreviation cageNickname')
                  // logger.info('sy Map>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+sy);
                  return {
                    systemName: sy.systemName,
                    systemAlias: sy.systemAlias,
                    systemParentId: sy.systemParentId,
                    systemEquipSN: sy.systemEquipSN,
                    systemEnviron: sy.systemEnviron,
                    systemRole: sy.systemRole,
                    systemTicketLit: strTgs.trueFalseIcon(sy.systemInventoryStatus, sy.systemTicket),
                    systemStatus: strTgs.trueFalseIcon(sy.systemStatus, sy.systemStatus),
                    sysmodifiedOn: strTgs.dateMod(sy.modifiedOn),
                    systemTicket: sy.systemTicket,
                    systemNotes: sy.systemNotes,
                    equipLocation: tempSys.equipLocation,
                    equipLocationRack: strTgs.ruToLocation(tempSys.equipLocation),
                    equipSN: tempSys.equipSN,
                    equipStatus: tempSys.equipStatus,
                    equipStatusLight: strTgs.trueFalseIcon(tempSys.equipStatus, tempSys.equipStatus),
                    equipType: tempSys.equipType,
                    equipMake: tempSys.equipMake,
                    equipModel: tempSys.equipModel,
                    equipSubModel: tempSys.equipSubModel,
                    equipRUHieght: tempSys.equipRUHieght,
                    equipAddOns: tempSys.equipAddOns,
                    equipAcquisition: strTgs.dateMod(tempSys.equipAcquisition),
                    equipWarrantyMo: strTgs.addAndCompDates(tempSys.equipAcquisition, tempSys.equipWarrantyMo),
                    equipPONum: tempSys.equipPONum,
                    equipInvoice: tempSys.equipInvoice,
                    equipProjectNum: tempSys.equipProjectNum,
                    equipNotes: tempSys.equipNotes,
                    equipmodifiedOn: strTgs.dateMod(tempSys.modifiedOn),
                  };
                }),
              };
              // the 'location/datacenter-list' is the view that will be called
              // context is the data from above
              // console.dir(context);
              res.render('asset/env-role-report', context);
            });
          });
        } else if (editLoad > 9) {
          // this looks for 'list' as the / url. if it exists, it prints the datacenter list
          query = queryString(searchFor, editLoad, searchIn);
          query.sort({
            'equipSN': 'asc',
          }).exec((err, eqs) => {
            if (err) return next (err);
            // logger.info('>9 >'+searchFor);
            Models.Systemdb.find({}, 'systemName systemAlias systemParentId systemEquipSN systemEnviron systemRole systemInventoryStatus systemTicket systemNotes systemStatus modifiedOn', function(err, sys) {

              // logger.info('system-list'+sys);
              var context = {
                titleNow: '.. ' + searchFor,
                equipsys: 'true',
                reportType: req.body.systemEnviron,
                drop1: 'Environment',
                drop1url: '/reports/env-',
                drop1each: env.sort(),
                drop2: 'Roles',
                drop2url: '/reports/role-',
                drop2each: role.sort(),
                drop3: 'Make',
                drop3url: '/reports/make-',
                drop3each: make.sort(),
                lastSearch: lastSearch,

                eqs: eqs.map(function(eq) {
                  var tempSys = strTgs.findThisInThatMulti(eq.equipSN, sys, 'systemEquipSN');
                  // rack.populate('rackParentDC', 'abbreviation cageNickname')
                  // logger.info('sy Map>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+sy);
                  return {
                    systemName: tempSys.systemName,
                    systemAlias: tempSys.systemAlias,
                    systemParentId: tempSys.systemParentId,
                    systemEquipSN: tempSys.systemEquipSN,
                    systemEnviron: tempSys.systemEnviron,
                    systemRole: tempSys.systemRole,
                    systemTicketLit: strTgs.trueFalseIcon(tempSys.systemInventoryStatus, tempSys.systemTicket),
                    systemStatus: strTgs.trueFalseIcon(tempSys.systemStatus, tempSys.systemStatus),
                    sysmodifiedOn: strTgs.dateMod(tempSys.modifiedOn),
                    systemTicket: tempSys.systemTicket,
                    systemNotes: tempSys.systemNotes,
                    equipLocation: eq.equipLocation,
                    equipLocationRack: strTgs.ruToLocation(eq.equipLocation),
                    equipSN: eq.equipSN,
                    equipStatus: eq.equipStatus,
                    equipStatusLight: strTgs.trueFalseIcon(eq.equipStatus, eq.equipStatus),
                    equipType: eq.equipType,
                    equipMake: eq.equipMake,
                    equipModel: eq.equipModel,
                    equipSubModel: eq.equipSubModel,
                    equipAddOns: eq.equipAddOns,
                    equipRUHieght: eq.equipRUHieght,
                    equipAcquisition: strTgs.dateMod(eq.equipAcquisition),
                    equipWarrantyMo: strTgs.addAndCompDates(eq.equipAcquisition, eq.equipWarrantyMo),
                    equipPONum: eq.equipPONum,
                    equipInvoice: eq.equipInvoice,
                    equipProjectNum: eq.equipProjectNum,
                    equipNotes: eq.equipNotes,
                    equipmodifiedOn: strTgs.dateMod(eq.modifiedOn),
                  };
                }),
              };
              // the 'location/datacenter-list' is the view that will be called
              // context is the data from above
              // console.dir(context);
              res.render('asset/env-role-report', context);
            });
          });
        }
      });
    });
  });
};



// Custom CSV report ///////////////////////////////////////////
/*
I never had any intention of writing a direct to CSV report but
consumers were not ready for a JSON api and needed CSV so this
is what I came up with to try and get the most utility out of
this request.

The route is based on the collection targeted.


*/

// /reports/systems/:findIn/:findWhat

// /reports/systems/dcSite/rsys-dc01.csv
// /reports/systems/dcSite/rsys-dc01
// /reports/systems/systemRole/launch.csv
// /reports/systems/systemEnviron/ri4
// req.params.findIn
// req.params.findWhat
// module.exports.systemsAggrPost = (req, res) => {
//   var prms = req.body;
//   // console.dir(req.body);
//   res.redirect(`/reports/systems/${prms.findIn}/${prms.findWhat}`);
// };

module.exports.systemsAggr = (req, res, next) => {
  var context = {};
  var data = req.params;
  var queryTest1;
  var findThis;
  var matchTest1;
  var filename;
  if (!data.findIn) {
    data.findIn = strTgs.multiTrim(req.body.findIn, 9, 0);
    data.findWhat = req.sanitize(req.body.findWhat);
  }
  logger.info(`findIn: ${data.findIn} / findWhat: ${data.findWhat}`);
  // setting some defaults if they don't pick have a file type
  data.resType = 'view';
  data.resExt = '';
  data.equipmentOrSystems = 'systems';
  // set to CSV or JSON
  if ((/.csv$/).test(data.findWhat)) {
    data.resType = 'csv';
    data.resExt = '.csv';
    data.findWhat = data.findWhat.substring(0, data.findWhat.length - 4);
  } else if ((/.json/g).test(data.findWhat)) {
    data.resType = 'json';
    data.resExt = '.json';
    data.findWhat = data.findWhat.substring(0, data.findWhat.length - 5);
  } else {
    res.render('asset/reports', data);
    // data.findWhat = data.findWhat;
    return;
  }
  // What are we looking for, this can certainly get better with query strings
  // This says, if they are specific, do that, otherwise do rsys

  // This block does locations
  findThis = (data.findWhat || 'XXXXXX');

  matchTest1 = {
    equipLocation: { 'equip.equipLocation': { '$regex': findThis, '$options': 'i'}},
    equipMake: { 'equip.equipMake': { '$regex': findThis, '$options': 'i'}},
    equipPONum: { 'equip.equipPONum': { '$regex': findThis, '$options': 'i'}},
    systemName: { 'systemName': { '$regex': findThis, '$options': 'i'}},
    systemRole: { 'systemRole': { '$regex': findThis, '$options': 'i'}},
    systemEnviron: { 'systemEnviron': { '$regex': findThis, '$options': 'i'}},
  };

  queryTest1 = matchTest1.hasOwnProperty(data.findIn);
  if (!queryTest1) {
    console.warn('ERRORsystems-aggr Report - Incorrect findIn value');
    res.status(404).send(`Check your URL, ${data.findIn} may not be a proper search field`);
    return;
  }
  data.queryIn = matchTest1[data.findIn];

  Models.Systemdb.aggregate([
    {$lookup:
      { from: 'equipment',
        localField: 'systemEquipSN',
        foreignField: 'equipSN',
        as: 'equip',
      },
    },
    {$match: data.queryIn,
    },
    {$match:
      {$or: [
        {'equip.equipStatus': 'In Service'},
        {'equip.equipStatus': 'In Service with issues'},
      ]},
    },
  ],
    (err, result) => {
      if (err) return next (err);
      context = result.map((rslt) => {
        // while it is not normal to have an equipment without a system,
        // and in the current config, because we check for "In Service" on
        // the equipment it can't happen, in the future this may be an option
        // and I don't want it breaking then.
        if (rslt.equip.length > 0) {
          rslt.equipRUHieght = rslt.equip[0].equipRUHieght || '';
          rslt.equipSN = rslt.equip[0].equipSN || '';
          rslt.equipStatus = rslt.equip[0].equipStatus || '';
          rslt.equipEOL = rslt.equip[0].equipEOL || '';
          rslt.equipMake = rslt.equip[0].equipMake || '';
          rslt.equipModelWithSubs = rslt.equipModelWithSubs || '';
          rslt.equipModel = rslt.equip[0].equipModel || '';
          rslt.equipSubModel = rslt.equip[0].equipSubModel || '';
          rslt.equipAddOns = rslt.equip[0].equipAddOns || '';
          rslt.equipParent = rslt.equip[0].equipParent || '';
          rslt.equipLocation = rslt.equip[0].equipLocation || '';
          rslt.equipStatusLight = rslt.equip[0].equipStatus || '';
          rslt.equipType = rslt.equip[0].equipType || '';
          rslt.equipAcquisition = rslt.equip[0].equipAcquisition || '';
          rslt.equipWarrantyMo = rslt.equip[0].equipWarrantyMo || '';
          rslt.equipPONum = rslt.equip[0].equipPONum || '';
          rslt.equipInvoice = rslt.equip[0].equipInvoice || '';
          rslt.equipProjectNum = rslt.equip[0].equipProjectNum || '';
          rslt.equipMaintAgree = rslt.equip[0].equipMaintAgree || '';
          rslt.equipNotes = rslt.equip[0].equipNotes || '';
          rslt.equipmodifiedOn = rslt.equip[0].modifiedOn || '';
          rslt.equip_id = rslt.equip[0]._id || '';
        } else {
          rslt.equipRUHieght = '';
          rslt.equipSN = '';
          rslt.equipStatus = '';
          rslt.equipEOL = '';
          rslt.equipMake = '';
          rslt.equipModelWithSubs = '';
          rslt.equipModel = '';
          rslt.equipSubModel = '';
          rslt.equipAddOns = '';
          rslt.equipParent = '';
          rslt.equipLocation = '';
          rslt.equipStatusLight = '';
          rslt.equipType = '';
          rslt.equipAcquisition = '';
          rslt.equipWarrantyMo = '';
          rslt.equipPONum = '';
          rslt.equipInvoice = '';
          rslt.equipProjectNum = '';
          rslt.equipMaintAgree = '';
          rslt.equipNotes = '';
          rslt.equipmodifiedOn = '';
          rslt.equip_id = '';
        }
        rslt.locCode = strTgs.locDest(rslt.equipLocation);
        rslt.equipModelWithSubs = `${rslt.equipModel} ${rslt.equipSubModel} ${rslt.equipSubModel}`;
        return {
          systemName: rslt.systemName,
          dcSite: rslt.locCode.dcSite,
          dcCage: rslt.locCode.dcCage,
          dcRack: rslt.locCode.dcRack,
          dcRU: rslt.locCode.dcRU,
          equipRUHieght: rslt.equipRUHieght,
          systemStatus: rslt.systemStatus,
          systemEnviron: rslt.systemEnviron,
          systemRole: rslt.systemRole,
          equipSN: rslt.equipSN,
          equipStatus: rslt.equipStatus,
          equipMake: rslt.equipMake,
          equipModelWithSubs: rslt.equipModelWithSubs,
          equipModel: rslt.equipModel,
          equipSubModel: rslt.equipSubModel,
          equipAddOns: rslt.equipAddOns,
          systemAlias: rslt.systemAlias,
          systemParentId: rslt.systemParentId,
          systemEquipSN: rslt.systemEquipSN,
          sysmodifiedOn: rslt.modifiedOn,
          systemTicket: rslt.systemTicket,
          systemNotes: rslt.systemNotes,
          systemOSType: rslt.systemOSType,
          systemOSVersion: rslt.systemOSVersion,
          equipParent: rslt.equipParent,
          equipLocation: rslt.equipLocation,
          equipStatusLight: rslt.equipStatus,
          equipType: rslt.equipType,
          equipAcquisition: rslt.equipAcquisition,
          equipEOL: rslt.equipEOL,
          equipPONum: rslt.equipPONum,
          equipInvoice: rslt.equipInvoice,
          equipProjectNum: rslt.equipProjectNum,
          equipMaintAgree: rslt.equipMaintAgree,
          equipNotes: rslt.equipNotes,
          equipmodifiedOn: rslt.modifiedOn,
          system_id: rslt._id,
          equip_id: rslt.equip_id,
        };
      });
      //
      if (data.resType === 'csv') {
        filename = data.findWhat + data.resExt;
        res.setHeader('Content-disposition', `attachment; filename=${filename}`);
        res.setHeader('content-type', 'text/csv');
        csv.writeToString(context, {
          headers: true,
          objectMode: true,
        }, (err, contextCsv) => {
          if (err) return next(err);
          res.send(contextCsv);
        });
      } else {
        res.json(context);
      }
    }
  );
};

module.exports.equipmentAggr = (req, res, next) => {
  var context = {};
  var data = req.params;
  var findThis;
  var matchTest1;
  var queryTest1;
  var matchTest2;
  var queryTest2;
  var filename;
  logger.info(`req.body ${JSON.stringify(req.body)}`);
  logger.info(`req.params ${JSON.stringify(req.params)}`);
  logger.info(`data ${JSON.stringify(data)}`);
  data.query = req.query;
  if (!data.findIn) {
    data.findIn = req.body.findIn;
    data.findWhat = req.body.findWhat;
  }
  if (req.body) {
    data.equipEOL = req.body.equipEOL;
    data.equipLocation = req.body.equipLocation;
  }
  data.findIn = strTgs.multiTrim(data.findIn, 9, 0);
  data.findWhat = req.sanitize(data.findWhat);
  logger.info(`findIn: ${data.findIn} / findWhat: ${data.findWhat}`);

  // setting some defaults if they don't pick have a file type
  data.resType = 'view';
  data.resExt = '';
  data.equipmentOrSystems = 'equipment';
  // set to CSV or JSON
  if ((/.csv$/).test(data.findWhat)) {
    data.resType = 'csv';
    data.resExt = '.csv';
    data.findWhat = data.findWhat.substring(0, data.findWhat.length - 4);
  } else if ((/.json/g).test(data.findWhat)) {
    data.resType = 'json';
    data.resExt = '.json';
    data.findWhat = data.findWhat.substring(0, data.findWhat.length - 5);
  } else {
    data.query = objToQString(data.query);
    return res.render('asset/reports', data);
    // data.findWhat = data.findWhat;
  }
  // What are we looking for, this can certainly get better with query strings
  // This says, if they are specific, do that, otherwise do rsys

  // This block does locations
  findThis = (data.findWhat || 'XXXXXX');

  // Matches req.param.findIn to a regex filter to be used in the $match
  matchTest1 = {
    equipSN: { 'equipSN': { '$regex': findThis, '$options': 'i' } },
    equipParent: { 'equipParent': { '$regex': findThis, '$options': 'i' } },
    equipLocation: { 'equipLocation': { '$regex': findThis, '$options': 'i' } },
    equipStatus: { 'equipStatus' : { '$regex': findThis, '$options': 'i' } },
    equipMake: { 'equipMake': { '$regex': findThis, '$options': 'i' } },
    equipPONum: { 'equipPONum': { '$regex': findThis, '$options': 'i' } },
    equipInvoice: { 'equipInvoice': { '$regex': findThis, '$options': 'i' } },
    equipProjectNum: { 'equipProjectNum': { '$regex': findThis, '$options': 'i' } },
    systemName: { 'systm.systemName': { '$regex': findThis, '$options': 'i' } },
    systemRole: { 'systm.systemRole': { '$regex': findThis, '$options': 'i' } },
    systemEnviron: { 'systm.systemEnviron': { '$regex': findThis, '$options': 'i' } },
    systemTicket: { 'systm.systemTicket': { '$regex': findThis, '$options': 'i' } },
    systemParentId: { 'systm.systemParentId': { '$regex': findThis, '$options': 'i' } },
    systemAlias: { 'systm.systemAlias': { '$regex': findThis, '$options': 'i' } },
  };

  queryTest1 = matchTest1.hasOwnProperty(data.findIn);
  if (!queryTest1) {
    console.warn('ERROR equipmentAggr Report - Incorrect findIn value');
    return res.status(404).send(`Check your URL, ${data.findIn} may not be a proper search field`);
  }
  data.queryIn = matchTest1[data.findIn];

  data.equipEOL = null;
  if (data.query.equipEOL === 'true') {
    data.equipEOL = true;
  }

  logger.info(`data.query.equipEOL: ${data.query.equipEOL}`);
  logger.info(`data.equipEOL: ${data.equipEOL}`);

  data.equipLocation = '_';
  if (data.query.equipLocation) {
    data.equipLocation = data.query.equipLocation;
  }

  Models.Equipment.aggregate([
    {
      $match: { 'equipLocation': { '$regex': data.equipLocation, '$options': 'i' } },
    },
    {
      $match: { 'equipEOL' : data.equipEOL },
    },
    {
      $lookup: {
        from: 'systemdbs',
        localField: 'equipSN',
        foreignField: 'systemEquipSN',
        as: 'sys',
      },
    },
    { $match: data.queryIn,
    },
    ], (err, result) => {
    if (err) return next(err);
    context = result.map((rslt) => {
      rslt.locCode = strTgs.locDest(rslt.equipLocation);
      rslt.equipModelWithSubs = `${rslt.equipModel} ${rslt.equipSubModel} ${rslt.equipSubModel}`;
      if (rslt.sys.length > 0) {
        rslt.systemName = rslt.sys[0].systemName || '';
        rslt.systemStatus = rslt.sys[0].systemStatus || '';
        rslt.systemEnviron = rslt.sys[0].systemEnviron || '';
        rslt.systemRole = rslt.sys[0].systemRole || '';
        rslt.systemAlias = rslt.sys[0].systemAlias || '';
        rslt.systemParentId = rslt.sys[0].systemParentId || '';
        rslt.systemEquipSN = rslt.sys[0].systemEquipSN || '';
        rslt.modifiedOn = rslt.sys[0].modifiedOn || '';
        rslt.systemTicket = rslt.sys[0].systemTicket || '';
        rslt.systemNotes = rslt.sys[0].systemNotes || '';
        rslt.systemOSType = rslt.sys[0].systemOSType || '';
        rslt.systemOSVersion = rslt.sys[0].systemOSVersion || '';
        rslt.sys_id = rslt.sys[0]._id || '';
      } else {
        rslt.systemName = '';
        rslt.systemStatus = '';
        rslt.systemEnviron = '';
        rslt.systemRole = '';
        rslt.systemAlias = '';
        rslt.systemParentId = '';
        rslt.systemEquipSN = '';
        rslt.modifiedOn = '';
        rslt.systemTicket = '';
        rslt.systemNotes = '';
        rslt.systemOSType = '';
        rslt.systemOSVersion = '';
        rslt.sys_id = '';
      }
      // I know this seems like a bit of redundancy but
      // there is a requirement to return these in this order
      // so there it is.
      return {
        systemName: rslt.systemName,
        dcSite: rslt.locCode.dcSite,
        dcCage: rslt.locCode.dcCage,
        dcRack: rslt.locCode.dcRack,
        dcRU: rslt.locCode.dcRU,
        equipRUHieght: rslt.equipRUHieght,
        systemStatus: rslt.systemStatus,
        systemEnviron: rslt.systemEnviron,
        systemRole: rslt.systemRole,
        equipSN: rslt.equipSN,
        equipStatus: rslt.equipStatus,
        equipMake: rslt.equipMake,
        equipModelWithSubs: rslt.equipModelWithSubs,
        equipModel: rslt.equipModel,
        equipSubModel: rslt.equipSubModel,
        equipAddOns: rslt.equipAddOns,
        systemAlias: rslt.systemAlias,
        systemParentId: rslt.systemParentId,
        systemEquipSN: rslt.systemEquipSN,
        sysmodifiedOn: rslt.modifiedOn,
        systemTicket: rslt.systemTicket,
        systemNotes: rslt.systemNotes,
        systemOSType: rslt.systemOSType,
        systemOSVersion: rslt.systemOSVersion,
        equipParent: rslt.equipParent,
        equipLocation: rslt.equipLocation,
        equipType: rslt.equipType,
        equipAcquisition: rslt.equipAcquisition,
        equipEOL: rslt.equipEOL,
        equipWarrantyMo: rslt.equipWarrantyMo,
        equipPONum: rslt.equipPONum,
        equipInvoice: rslt.equipInvoice,
        equipProjectNum: rslt.equipProjectNum,
        equipMaintAgree: rslt.equipMaintAgree,
        equipNotes: rslt.equipNotes,
        equipmodifiedOn: rslt.modifiedOn,
        system_id: rslt.sys_id,
        equip_id: rslt._id,
      };
    });

    if (data.resType === 'csv') {
      filename = data.findWhat + data.resExt;
      res.setHeader('Content-disposition', `attachment; filename=${filename}`);
      res.setHeader('content-type', 'text/csv');
      csv.writeToString(context, {
        headers: true,
        objectMode: true,
      }, (err, contextCsv) => {
        if (err) return next(err);
        res.send(contextCsv);
      });
    } else {
      res.json(context);
    }
  });
};


