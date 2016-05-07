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
  var context = {
    access: accConfig.accessCheck(req.user),
    titleNow: 'Reports',
    reportType: req.body.systemEnviron,
    drop1: 'Environment',
    drop1each: '<ul class="dropdown-menu drop-columns pull-right" id="systemEnvironDrop"></ul>',
    drop2: 'Role',
    drop2each: '<ul class="dropdown-menu drop-columns pull-right" id="systemRoleDrop"></ul>',
    drop3: 'Make',
    drop3each: '<ul class="dropdown-menu drop-columns pull-right" id="equipMakeDrop"></ul>',
  };
  return res.render('asset/env-role-report', context);
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
                drop1each: '<ul class="dropdown-menu drop-columns pull-right" id="systemEnvironDrop"></ul>',
                drop2: 'Role',
                drop2each: '<ul class="dropdown-menu drop-columns pull-right" id="systemRoleDrop"></ul>',
                drop3: 'Make',
                drop3each: '<ul class="dropdown-menu drop-columns pull-right" id="equipMakeDrop"></ul>',
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
                drop1each: '<ul class="dropdown-menu drop-columns pull-right" id="systemEnvironDrop"></ul>',
                drop2: 'Role',
                drop2each: '<ul class="dropdown-menu drop-columns pull-right" id="systemRoleDrop"></ul>',
                drop3: 'Make',
                drop3each: '<ul class="dropdown-menu drop-columns pull-right" id="equipMakeDrop"></ul>',
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

// ////////////////////////////////////////////////////////////////////////////
//                             New reports
// ////////////////////////////////////////////////////////////////////////////

module.exports.queryAggr = (req, res, next) => {
  logger.info(`queryAggr REQ.PATH\n${req.path}`);
  var data = req.params;
  var fileType = req.params.fileType || '';
  logger.info(`queryAggr 010\nreq.body ${JSON.stringify(req.body)}`);
  logger.info(`queryAggr 020\nreq.params ${JSON.stringify(req.params)}`);
  logger.info(`queryAggr 025\nreq.query $JSON.stringify(req.query}`);
  data.query = req.query;
  //data.query = strTgs._compact(req.query);
  logger.info(`queryAggr 030\ndata ${JSON.stringify(data)}`);
  if (!data.findIn) {
    data.findIn = data.query.findIn;
    data.findWhat = data.query.findWhat + fileType;
  }
  if (!data.findIn) {
    data.findIn = 'equipNull';
    data.findWhat = `all${fileType}`;
  }
  data.findIn = strTgs.multiTrim(data.findIn, 9, 0);
  data.findWhat = req.sanitize(data.findWhat);
  data.ugly = data.query.ugly;
  logger.info(`queryAggr 040\nfindIn: ${data.findIn} / findWhat: ${data.findWhat}`);
  // setting some defaults if they don't pick have a file type
  data.resType = 'view';
  data.resExt = '';
  // redirects to the system or equipment JSON and CSV reports
  if (data.findIn && data.findIn.indexOf('sys') === 0) {
    data.collection = 'systems';
  } else {
    data.collection = 'equipment';
  }
  // set to CSV or JSON
  logger.info(`queryAggr 050 - data ${JSON.stringify(data)}`);
  data.query = objToQString(data.query);
  data.drop1 = 'Environment';
  data.drop1each = '<ul class="dropdown-menu drop-columns pull-right" id="systemEnvironDrop"></ul>';
  data.drop2 = 'Role';
  data.drop2each = '<ul class="dropdown-menu drop-columns pull-right" id="systemRoleDrop"></ul>';
  data.drop3 = 'Make';
  data.drop3each = '<ul class="dropdown-menu drop-columns pull-right" id="equipMakeDrop"></ul>';
  data.menu1 = 'JSON';
  data.menuLink1 = `/reports/${data.collection}/${data.findIn}/${data.findWhat}.json?${data.query}`;
  data.menu2 = 'CSV';
  data.menuLink2 = `/reports/${data.collection}/${data.findIn}/${data.findWhat}.csv?${data.query}`;
  return res.render('asset/reports', data);
};


