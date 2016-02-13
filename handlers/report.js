const async = require('async');
const logger = require('../lib/logger.js');
const strTgs = require('../lib/stringThings.js');
const accConfig = require('../config/access');
const dates = require('../lib/dates.js');
const moment = require('moment');
const ObjectId = require('mongoose').Types.ObjectId;
const IpSubnetCalculator = require('ip-subnet-calculator');

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

module.exports.dcReport = function fdcReport(req, res) {
  if (accConfig.accessCheck(req.user).read !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
    Models.Systemdb.distinct('systemEnviron').exec(function(err, env) {
      // logger.info(env);
      Models.Systemdb.distinct('systemRole').exec(function(err, role) {
        // logger.info(role);
        Models.Equipment.distinct('equipMake').exec(function(err, make) {
          context = {
            access: accConfig.accessCheck(req.user),
            user: req.user,
            requrl: req.url,
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
          res.render('asset/env-role-report', context);
        });
      });
    });
  }
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
module.exports.reportByInserviceEnv = function(req, res, next) {
  if (accConfig.accessCheck(req.user).read !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
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
    function(err, result) {
      if (err) {
        next(err);
      } else {
      //  result.forEach(reduceRoles);

        res.json(result);
      }
    }
  );
  }
};

module.exports.reportByInserviceEnvRole = function(req, res) {
  if (accConfig.accessCheck(req.user).read !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
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
    function(err, result) {
      if (err) {
        next(err);
      } else {
        // console.dir(result);
        res.json(result);
      }
    }
  );
  }
};

//  /////////////////////////////////////////////////////////////////////////
//  _______ System Ports Report  __________________________________________________
//  ////////////////////////////////////////////////////////////////////////
/*
function dcSystemPortPages(req, res, next) {
  if (accConfig.accessCheck(req.user).read !== 1) {
    req.session.flash = {
      type: 'danger',
      intro: 'Ooops!',
      message: 'Not Authorized!',
    };
    return res.redirect(303, '/');
  } else {
    //logger.info('--------------------exports.dcSystemPortPages First >');
    if (!req.params.datacenter) {
      Models.Systemdb.find({}).sort({ 'modifiedOn': 'desc'}).exec(function (err, sys) {
        if (err) {
          //    logger.info(err);
        } else {
          //logger.info('system-list'+sys);
          var context = {
            access: accConfig.accessCheck(req.user),
            user: req.user,
            requrl: req.url,
            sys: sys.map(function fdcSystemPortPages05280(sy) {
              // rack.populate('rackParentDC', 'abbreviation cageNickname')
              // logger.info('sy Map>'+sy);
              return {
                systemPorts: sy.systemPorts.map(function fdcSystemPortPages05320(sp) {
                  return {
                    systemName: sy.systemName,
                    equipSN: sy.systemEquipSN,
                    sysPortId: sp._id,
                    sysPortType: sp.sysPortType,
                    sysPortName: sp.sysPortName,
                    sysPortAddress: sp.sysPortAddress,
                    sysPortCablePath: sp.sysPortCablePath,
                    sysPortEndPoint: sp.sysPortEndPoint,
                    sysPortEndPointPre: sp.sysPortEndPointPre,
                    sysPortEndPointPort: sp.sysPortEndPointPort,
                    sysPortVlan: sp.sysPortVlan,
                    sysPortOptions: sp.sysPortOptions,
                    sysPortURL: sp.sysPortURL,
                    sysPortCrossover: sp.sysPortCrossover,
                    sysPortCrossoverChecked: strTgs.setCheckBox(sp.sysPortCrossover),
                  };
                }),
              };
            }),
          };
          // the 'location/datacenter-list' is the view that will be called
          // context is the data from above
          res.render('asset/systemports-list', context);
        }
      });
    }
  }
};

*/
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
    case 3: //by Role
      query = Models.Systemdb.find({
        systemRole: findThis
      });
      //        logger.info('query3'+query);
      break;
    case 4: // by System Name (no longer used, now uses Multi)
      query = Models.Systemdb.find({
        'systemName': {
          '$regex': findThis,
          '$options': 'i'
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
              '$options': 'i'
            }
          });
          break;
        case 'systemAlias':
          findThis = strTgs.cTrim(findThis);
          query = Models.Systemdb.find({
            'systemAlias': {
              '$regex': findThis,
              '$options': 'i'
            }
          });
          break;
        case 'systemParentId':
          findThis = strTgs.cTrim(findThis);
          query = Models.Systemdb.find({
            'systemParentId': {
              '$regex': findThis,
              '$options': 'i'
            }
          });
          break;
        case 'systemTicket':
          findThis = strTgs.cTrim(findThis);
          query = Models.Systemdb.find({
            'systemTicket': {
              '$regex': findThis,
              '$options': 'i'
            }
          });
          break;
        case 'modifiedBy':
          findThis = findThis;
          query = Models.Systemdb.find({
            'modifiedBy': {
              '$regex': findThis,
              '$options': 'i'
            }
          });
          break;
        case 'sysPortCablePath':
          findThis = strTgs.stTrim(findThis);
          query = Models.Systemdb.find({
            'systemPorts.sysPortCablePath': {
              '$regex': findThis,
              '$options': 'i'
            }
          });
          break;
        case 'sysPortEndPoint':
          findThis = strTgs.stTrim(findThis);
          query = Models.Systemdb.find({
            'systemPorts.sysPortEndPoint': {
              '$regex': findThis,
              '$options': 'i'
            }
          });
          break;
        case 'sysPortAddress':
          findThis = strTgs.stTrim(findThis);
          query = Models.Systemdb.find({
            'systemPorts.sysPortAddress': {
              '$regex': findThis,
              '$options': 'i'
            }
          });
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
          '$options': 'i'
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
        equipLocation: ''
      });
      //        logger.info('query12'+query);
      break;
    case 13: // Not In Service
      query = Models.Equipment.find({
        'equipStatus': {
          $nin: ['In Service', 'In Service with issues', 'End of Life', 'End of Life - Recycled', 'End of Life - RMA']
        }
      });
      //        logger.info('query13'+query);
      break;
    case 14: // End of life
      query = Models.Equipment.find({
        'equipStatus': {
          $in: ['End of Life', 'Missing', 'End of Life - Recycled', 'End of Life - RMA']
        }
      });
      //        logger.info('query13'+query);
      break;
    case 15: // Spares
      query = Models.Equipment.find({
        'equipStatus': {
          $in: ['Spare']
        }
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
              '$options': 'i'
            }
          });
          break;
        case 'equipAssetTag':
          findThis = strTgs.sTrim(findThis);
          query = Models.Equipment.find({
            'equipAssetTag': {
              '$regex': findThis,
              '$options': 'i'
            }
          });
          break;
        case 'equipTicketNumber':
          findThis = strTgs.cTrim(findThis);
          query = Models.Equipment.find({
            'equipTicketNumber': {
              '$regex': findThis,
              '$options': 'i'
            }
          });
          break;
        case 'equipPONum':
          findThis = strTgs.uTrim(findThis);
          query = Models.Equipment.find({
            'equipPONum': {
              '$regex': findThis,
              '$options': 'i'
            }
          });
          break;
        case 'equipInvoice':
          findThis = strTgs.uTrim(findThis);
          query = Models.Equipment.find({
            'equipInvoice': {
              '$regex': findThis,
              '$options': 'i'
            }
          });
          break;
        case 'equipProjectNum':
          findThis = strTgs.uTrim(findThis);
          query = Models.Equipment.find({
            'equipProjectNum': {
              '$regex': findThis,
              '$options': 'i'
            }
          });
          break;
        case 'modifiedBy':
          query = Models.Equipment.find({
            'modifiedBy': {
              '$regex': findThis,
              '$options': 'i'
            }
          });
          break;
        case 'equipPortsAddr':
          findThis = strTgs.mTrim(findThis);
          query = Models.Equipment.find({
            'equipPorts.equipPortsAddr': {
              '$regex': findThis,
              '$options': 'i'
            }
          });
          break;
        case 'equipLocation':
          findThis = strTgs.sTrim(findThis);
          query = Models.Equipment.find({
            'equipLocation': {
              '$regex': findThis,
              '$options': 'i'
            }
          });
          break;


        default:
          //logger.info('no opt for queryString');
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