// First pass could retrn equipment or systems style report.
// Make an object that decides what kind of json report to return based on what is searched for.
// Still to hash out is how to do report options.
// Also, do we have a super search, using {$or [blah, blah]} for system or alias.

module.exports.multiAggr = (req, res, next) => {
  var context = {};
  var data = req.params;
  var fileType = req.params.fileType || '';
  var findThis;
  var matchTest1;
  var queryTest1;
  var filename;
  var aggPipePreLookup;
  var aggPipeLookup;
  var aggPipePostLookup = [];
  var aggPipePostFilter;
  var aggPipeline;
  var filterResArr = [];
  var filterNor = 0;
  var modCollection;
  var sortField;
  var aggPipePostSort;
  logger.info(`multiAggr 010\nreq.body ${JSON.stringify(req.body)}`);
  logger.info(`multiAggr 020\nreq.params ${JSON.stringify(req.params)}`);
  logger.info(`multiAggr 025\nreq.query ${JSON.stringify(req.query)}`);
  data.query = req.query;
  if (!data.findIn) {
    data.findIn = data.query.findIn;
    data.findWhat = data.query.findWhat + fileType;
  }
  // filterNor sets the filter to $nor insetad of $or
  if (data.query.filterNor === '1') {
    filterNor = 1;
  }
  // ugly sets the table to use field names instead of friendly names
  if (data.query) {
    data.ugly = data.query.ugly;
  }

  data.findIn = strTgs.multiTrim(data.findIn, 9, 0);
  data.findWhat = req.sanitize(data.findWhat);
  // setting some defaults if they don't pick have a file type
  data.resType = 'view';
  data.resExt = '';
  logger.info(`multiAggr 030\ndata ${JSON.stringify(data)}\n`);
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
    data.drop1 = 'Environment';
    data.drop1each = '<ul class="dropdown-menu drop-columns pull-right" id="systemEnvironDrop"></ul>';
    data.drop2 = 'Role';
    data.drop2each = '<ul class="dropdown-menu drop-columns pull-right" id="systemRoleDrop"></ul>';
    data.drop3 = 'Make';
    data.drop3each = '<ul class="dropdown-menu drop-columns pull-right" id="equipMakeDrop"></ul>';
    data.menu1 = 'JSON';
    data.menuLink1 = `/reports/${data.collection}/${data.findIn}/${data.findWhat}.json?${data.query}`;
    data.menu2 = 'CSV';
    data.menuLink2 = `/reports/${data.collection}/${data.findIn}/${data.findWhat}.csv?${data.query}`;
    return res.render('asset/reports', data);
  }

  // This block does locations
  findThis = (data.findWhat || 'XXXXXX');

  // Matches req.param.findIn to a regex filter to be used in the $match
  matchTest1 = {
    equipNull: { $match: { 'equipNull': null } },
    equipSN: { $match: { 'equipSN': { '$regex': findThis, '$options': 'i' } } },
    equipParent: { $match: { 'equipParent': { '$regex': findThis, '$options': 'i' } } },
    equipLocation: { $match: { 'equipLocation': { '$regex': findThis, '$options': 'i' } } },
    equipStatus: { $match: { 'equipStatus': { '$regex': findThis, '$options': 'i' } } },
    equipTemplate: { $match: { 'equipTemplate': Boolean(findThis) } },
    equipInventoryStatus: { $match: { 'equipInventoryStatus': Boolean(findThis) } },
    equipLOB: { $match: { 'equipLOB': { '$regex': findThis, '$options': 'i' } } },
    equipMake: { $match: { 'equipMake': { '$regex': findThis, '$options': 'i' } } },
    equipPONum: { $match: { 'equipPONum': { '$regex': findThis, '$options': 'i' } } },
    equipInvoice: { $match: { 'equipInvoice': { '$regex': findThis, '$options': 'i' } } },
    equipProjectNum: { $match: { 'equipProjectNum': { '$regex': findThis, '$options': 'i' } } },
    equipTicketNumber: { $match: { 'equipTicketNumber': { '$regex': findThis, '$options': 'i' } } },
    equipModifiedBy: { $match: { 'modifiedBy': { '$regex': findThis, '$options': 'i' } } },
    equipPortsAddr: { $match: { 'equipPorts.equipPortsAddr': { '$regex': findThis, '$options': 'i' } } },
    systemName: { 'systemName': { '$regex': findThis, '$options': 'i' } },
    systemRole: { 'systemRole': { '$regex': findThis, '$options': 'i' } },
    systemEnviron: { 'systemEnviron': { '$regex': findThis, '$options': 'i' } },
    systemTicket: { 'systemTicket': { '$regex': findThis, '$options': 'i' } },
    systemParentId: { 'systemParentId': { '$regex': findThis, '$options': 'i' } },
    systemAlias: { 'systemAlias': { '$regex': findThis, '$options': 'i' } },
    systemTemplate: { 'systemTemplate': Boolean(findThis) },
    systemModifiedBy: { 'modifiedBy': { '$regex': findThis, '$options': 'i' } },
    sysPortEndPoint: { 'systemPorts.sysPortEndPoint': { '$regex': findThis, '$options': 'i' } },
    sysPortAddress: { 'systemPorts.sysPortAddress': { '$regex': findThis, '$options': 'i' } },
    sysPortVlan: { 'systemPorts.sysPortVlan': { '$regex': findThis, '$options': 'i' } },
    sysPortCablePath: { 'systemPorts.sysPortCablePath': { '$regex': findThis, '$options': 'i' } },
  };
  // generic
  // return res.status(404).send(`Check your URL, ${data.findIn} may not be a proper search field`);
  queryTest1 = matchTest1.hasOwnProperty(data.findIn);
  if (!queryTest1) {
    data.queryIn = { 'noMatch' : null };
    console.warn('ERROR equipmentAggr Report - Incorrect findIn value');
  } else {
    data.queryIn = matchTest1[data.findIn];
  }
  // preMatch reduces the number of $lookup that needs to happen
  // for EOL reports. Set to true, returns only equipment that is no longer in inventory

  // this is for old api compatability.
  if (data.collection === 'systems' && data.findIn === 'equipLocation') {
    data.collection = 'equipment';
  }

  if (data.collection === 'systems') {
    modCollection = 'Systemdb';
    aggPipePreLookup = { $match: data.queryIn };
    aggPipeLookup = {
      $lookup:
        { from: 'equipment',
          localField: 'systemEquipSN',
          foreignField: 'equipSN',
          as: 'equip',
        },
    };
    logger.info(`S - equipLocation ${data.query.equipLocation}`);
    if (data.query.equipLocation) {
      aggPipePostLookup.push({ $match: { 'equip.equipLocation': { '$regex': data.query.equipLocation, '$options': 'i' } } });
    }
    logger.info(`S - equipType ${data.query.equipType}`);
    if (data.query.equipType) {
      aggPipePostLookup.push({ $match: { 'equip.equipType': { '$regex': data.query.equipType, '$options': 'i' } } });
    }
    aggPipePostSort = { $sort: { 'systemEnviron': 1, 'systemRole':1, 'systemName': 1 } };
  } else {
    modCollection = 'Equipment';
    // removing EOL
    data.preMatchEquipment = [{ $or: [{ 'equipEOL' : null }, { 'equipEOL' : false }] }];
    if (data.query.equipEOL === 'true') {
      data.preMatchEquipment = [{ 'equipEOL' : true }];
    }
    // focus on location
    logger.info(`E - equipLocation ${data.query.equipLocation}`);
    if (data.query.equipLocation) {
      data.preMatchEquipment.unshift({ 'equipLocation': { '$regex': data.query.equipLocation, '$options': 'i' } });
    }
    logger.info(`E - equipLocNull ${data.query.equipLocNull}`);
    if (data.query.equipLocNull) {
      data.preMatchEquipment.unshift({ $or:[{ 'equipLocation': null }, { 'equipLocation': false }, { 'equipLocation': '' }] });
    }
    // focus on particular Make
    logger.info(`E - equipMake: ${data.query.equipMake}`);
    if (data.query.equipMake) {
      data.preMatchEquipment.push({ 'equipMake': { '$regex': data.query.equipMake, '$options': 'i' } });
    }

    aggPipePreLookup = { $match: { $and: data.preMatchEquipment } };

    aggPipeLookup = {
      $lookup:
      {
        from: 'systemdbs',
        localField: 'equipSN',
        foreignField: 'systemEquipSN',
        as: 'sys',
      },
    };
    aggPipePostLookup = [data.queryIn];
    aggPipePostSort = { $sort: { 'equipMake': 1, 'equipModel': 1, 'equipSubModel': 1 } };
  }
  // Build the pipline with preLookup and lookup
  aggPipeline = [aggPipePreLookup, aggPipeLookup];
  // Add postLookup if exists

  if (aggPipePostLookup) {
    logger.info(`aPPL`);
    aggPipePostLookup.forEach((aPPL) => {
      aggPipeline.push(aPPL);
    });
  }
  // generic aggPipePostFilter
  if (data.query && data.query.filterOn) {
    data.filterOn = data.query.filterOn;
    data.filterArr = data.query.filterArr.split(',');
    data.filterArr.forEach((fArr) => {
      filterResArr.push({ [data.filterOn]: { '$regex': fArr, '$options': 'i' } });
    });
    if (filterNor === 1) {
      aggPipePostFilter = { $match: { $nor: filterResArr } };
    } else {
      aggPipePostFilter = { $match: { $or: filterResArr } };
    }
    aggPipeline.push(aggPipePostFilter);
  }
  // generic sort formatted like &sortField={"systemEnviron":1,"equip.equipMake":1}
  // or &sortField={%22systemEnviron%22:1,%22systemRole%22:1,%22systemName%22:1}
  // the sort needs to match the collection to work
  // defaults to equipLocation if nothing is given


  if (data.query && data.query.sortField) {
    logger.info(`multiAggr 040\njson.parse ${JSON.stringify(JSON.parse(data.query.sortField))}`);
    sortField = JSON.parse(data.query.sortField);
    aggPipePostSort = { $sort: sortField };
  }
  aggPipeline.push(aggPipePostSort);
  logger.info(`aggPipeline \n${JSON.stringify(aggPipeline)}\n`);

  Models[modCollection].aggregate(aggPipeline, (err, result) => {
    if (err) return next(err);
    context = result.map((rslt) => {
      if (data.collection === 'systems') {
        if (rslt.equip.length > 0) {
          rslt.equipRUHieght = rslt.equip[0].equipRUHieght || '';
          rslt.equipSN = rslt.equip[0].equipSN || '';
          rslt.equipStatus = rslt.equip[0].equipStatus || '';
          rslt.equipEOL = rslt.equip[0].equipEOL || '';
          rslt.equipLOB = rslt.equip[0].equipLOB || '';
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
          rslt.equipLOB = '';
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
        rslt.sys_id = rslt._id;
      }
      if (data.collection === 'equipment') {
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
        rslt.equip_id = rslt._id;
      }
      rslt.locCode = strTgs.locDest(rslt.equipLocation);
      rslt.equipModelWithSubs = rslt.equipModel + ' ' + rslt.equipSubModel + ' ' + rslt.equipAddOns;
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
        equipLOB: rslt.equipLOB,
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
        equip_id: rslt.equip_id,
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