module.exports.dcByEnvRole = function(req, res) {
  if (accConfig.accessCheck(req.user).read !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
    //    logger.info('***********exports.dcSystembyEnv First >' +req.params.datacenter);

    var lastSearch,
      editLoad,
      searchDb,
      searchIn,
      searchFor;

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

        //            logger.info('searchIn '+searchIn);
        searchFor = req.query.searchFor;
        //            logger.info('searchFor '+searchFor);
        if (req.query.searchIn.indexOf('system') != -1) {
          editLoad = 8;
        } else if (req.query.searchIn.indexOf('equipment') != -1) {
          editLoad = 18;
        }
      } else {
        editLoad = 1;
        //            logger.info('none slected');
      }
    }
    //        logger.info('page type selected >'+editLoad);

    Models.Systemdb.distinct('systemEnviron').exec(function(err, env) {
      // logger.info(env);
      Models.Systemdb.distinct('systemRole').exec(function(err, role) {
        // logger.info(role);
        Models.Equipment.distinct('equipMake').exec(function(err, make) {

          if (editLoad > 1 && editLoad < 9) {

            // this looks for 'list' as the / url. if it exists, it prints the datacenter list
            query = queryString(searchFor, editLoad, searchIn);
            query.sort({
              'systemName': 'asc'
            }).exec(function(err, sys) {
              if (err) {
                logger.warn(asc + ' ' + err);
              } else {
                //        logger.info('2-9 >'+searchFor);
                Models.Equipment.find({}, 'equipLocation equipSN equipStatus equipType equipMake equipModel equipSubModel equipRUHieght equipAddOns modifiedOn equipAcquisition equipEndOfLife equipWarrantyMo equipPONum equipInvoice equipProjectNum equipNotes', function(err, eqs) {

                  // logger.info('system-list'+sys);
                  var context = {
                    access: accConfig.accessCheck(req.user),
                    user: req.user,
                    requrl: req.url,
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


                    eqs: sys.map(function(sy) {
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
              }
            });
          } else if (editLoad > 9) {
            // this looks for 'list' as the / url. if it exists, it prints the datacenter list
            query = queryString(searchFor, editLoad, searchIn);
            query.sort({
              'equipSN': 'asc',
            }).exec(function(err, eqs) {
              if (err) {
                logger.warn(asc + ' ' + err);
              } else {
                // logger.info('>9 >'+searchFor);
                Models.Systemdb.find({}, 'systemName systemAlias systemParentId systemEquipSN systemEnviron systemRole systemInventoryStatus systemTicket systemNotes systemStatus modifiedOn', function(err, sys) {

                  // logger.info('system-list'+sys);
                  var context = {
                    access: accConfig.accessCheck(req.user),
                    user: req.user,
                    requrl: req.url,
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
              }
            });
          }
        });
      });
    });
  }
};


// Custom CSV report ///////////////////////////////////////////
/*
I never had any intention of writing a direct to CSV report but
consumers were not ready for a JSON api and needed CSV so this
is what I came up with to try and get the most utility out of
this request.

The route is based on the collection targeted.


*/

// /reports/systems-aggr/:findIn/:findWhat

// /reports/systems-aggr/dcSite/rsys-dc01.csv
// /reports/systems-aggr/dcSite/rsys-dc01
// /reports/systems-aggr/systemRole/launch.csv
// /reports/systems-aggr/systemEnviron/ri4
// req.params.findIn
// req.params.findWhat


module.exports.systemsAggr = (req, res) => {
  var context = {};
  var prms = req.params;
  var data = {};
  data.resType = 'view';
  data.findVar = prms.findWhat;
  data.resExt = '';
  if ((/.csv$/).test(prms.findWhat)) {
    data.resType = 'csv';
    data.resExt = '.csv';
    data.findVar = data.findVar.substring(0, data.findVar.length - 4);
  } else if ((/.json/g).test(prms.findWhat)) {
    data.resType = 'json';
    data.resExt = '.json';
    data.findVar = data.findVar.substring(0, data.findVar.length - 5);
  }
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
    ],
    function(err, result) {
      if (err) {
        next(err);
      } else {
        context = result.map(function(rslt) {
          rslt.locCode = strTgs.locDest(rslt.equip[0].equipLocation);
          return {
            systemName: rslt.systemName,
            dcSite: rslt.locCode.dcSite,
            dcCage: rslt.locCode.dcCage,
            dcRack: rslt.locCode.dcRack,
            dcRU: rslt.locCode.dcRU,
            equipRUHieght: rslt.equip[0].equipRUHieght,
            systemStatus: rslt.systemStatus,
            systemEnviron: rslt.systemEnviron,
            systemRole: rslt.systemRole,
            equipSN: rslt.equip[0].equipSN,
            equipStatus: rslt.equip[0].equipStatus,
            equipMake: rslt.equip[0].equipMake,
            equipModelWithSubs: rslt.equip[0].equipModel + ' ' + rslt.equip[0].equipSubModel + ' ' + rslt.equip[0].equipSubModel,
            equipModel: rslt.equip[0].equipModel,
            equipSubModel: rslt.equip[0].equipSubModel,
            equipAddOns: rslt.equip[0].equipAddOns,
            systemAlias: rslt.systemAlias,
            systemParentId: rslt.systemParentId,
            systemEquipSN: rslt.systemEquipSN,
            sysmodifiedOn: rslt.modifiedOn,
            systemTicket: rslt.systemTicket,
            systemNotes: rslt.systemNotes,
            equipLocation: rslt.equip[0].equipLocation,
            equipStatusLight: rslt.equip[0].equipStatus,
            equipType: rslt.equip[0].equipType,
            equipAcquisition: rslt.equip[0].equipAcquisition,
            equipPONum: rslt.equip[0].equipPONum,
            equipInvoice: rslt.equip[0].equipInvoice,
            equipProjectNum: rslt.equip[0].equipProjectNum,
            equipNotes: rslt.equip[0].equipNotes,
            equipmodifiedOn: rslt.equip[0].modifiedOn,
            system_id: rslt._id,
            equip_id: rslt.equip._id,
          };
        });
            //  result.forEach(reduceRoles);
        if (data.resType === 'csv') {
          res.csv(context);
        } else if (data.resType === 'json') {
          res.json(context);
        } else {
          res.render(context);
        }
      }
    }
  // res.status(200).send(`rFndWt ${req.params.findWhat} <br>
                        // fVar ${data.findVar} <br>
                        // rType ${data.resType}`);
  );
};


module.exports.reportByInserviceEnvspare = function(req, res, next) {
  if (accConfig.accessCheck(req.user).read !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
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
    function(err, result) {
      if (err) {
        next(err);
      } else {
      //  result.forEach(reduceRoles);

        res.json(result);
      }
    }
  );
  }
};


