const async = require('async');
const logger = require('../lib/logger.js');
const strTgs = require('../lib/stringThings.js');
const accConfig = require('../config/access');
const addContext = require('contextualizer');
const ObjectId = require('mongoose').Types.ObjectId;
const _ = require('lodash');

// Models
const Models = require('../models');

var start  = '';
var editLoad =0;
var dcabbr = '';
var dcInfo = '';
var dcInfoSplit = '';
var dcSubId = '';
var dcId ='';


// ---------------------------------------------------------------------
// ----------------------   Equipment List  ----------------------------
// ---------------------------------------------------------------------
/*
this is the Equip List block. Looks for 'List' in the URL and returns list of Equipment.
*/
exports.dcEquipAll = (req, res) => {
    // logger.info('***********exports.dcEquipPages First >' +req.params.datacenter);
  var backURL = req.header('Referer') || '/';
  var context;
  if (accConfig.accessCheck(req.user).read !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  }
  // logger.info('in List');
  // this looks for 'list' as the / url. if it exists, it prints the datacenter list
  Models.Equipment.find({}).sort({'modifiedOn': 'desc'}).exec((err, eqs) => {
    if (err) {
      logger.warn(err);
      req.session.flash = strTgs.errMsg('There was an error processing your request.');
      res.redirect(backURL);
    } else {
      context = {
        eqs: eqs.map((eq) => {
        // rack.populate('rackParentDC', 'abbreviation cageNickname')
        // logger.info(eq);
          return {
            equipLocation: eq.equipLocation,
            equipLocationRack: eq.equipLocRack,
            equipSN: eq.equipSN,
            equipTicketNumber: eq.equipticketNumber,
            equipInventoryStatus: strTgs.trueFalseIcon(eq.equipInventoryStatus,eq.equipticketNumber),
            equipStatus: eq.equipStatus,
            equipStatusLight: strTgs.trueFalseIcon(eq.equipStatus,eq.equipStatus),
            equipType: eq.equipType,
            equipMake: eq.equipMake,
            equipModel: eq.equipModel,
            equipSubModel: eq.equipSubModel,
            equipAcquisition: strTgs.addAndCompDates(eq.equipAcquisition, eq.equipWarrantyMo),
            equipPONum: eq.equipPONum,
            equipProjectNum: eq.equipProjectNum,
            createdOn: strTgs.dateMod(eq.createdOn),
            modifiedOn: strTgs.dateMod(eq.modifiedOn),
          };
        }),
      };
      // the 'location/datacenter-list' is the view that will be called
      // context is the data from above
      res.render('asset/equipment-list', context);
    }
  });
};

/*------------------------------------------------------------------
---------------------  Create New Equipment   ---------------------------
------------------------------------------------------------------------
*/
exports.dcEquipNew = (req, res, next) => {
  var funcName = 'dcEquipNew';
  var backURL = req.header('Referer') || '/';
  var context;
  Models.Optionsdb.find({}, 'optListKey optListArray', (err, opt) => {
    if (err) {
      logger.warn(`${funcName} Optionsdb \n${err}`);
      req.session.flash = strTgs.errMsg('There was an error processing your request.');
      res.redirect(backURL);
      return next;
    }
      // var RuTemp = 52;
      var getRackrUs = (RuTemp) => {
        // logger.info('getRackrUs'+RuTemp);
        var tempRu = [];
        for (var i = 0; i < RuTemp; i++) {
          tempRu[i] = strTgs.pad([i]);
        }
      // logger.info('getRackrUs>> '+tempRu);
        return tempRu;
      };
    context = {
      optSystPortType: strTgs.findThisInThatMulti('optSystPortType', opt, 'optListKey'),
      optEquipStatus: strTgs.findThisInThatMulti('optEquipStatus', opt, 'optListKey'),
      optEquipType: strTgs.findThisInThatMulti('optEquipType', opt, 'optListKey'),
      rackrUs: getRackrUs(52),
    };
    // logger.info(context);
    res.render('asset/equipmentedit', context);
  });
};

// ---------------------------------------------------------------------
// -------------------------Equipment View------------------------------
// ---------------------------------------------------------------------

exports.dcEquipView = (req, res, next) => {
  var funcName = 'dcEquipView';
  var backURL = req.header('Referer') || '/';
  var context;
  var tempSys;
  dcabbr = req.params.data;
  // logger.info('view equip '+dcabbr);
  Models.Equipment.findOne({equipSN: dcabbr}, (err, eq) => {
    if (err || !eq) {
      logger.warn(`${funcName} equipSN \n${err}`);
      req.session.flash = strTgs.errMsg('Could not find Equipment SN');
      res.redirect(backURL);
      return next;
    }
    Models.Optionsdb.find({}, 'optListKey optListArray', (err, opt) => {
      if (err) {
        logger.warn(`${funcName} Optionsdb \n${err}`);
        req.session.flash = strTgs.errMsg('There was an error processing your request.');
        res.redirect(backURL);
        return next;
      }
      Models.Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus modifiedOn', (err, sys) => {
        if (err) {
          logger.warn(`${funcName} Systemdb \n${err}`);
          req.session.flash = strTgs.errMsg('There was an error processing your request.');
          res.redirect(backURL);
          return next;
        }
        Models.Rack.find({}, {'rUs': 1, 'rackUnique': 1, '_id': 0}, {sort: {rackUnique: 1} }, (err, rk) => {
          if (err) {
            logger.warn(`${funcName} Rack \n${err}`);
            req.session.flash = strTgs.errMsg('There was an error processing your request.');
            res.redirect(backURL);
            return next;
          }
          var rackUni = [];
          for (var i = 0; i < rk.length; i++) {
            rackUni[i] = rk[i].rackUnique;
            // logger.info('rackUni >'+rackUni[i]);
          }
          // var RuTemp = 52;
          var getRackrUs = (RuTemp) => {
          // logger.info('getRackrUs'+RuTemp);
            var tempRu = [];
            for (var i = 0; i < RuTemp; i++) {
              tempRu[i] = strTgs.pad([i]);
            }
            // logger.info('getRackrUs>> '+tempRu);
            return tempRu;
          };
          if (!eq) {
            logger.warn(err);
            req.session.flash = strTgs.errMsg('There was an error processing your request.');
            res.redirect(backURL);
          }
          tempSys = strTgs.findThisInThatMulti(eq.equipSN, sys, 'systemEquipSN');
          context = {
            menu1: eq.equipSN,
            menuLink1: '#',
            titleNow: eq.equipSN,
            optSystPortType: strTgs.findThisInThatMulti('optSystPortType', opt, 'optListKey'),
            optEquipStatus: strTgs.findThisInThatMulti('optEquipStatus', opt, 'optListKey'),
            optEquipType: strTgs.findThisInThatMulti('optEquipType', opt, 'optListKey'),
            rackUnique: rackUni,
            rackrUs: getRackrUs(52),
            equipId: eq._id,
            equipLocationRack: eq.equipLocRack,
            equipLocationRu: eq.equipLocRU,
            equipLocation: eq.equipLocation,
            equipSN: eq.equipSN,
            equipAssetTag: eq.equipAssetTag,
            equipTicketNumber: eq.equipTicketNumber,
            equipTicketNumberlit: strTgs.trueFalseIcon(eq.equipInventoryStatus, eq.equipTicketNumber),
            equipInventoryStatus: eq.equipInventoryStatus,
            equipStatuslit: strTgs.trueFalseIcon(eq.equipStatus, eq.equipStatus),
            equipInventoryStatusChecked: strTgs.setCheckBox(eq.equipInventoryStatus),
            equipStatus: eq.equipStatus,
            equipIsVirtual: eq.equipIsVirtual,
            equipIsVirtualChecked: strTgs.setCheckBox(eq.equipIsVirtual),
            equipEOL: eq.equipEOL,
            equipType: eq.equipType,
            equipMake: eq.equipMake,
            equipModel: eq.equipModel,
            equipSubModel: eq.equipSubModel,
            equipRUHieght: eq.equipRUHieght,
            equipParent: eq.equipParent,
            equipImgFront: eq.equipImgFront,
            equipImgRear: eq.equipImgRear,
            equipImgInternal: eq.equipImgInternal,
            equipFirmware: eq.equipFirmware,
            equipMobo: eq.equipMobo,
            equipCPUCount: eq.equipCPUCount,
            equipCPUCores: eq.equipCPUCores,
            equipCPUType: eq.equipCPUType,
            equipMemType: eq.equipMemType,
            equipMemTotal: eq.equipMemTotal,
            equipRaidType: eq.equipRaidType,
            equipRaidLayout: eq.equipRaidLayout,
            equipHDDCount: eq.equipHDDCount,
            equipHDDType: eq.equipHDDType,
            equipNICCount: eq.equipNICCount,
            equipNICType: eq.equipNICType,
            equipPSUCount: eq.equipPSUCount,
            equipPSUDraw: eq.equipPSUDraw,
            equipAddOns: eq.equipAddOns,
            equipReceived: strTgs.dateMod(eq.equipReceived),
            equipAcquisition: strTgs.dateMod(eq.equipAcquisition),
            equipInService: strTgs.dateMod(eq.equipInService),
            equipEndOfLife: strTgs.dateMod(eq.equipEndOfLife),
            equipWarrantyMo: eq.equipWarrantyMo,
            equipPONum: eq.equipPONum,
            equipInvoice: eq.equipInvoice,
            equipProjectNum: eq.equipProjectNum,
            equipLicense: eq.equipLicense,
            equipMaintAgree: eq.equipMaintAgree,
            equipPurchaseType: eq.equipPurchaseType,
            equipPurchaser: eq.equipPurchaser,
            equipPurchaseTerms: eq.equipPurchaseTerms,
            equipPurchaseEnd: strTgs.dateMod(eq.equipPurchaseEnd),
            equipNotes: eq.equipNotes,
            createdBy: eq.createdBy,
            createdOn: strTgs.dateMod(eq.createdOn),
            modifiedBy: eq.modifiedBy,
            modifiedOn: strTgs.dateMod(eq.modifiedOn),
            equipPorts: eq.equipPorts.map((ep) => {
              return {
                equipPortId: ep._id,
                equipPortType: ep.equipPortType,
                equipPortsAddr: ep.equipPortsAddr,
                equipPortName: ep.equipPortName,
                equipPortsOpt: ep.equipPortsOpt,
                createdBy: ep.createdBy,
                createdOn: strTgs.dateMod(ep.createdOn),
                modifiedby: ep.modifiedbBy,
                modifiedOn: strTgs.dateMod(ep.modifiedOn),
              };
            }),
            equipRMAs: eq.equipRMAs.map((er) => {
              return {
                equipRMA: er._id,
                equipRMAOpened: strTgs.dateMod(er.equipRMAOpened),
                equipRMAClosed: strTgs.dateMod(er.equipRMAClosed),
                equipRMATicket: er.equipRMATicket,
                equipRMANumber: er.equipRMANumber,
                equipRMANotes: er.equipRMANotes,
                createdBy: er.createdBy,
                createdOn: strTgs.dateMod(er.createdOn),
                modifiedby: er.modifiedbBy,
                modifiedOn: strTgs.dateMod(er.modifiedOn),
              };
            }),
            systemName: tempSys.systemName,
            systemEnviron: tempSys.systemEnviron,
            systemRole: tempSys.systemRole,
            systemStatus: strTgs.trueFalseIcon(tempSys.systemStatus, tempSys.systemStatus),
            sysmodifiedOn: strTgs.dateMod(tempSys.modifiedOn),
          };
          res.render('asset/equipment', context);
        });
      });
    });
  });
};

// ---------------------------------------------------------------------
// -------------------------Equipment Edit------------------------------
// ---------------------------------------------------------------------

exports.dcEquipEdit = (req, res, next) => {
  var funcName = 'dcEquipEdit';
  var backURL = req.header('Referer') || '/';
  var context;
  var tempSys;
  dcabbr = req.params.data;
  // logger.info('view equip '+dcabbr);
  Models.Equipment.findOne({equipSN: dcabbr}, (err, eq) => {
    if (err || !eq) {
      logger.warn(`${funcName} equipSN \n${err}`);
      req.session.flash = strTgs.errMsg('Could not find Equipment SN');
      res.redirect(backURL);
      return next;
    }
    Models.Optionsdb.find({}, 'optListKey optListArray', (err, opt) => {
      if (err) {
        logger.warn(`${funcName} Optionsdb \n${err}`);
        req.session.flash = strTgs.errMsg('There was an error processing your request.');
        res.redirect(backURL);
        return next;
      }
      Models.Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus modifiedOn', (err, sys) => {
        if (err) {
          logger.warn(`${funcName} Systemdb \n${err}`);
          req.session.flash = strTgs.errMsg('There was an error processing your request.');
          res.redirect(backURL);
          return next;
        }
        Models.Rack.find({}, {'rUs': 1, 'rackUnique': 1, '_id': 0}, {sort: {rackUnique: 1} }, (err, rk) => {
          if (err) {
            logger.warn(`${funcName} Rack \n${err}`);
            req.session.flash = strTgs.errMsg('There was an error processing your request.');
            res.redirect(backURL);
            return next;
          }
          var rackUni = [];
          for (var i = 0; i < rk.length; i++) {
            rackUni[i] = rk[i].rackUnique;
            // logger.info('rackUni >'+rackUni[i]);
          }
          // var RuTemp = 52;
          var getRackrUs = (RuTemp) => {
          // logger.info('getRackrUs'+RuTemp);
            var tempRu = [];
            for (var i = 0; i < RuTemp; i++) {
              tempRu[i] = strTgs.pad([i]);
            }
            // logger.info('getRackrUs>> '+tempRu);
            return tempRu;
          };
          tempSys = strTgs.findThisInThatMulti(eq.equipSN, sys, 'systemEquipSN');
          context = {
            menu1: eq.equipSN,
            menuLink1: '#',
            titleNow: eq.equipSN,
            optSystPortType: strTgs.findThisInThatMulti('optSystPortType', opt, 'optListKey'),
            optEquipStatus: strTgs.findThisInThatMulti('optEquipStatus', opt, 'optListKey'),
            optEquipType: strTgs.findThisInThatMulti('optEquipType', opt, 'optListKey'),
            rackUnique: rackUni,
            rackrUs: getRackrUs(52),
            equipId: eq._id,
            equipLocationRack: eq.equipLocRack,
            equipLocationRu: eq.equipLocRU,
            equipLocation: eq.equipLocation,
            equipSN: eq.equipSN,
            equipAssetTag: eq.equipAssetTag,
            equipTicketNumber: eq.equipTicketNumber,
            equipTicketNumberlit: strTgs.trueFalseIcon(eq.equipInventoryStatus, eq.equipTicketNumber),
            equipInventoryStatus: eq.equipInventoryStatus,
            equipStatuslit: strTgs.trueFalseIcon(eq.equipStatus, eq.equipStatus),
            equipInventoryStatusChecked: strTgs.setCheckBox(eq.equipInventoryStatus),
            equipStatus: eq.equipStatus,
            equipIsVirtual: eq.equipIsVirtual,
            equipIsVirtualChecked: strTgs.setCheckBox(eq.equipIsVirtual),
            equipEOL: eq.equipEOL,
            equipType: eq.equipType,
            equipMake: eq.equipMake,
            equipModel: eq.equipModel,
            equipSubModel: eq.equipSubModel,
            equipRUHieght: eq.equipRUHieght,
            equipParent: eq.equipParent,
            equipImgFront: eq.equipImgFront,
            equipImgRear: eq.equipImgRear,
            equipImgInternal: eq.equipImgInternal,
            equipFirmware: eq.equipFirmware,
            equipMobo: eq.equipMobo,
            equipCPUCount: eq.equipCPUCount,
            equipCPUCores: eq.equipCPUCores,
            equipCPUType: eq.equipCPUType,
            equipMemType: eq.equipMemType,
            equipMemTotal: eq.equipMemTotal,
            equipRaidType: eq.equipRaidType,
            equipRaidLayout: eq.equipRaidLayout,
            equipHDDCount: eq.equipHDDCount,
            equipHDDType: eq.equipHDDType,
            equipNICCount: eq.equipNICCount,
            equipNICType: eq.equipNICType,
            equipPSUCount: eq.equipPSUCount,
            equipPSUDraw: eq.equipPSUDraw,
            equipAddOns: eq.equipAddOns,
            equipReceived: strTgs.dateMod(eq.equipReceived),
            equipAcquisition: strTgs.dateMod(eq.equipAcquisition),
            equipInService: strTgs.dateMod(eq.equipInService),
            equipEndOfLife: strTgs.dateMod(eq.equipEndOfLife),
            equipWarrantyMo: eq.equipWarrantyMo,
            equipPONum: eq.equipPONum,
            equipInvoice: eq.equipInvoice,
            equipProjectNum: eq.equipProjectNum,
            equipLicense: eq.equipLicense,
            equipMaintAgree: eq.equipMaintAgree,
            equipPurchaseType: eq.equipPurchaseType,
            equipPurchaser: eq.equipPurchaser,
            equipPurchaseTerms: eq.equipPurchaseTerms,
            equipPurchaseEnd: strTgs.dateMod(eq.equipPurchaseEnd),
            equipNotes: eq.equipNotes,
            createdBy: eq.createdBy,
            createdOn: strTgs.dateMod(eq.createdOn),
            modifiedBy: eq.modifiedBy,
            modifiedOn: strTgs.dateMod(eq.modifiedOn),
            equipPorts: eq.equipPorts.map((ep) => {
              return {
                equipPortId: ep._id,
                equipPortType: ep.equipPortType,
                equipPortsAddr: ep.equipPortsAddr,
                equipPortName: ep.equipPortName,
                equipPortsOpt: ep.equipPortsOpt,
                createdBy: ep.createdBy,
                createdOn: strTgs.dateMod(ep.createdOn),
                modifiedby: ep.modifiedbBy,
                modifiedOn: strTgs.dateMod(ep.modifiedOn),
              };
            }),
            equipRMAs: eq.equipRMAs.map((er) => {
              return {
                equipRMA: er._id,
                equipRMAOpened: strTgs.dateMod(er.equipRMAOpened),
                equipRMAClosed: strTgs.dateMod(er.equipRMAClosed),
                equipRMATicket: er.equipRMATicket,
                equipRMANumber: er.equipRMANumber,
                equipRMANotes: er.equipRMANotes,
                createdBy: er.createdBy,
                createdOn: strTgs.dateMod(er.createdOn),
                modifiedby: er.modifiedbBy,
                modifiedOn: strTgs.dateMod(er.modifiedOn),
              };
            }),
            systemName: tempSys.systemName,
            systemEnviron: tempSys.systemEnviron,
            systemRole: tempSys.systemRole,
            systemStatus: strTgs.trueFalseIcon(tempSys.systemStatus, tempSys.systemStatus),
            sysmodifiedOn: strTgs.dateMod(tempSys.modifiedOn),
          };
          // logger.info(context);
          res.render('asset/equipmentedit', context);
        });
      });
    });
  });
};

// ---------------------------------------------------------------------
// -------------------------Equipment Copy------------------------------
// ---------------------------------------------------------------------

exports.dcEquipCopy = (req, res, next) => {
  var funcName = 'dcEquipCopy';
  var backURL = req.header('Referer') || '/';
  var context;
  dcabbr = req.params.data;
  // logger.info('view equip '+dcabbr);
  Models.Equipment.findOne({equipSN: dcabbr}, (err, eq) => {
    if (err || !eq) {
      logger.warn(`${funcName} equipSN \n${err}`);
      req.session.flash = strTgs.errMsg('Could not find Equipment SN');
      res.redirect(backURL);
      return next;
    }
    Models.Optionsdb.find({}, 'optListKey optListArray', (err, opt) => {
      if (err) {
        logger.warn(`${funcName} Optionsdb \n${err}`);
        req.session.flash = strTgs.errMsg('There was an error processing your request.');
        res.redirect(backURL);
        return next;
      }
      Models.Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus modifiedOn', (err, sys) => {
        if (err) {
          logger.warn(`${funcName} Systemdb \n${err}`);
          req.session.flash = strTgs.errMsg('There was an error processing your request.');
          res.redirect(backURL);
          return next;
        }
        Models.Rack.find({}, {'rUs': 1, 'rackUnique': 1, '_id': 0}, {sort: {rackUnique: 1} }, (err, rk) => {
          if (err) {
            logger.warn(`${funcName} Rack \n${err}`);
            req.session.flash = strTgs.errMsg('There was an error processing your request.');
            res.redirect(backURL);
            return next;
          }
          var rackUni = [];
          for (var i = 0; i < rk.length; i++) {
            rackUni[i] = rk[i].rackUnique;
            // logger.info('rackUni >'+rackUni[i]);
          }
          // var RuTemp = 52;
          var getRackrUs = (RuTemp) => {
          // logger.info('getRackrUs'+RuTemp);
            var tempRu = [];
            for (var i = 0; i < RuTemp; i++) {
              tempRu[i] = strTgs.pad([i]);
            }
            // logger.info('getRackrUs>> '+tempRu);
            return tempRu;
          };
          context = {
            optSystPortType: strTgs.findThisInThatMulti('optSystPortType', opt, 'optListKey'),
            optEquipStatus: strTgs.findThisInThatMulti('optEquipStatus', opt, 'optListKey'),
            optEquipType: strTgs.findThisInThatMulti('optEquipType', opt, 'optListKey'),
            rackrUs: getRackrUs(52),
            rackUnique: rackUni,
            rUs: rk.rUs,
            wasCopy: eq.equipSN,
            equipTicketNumber: eq.equipTicketNumber,
            equipTicketNumberlit: strTgs.trueFalseIcon(eq.equipInventoryStatus, eq.equipTicketNumber),
            equipInventoryStatus: eq.equipInventoryStatus,
            equipStatuslit: strTgs.trueFalseIcon(eq.equipStatus, eq.equipStatus),
            equipStatus: eq.equipStatus,
            equipIsVirtualChecked: strTgs.setCheckBox(eq.equipIsVirtual),
            equipEOL: eq.equipEOL,
            equipType: eq.equipType,
            equipMake: eq.equipMake,
            equipModel: eq.equipModel,
            equipSubModel: eq.equipSubModel,
            equipRUHieght: eq.equipRUHieght,
            equipParent: eq.equipParent,
            equipImgFront: eq.equipImgFront,
            equipImgRear: eq.equipImgRear,
            equipImgInternal: eq.equipImgInternal,
            equipFirmware: eq.equipFirmware,
            equipMobo: eq.equipMobo,
            equipCPUCount: eq.equipCPUCount,
            equipCPUCores: eq.equipCPUCores,
            equipCPUType: eq.equipCPUType,
            equipMemType: eq.equipMemType,
            equipMemTotal: eq.equipMemTotal,
            equipRaidType: eq.equipRaidType,
            equipRaidLayout: eq.equipRaidLayout,
            equipHDDCount: eq.equipHDDCount,
            equipHDDType: eq.equipHDDType,
            equipNICCount: eq.equipNICCount,
            equipNICType: eq.equipNICType,
            equipPSUCount: eq.equipPSUCount,
            equipPSUDraw: eq.equipPSUDraw,
            equipAddOns: eq.equipAddOns,
            equipReceived: strTgs.dateMod(eq.equipReceived),
            equipAcquisition: strTgs.dateMod(eq.equipAcquisition),
            equipInService: strTgs.dateMod(eq.equipInService),
        //    equipEndOfLife: strTgs.dateMod(eq.equipEndOfLife),
            equipWarrantyMo: eq.equipWarrantyMo,
            equipPONum: eq.equipPONum,
            equipInvoice: eq.equipInvoice,
            equipProjectNum: eq.equipProjectNum,
            equipLicense: eq.equipLicense,
            equipMaintAgree: eq.equipMaintAgree,
            equipPurchaseType: eq.equipPurchaseType,
            equipPurchaser: eq.equipPurchaser,
            equipPurchaseTerms: eq.equipPurchaseTerms,
            equipPurchaseEnd: strTgs.dateMod(eq.equipPurchaseEnd),
          };
          // logger.info(context);
          res.render('asset/equipmentedit', context);
        });
      });
    });
  });
};


/* ---------------------------------------------------------------------
-----------------------   New and copy equipment POST working   --------
------------------------------------------------------------------------
*/

exports.dcEquipmentPost = (req, res) => {
// this makes the abbreviation available for the URL
  var varPortsNew;
  var thisDoc;
  if (accConfig.accessCheck(req.user).edit !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
    var data = req.body;
    res.abbreviation = strTgs.cTrim(data.equipSN);
    if (data.isEdit) {
      res.abbreviation = strTgs.cTrim(data.isEdit);
    }
    // Setup Parent location
    Models.Equipment.findOne({equipSN: data.equipParent.toUpperCase()}, {'equipLocation': 1, '_id': 0}, (err, sParLoc) => {
      if (err) {
        logger.warn(`${funcName} Optionsdb \n${err}`);
        req.session.flash = strTgs.errMsg('There was an error processing your request.');
        res.redirect(backURL);
        return next;
      }
      if (data.equipParent) {
        data.equipLocationRack = strTgs.ruToLocation(sParLoc.equipLocation);
      }
      // logger.info('dcRackPost abbreviation>'+res.abbreviation);
      // isEdit and wasCopy = equipment name using #if from handlebars
      if (!data.isEdit) {
        if (data.wasCopy) {
        res.abbreviation = strTgs.cTrim(data.equipSN);
        }
        //  logger.info('new Equipment in DC');
        varPortsNew = (body) => {
          var Ports = [];
          if (data.equipPortsAddr[0] !== '') {
            for (var i = 0; i < body.equipPortType.length; i++) {
            // logger.info('equipPortType.length '+body.equipPortType.length);
              Ports[i] = ({
                equipPortType: strTgs.sTrim(body.equipPortType[i]),
                equipPortsAddr: strTgs.mTrim(body.equipPortsAddr[i]),
                equipPortName: strTgs.sTrim(body.equipPortName[i]),
                equipPortsOpt: strTgs.sTrim(body.equipPortsOpt[i]),
              });
            }
          }
          return Ports;
        };

        Models.Equipment.create({
          equipPorts: varPortsNew(data),
          equipLocation: strTgs.locComb(data.equipLocationRack, data.equipLocationRu),
          equipSN: strTgs.cTrim(data.equipSN),
          equipAssetTag: strTgs.sTrim(data.equipAssetTag),
          equipTicketNumber: strTgs.clTrim(data.equipTicketNumber),
          equipInventoryStatus: data.equipInventoryStatus,
          equipStatus: strTgs.uTrim(data.equipStatus),
          equipIsVirtual: data.equipIsVirtual,
          equipType: strTgs.uTrim(data.equipType),
          equipMake: strTgs.uTrim(data.equipMake),
          equipModel: strTgs.uTrim(data.equipModel),
          equipSubModel: strTgs.uTrim(data.equipSubModel),
          equipRUHieght: strTgs.uTrim(data.equipRUHieght),
          equipParent: strTgs.cTrim(data.equipParent),
          equipImgFront: strTgs.uTrim(data.equipImgFront),
          equipImgRear: strTgs.uTrim(data.equipImgRear),
          equipImgInternal: strTgs.uTrim(data.equipImgInternal),
          equipFirmware: strTgs.uTrim(data.equipFirmware),
          equipIPMIv: strTgs.uTrim(data.equipIPMIv),
          equipMobo: strTgs.uTrim(data.equipMobo),
          equipCPUCount: strTgs.uTrim(data.equipCPUCount),
          equipCPUCores: strTgs.uTrim(data.equipCPUCores),
          equipCPUType: strTgs.uTrim(data.equipCPUType),
          equipMemType: strTgs.uTrim(data.equipMemType),
          equipMemTotal: strTgs.uTrim(data.equipMemTotal),
          equipRaidType: strTgs.uTrim(data.equipRaidType),
          equipRaidLayout: strTgs.uTrim(data.equipRaidLayout),
          equipHDDCount: strTgs.uTrim(data.equipHDDCount),
          equipHDDType: strTgs.uTrim(data.equipHDDType),
          equipNICCount: strTgs.uTrim(data.equipNICCount),
          equipNICType: strTgs.uTrim(data.equipNICType),
          equipPSUCount: strTgs.uTrim(data.equipPSUCount),
          equipPSUDraw: strTgs.uTrim(data.equipPSUDraw),
          equipAddOns: strTgs.uTrim(data.equipAddOns),
          equipReceived: strTgs.dateAddTZ(data.equipReceived, req.session.ses.timezone),
          equipAcquisition: strTgs.dateAddTZ(data.equipAcquisition, req.session.ses.timezone),
          equipInService: strTgs.dateAddTZ(data.equipInService, req.session.ses.timezone),
          equipEndOfLife: strTgs.dateAddTZ(data.equipEndOfLife, req.session.ses.timezone),
          equipWarrantyMo: data.equipWarrantyMo,
          equipPONum: strTgs.uTrim(data.equipPONum),
          equipInvoice: strTgs.uTrim(data.equipInvoice),
          equipProjectNum: strTgs.uTrim(data.equipProjectNum),
          equipLicense: strTgs.uTrim(data.equipLicense),
          equipMaintAgree: strTgs.uTrim(data.equipMaintAgree),
          equipPurchaseType: strTgs.uTrim(data.equipPurchaseType),
          equipPurchaser: strTgs.uTrim(data.equipPurchaser),
          equipPurchaseTerms: strTgs.uTrim(data.equipPurchaseTerms),
          equipPurchaseEnd: strTgs.dateAddTZ(data.equipPurchaseEnd, req.session.ses.timezone),
          equipNotes: strTgs.uTrim(data.equipNotes),
          createdBy: req.user.local.email,
          createdOn: Date.now(),
          modifiedBy: req.user.local.email,
          modifiedOn: Date.now(),
        }, (err) => {
          if (err) {
            logger.warn(err.stack);
            if (err.stack.indexOf('ValidationError') !== -1) {
              req.session.flash = {
                type: 'danger',
                intro: 'Duplicate!',
                message: 'That Equipment SN already exists.',
              };
              return res.redirect(303, `/equipment/${res.abbreviation}`);
            }
            req.session.flash = {
              type: 'danger',
              intro: 'Ooops!',
              message: 'There was an error processing your request.',
            };
            return res.redirect(303, '/');
          }
          req.session.flash = {
            type: 'success',
            intro: 'Thank you!',
            message: `<a href="/equipment/${res.abbreviation}">${res.abbreviation}</a> was created.`,
          };
          if (!data.wasCopy) {
            return res.redirect(303, `/equipment/${res.abbreviation}`);
          }
          return res.redirect(303, `/equipment/${res.abbreviation}/copy`);
        }
      );
      } else {
        Models.Equipment.findOne({equipSN: req.body.equipSN.toUpperCase()}, (err, eq) => {
        // logger.info('existing id>'+thisDoc);
          if (err) {
            logger.warn(err);
            req.session.flash = {
              type: 'danger',
              intro: 'Ooops!',
              message: 'There was an error processing your request.',
            };
            res.redirect(`location/datacenter/${res.abbreviation}`);
          } else {
            thisDoc = eq;
            // find all children
            if (thisDoc.equipLocRack !== data.equipLocationRack) {
              Models.Equipment.find({equipParent: strTgs.cTrim(data.equipSN)}, {equipParent: 1, equipLocation: 1}, (err, childEquips) => {
                childEquips.forEach((childE) => {
                  Models.Equipment.findOne({_id: childE._id}, (err, chldTmp) => {
                    chldTmp.equipLocation = strTgs.locComb(data.equipLocationRack, chldTmp.equipLocRU);
                    chldTmp.save();
                  });
                });
              });
            }
            for (var i = 0; i < data.equipPortType.length; i++) {
              if (data.equipPortType[i] === '') {
              // logger.info('equipPortType nonw');
              } else if (data.equipPortId[i] === 'new') {
              // logger.info('new port >'+data.equipPortId[i]);
                eq.equipPorts.push({
                  equipPortType: strTgs.sTrim(data.equipPortType[i]),
                  equipPortsAddr: strTgs.mTrim(data.equipPortsAddr[i]),
                  equipPortName: strTgs.sTrim(data.equipPortName[i]),
                  equipPortsOpt: strTgs.sTrim(data.equipPortsOpt[i]),
                });
              } else {
              // logger.info('existing port');
                var thisSubDoc = eq.equipPorts.id(data.equipPortId[i]);
                thisSubDoc.equipPortType = strTgs.uCleanUp(thisSubDoc.equipPortType, data.equipPortType[i]);
                thisSubDoc.equipPortsAddr = strTgs.mCleanUp(thisSubDoc.equipPortsAddr, data.equipPortsAddr[i]);
                thisSubDoc.equipPortName = strTgs.uCleanUp(thisSubDoc.equipPortName, data.equipPortName[i]);
                thisSubDoc.equipPortsOpt = strTgs.uCleanUp(thisSubDoc.equipPortsOpt, data.equipPortsOpt[i]);
              }
            }
            thisDoc.equipLocation = strTgs.locComb(data.equipLocationRack, data.equipLocationRu);
            thisDoc.equipAssetTag = strTgs.uCleanUp(thisDoc.equipAssetTag, data.equipAssetTag);
            thisDoc.equipTicketNumber = strTgs.clTrim(data.equipTicketNumber);
            thisDoc.equipInventoryStatus = strTgs.uCleanUp(thisDoc.equipInventoryStatus, data.equipInventoryStatus);
            thisDoc.equipStatus = strTgs.uCleanUp(thisDoc.equipStatus, data.equipStatus);
            thisDoc.equipIsVirtual = strTgs.uCleanUp(thisDoc.equipIsVirtual, data.equipIsVirtual);
            thisDoc.equipEOL = strTgs.uCleanUp(thisDoc.equipEOL, data.equipEOL);
            thisDoc.equipType = strTgs.uCleanUp(thisDoc.equipType, data.equipType);
            thisDoc.equipMake = strTgs.uCleanUp(thisDoc.equipMake, data.equipMake);
            thisDoc.equipModel = strTgs.uCleanUp(thisDoc.equipModel, data.equipModel);
            thisDoc.equipSubModel = strTgs.uCleanUp(thisDoc.equipSubModel, data.equipSubModel);
            thisDoc.equipRUHieght = strTgs.uCleanUp(thisDoc.equipRUHieght, data.equipRUHieght);
            thisDoc.equipParent = strTgs.cCleanUp(thisDoc.equipParent, data.equipParent);
            thisDoc.equipImgFront = strTgs.uCleanUp(thisDoc.equipImgFront, data.equipImgFront);
            thisDoc.equipImgRear = strTgs.uCleanUp(thisDoc.equipImgRear, data.equipImgRear);
            thisDoc.equipImgInternal = strTgs.uCleanUp(thisDoc.equipImgInternal, data.equipImgInternal);
            thisDoc.equipFirmware = strTgs.uCleanUp(thisDoc.equipFirmware, data.equipFirmware);
            thisDoc.equipIPMIv = strTgs.multiClean(thisDoc.equipIPMIv, data.equipIPMIv, 6);
            thisDoc.equipMobo = strTgs.uCleanUp(thisDoc.equipMobo, data.equipMobo);
            thisDoc.equipCPUCount = strTgs.uCleanUp(thisDoc.equipCPUCount, data.equipCPUCount);
            thisDoc.equipCPUCores = strTgs.uCleanUp(thisDoc.equipCPUCores, data.equipCPUCores);
            thisDoc.equipCPUType = strTgs.uCleanUp(thisDoc.equipCPUType, data.equipCPUType);
            thisDoc.equipMemType = strTgs.uCleanUp(thisDoc.equipMemType, data.equipMemType);
            thisDoc.equipMemTotal = strTgs.uCleanUp(thisDoc.equipMemTotal, data.equipMemTotal);
            thisDoc.equipRaidType = strTgs.uCleanUp(thisDoc.equipRaidType, data.equipRaidType);
            thisDoc.equipRaidLayout = strTgs.uCleanUp(thisDoc.equipRaidLayout, data.equipRaidLayout);
            thisDoc.equipHDDCount = strTgs.uCleanUp(thisDoc.equipHDDCount, data.equipHDDCount);
            thisDoc.equipHDDType = strTgs.uCleanUp(thisDoc.equipHDDType, data.equipHDDType);
            thisDoc.equipNICCount = strTgs.uCleanUp(thisDoc.equipNICCount, data.equipNICCount);
            thisDoc.equipNICType = strTgs.uCleanUp(thisDoc.equipNICType, data.equipNICType);
            thisDoc.equipPSUCount = strTgs.uCleanUp(thisDoc.equipPSUCount, data.equipPSUCount);
            thisDoc.equipPSUDraw = strTgs.uCleanUp(thisDoc.equipPSUDraw, data.equipPSUDraw);
            thisDoc.equipAddOns = strTgs.uCleanUp(thisDoc.equipAddOns, data.equipAddOns);
            thisDoc.equipReceived = strTgs.dCleanup(thisDoc.equipReceived, data.equipReceived, req.session.ses.timezone);
            thisDoc.equipAcquisition = strTgs.dCleanup(thisDoc.equipAcquisition, data.equipAcquisition, req.session.ses.timezone);
            thisDoc.equipInService = strTgs.dCleanup(thisDoc.equipInService, data.equipInService, req.session.ses.timezone);
            thisDoc.equipEndOfLife = strTgs.dCleanup(thisDoc.equipEndOfLife, data.equipEndOfLife, req.session.ses.timezone);
            thisDoc.equipWarrantyMo = strTgs.uCleanUp(thisDoc.equipWarrantyMo, data.equipWarrantyMo);
            thisDoc.equipPONum = strTgs.uCleanUp(thisDoc.equipPONum, data.equipPONum);
            thisDoc.equipInvoice = strTgs.uCleanUp(thisDoc.equipInvoice, data.equipInvoice);
            thisDoc.equipProjectNum = strTgs.uCleanUp(thisDoc.equipProjectNum, data.equipProjectNum);
            thisDoc.equipLicense = strTgs.uCleanUp(thisDoc.equipLicense, data.equipLicense);
            thisDoc.equipMaintAgree = strTgs.uCleanUp(thisDoc.equipMaintAgree, data.equipMaintAgree);
            thisDoc.equipPurchaseType = strTgs.uCleanUp(thisDoc.equipPurchaseType, data.equipPurchaseType);
            thisDoc.equipPurchaser = strTgs.uCleanUp(thisDoc.equipPurchaser, data.equipPurchaser);
            thisDoc.equipPurchaseTerms = strTgs.uCleanUp(thisDoc.equipPurchaseTerms, data.equipPurchaseTerms);
            thisDoc.equipPurchaseEnd = strTgs.dCleanup(thisDoc.equipPurchaseEnd, data.equipPurchaseEnd, req.session.ses.timezone);
            thisDoc.equipNotes = strTgs.uCleanUp(thisDoc.equipNotes, data.equipNotes);
            thisDoc.modifiedOn = Date.now();
            thisDoc.modifiedBy = req.user.local.email;
          }
          eq.save((err) => {
            if (err) {
              logger.error(err.stack);
              req.session.flash = {
                type: 'danger',
                intro: 'Ooops!',
                message: 'There was an error processing your request.',
              };
            } else {

              req.session.flash = {
                type: 'success',
                intro: 'Thank you!',
                message: 'Your update has been made.',
              };
            }
            return res.redirect(303, `/equipment/${res.abbreviation}`);
          });
        });
      }
    });
  }
};




exports.dcEquipPortPostAJAX = (req,res) => {

};

// --------------------------------------------------------------------
//                   working to display list of Equipment w/ systems
//          will not show systems without equipment
// ---------------------------------------------------------------------

exports.dcEquipSysPages = (req,res,next) => {
    if (accConfig.accessCheck(req.user).read !== 1){
    req.session.flash = strTgs.notAuth;
        return res.redirect(303, '/');
    }else{
    //logger.info('***********exports.dcEquipSysPages First >' +req.params.datacenter);
    if (!req.params.datacenter){
    //logger.info('in EquipSysPages - List');
    // this looks for 'list' as the / url. if it exists, it prints the datacenter list
        Models.Equipment.find({}).exec((err, eqs) => {
        if (err) return next(err);
        if (!eqs) return next();
        //logger.info(eqs);
        Models.Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus systemTicket systemNotes modifiedOn',(err, sys) => {

        if (err) return next(err);
        if (!sys) return next();
        //logger.info('SYS >>>>>>>>>>>'+sys);

            var context = {
               eqs: eqs.map((eq) => {
                 tempSys = strTgs.findThisInThatMulti(eq.equipSN,sys,'systemEquipSN');
                  return {
                            //titleNow:dc.abbreviation,
                            equipLocation: eq.equipLocation,
                            equipLocationRack: strTgs.ruToLocation(eq.equipLocation),
                            equipSN: eq.equipSN,
                            equipTicketNumber: eq.equipticketNumber,
                            equipInventoryStatus: strTgs.trueFalseIcon(eq.equipInventoryStatus,eq.equipticketNumber),
                            equipStatus: eq.equipStatus,
                            equipStatusLight: strTgs.trueFalseIcon(eq.equipStatus,eq.equipStatus),
                            equipType: eq.equipType,
                            equipMake: eq.equipMake,
                            equipModel: eq.equipModel,
                            equipSubModel: eq.equipSubModel,
                            equipAddOns: eq.equipAddOns,
                            equipRUHieght: eq.equipRUHieght,
                            equipReceived: strTgs.dateMod(eq.equipReceived),
                            equipPONum: eq.equipPONum,
                            equipInvoice: eq.equipInvoice,
                            equipProjectNum: eq.equipProjectNum,
                            equipAcquisition: strTgs.dateMod(eq.equipAcquisition),
                            equipNotes: eq.equipNotes,
                            createdOn: strTgs.dateMod(eq.createdOn),
                            modifiedOn: strTgs.dateMod(eq.modifiedOn),
                            equipPorts: eq.equipPorts.map((ep) => {
                           return {
                                equipPortsId: ep.id,
                                equipPortType: ep.equipPortType,
                                equipPortsAddr: ep.equipPortsAddr,
                                equipPortName: ep.equipPortName,
                                equipPortsOpt: ep.equipPortsOpt,
                                createdBy: ep.createdBy,
                                createdOn: strTgs.dateMod(ep.createdOn),
                                modifiedby: ep.modifiedbBy,
                                modifiedOn: strTgs.dateMod(ep.modifiedOn),
                            };
                            }),

                            systemName: tempSys.systemName,
                            systemEnviron: tempSys.systemEnviron,
                            systemRole: tempSys.systemRole,
                            systemStatus: strTgs.trueFalseIcon(tempSys.systemStatus,tempSys.systemStatus),
                            systemTicket: tempSys.systemTicket,
                            systemNotes: tempSys.systemNotes,
                            sysmodifiedOn: strTgs.dateMod(tempSys.modifiedOn),

                    };
                })
            };
           //logger.info('context List >>>>>> '+context.toString());
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/equipsys-list', context);
        });});
    } else {
    // little regex to get the contains rack location
    var re = new RegExp(req.params.datacenter, 'i');
    Models.Equipment.find({equipLocation:  { $regex: re }}).sort({equipLocation:-1}).exec((err, eqs) => {
        if (err) return next(err);
        if (!eqs) return next();
       //logger.info('eqs'+eqs);
        Models.Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus systemTicket systemNotes modifiedOn', (err, sys) => {

        if (err) return next(err);
        if (!sys) return next();
        //logger.info('SYS >>>>>>>>>>>'+sys);

            var context = {
                        rackView: req.params.datacenter,
                        menu1: req.params.datacenter,
                        menuLink1: '/location/rack/'+req.params.datacenter,
                        titleNow: req.params.datacenter,
               eqs: eqs.map((eq) => {
                 tempSys = strTgs.findThisInThatMulti(eq.equipSN,sys,'systemEquipSN');
                  return {
                            equipLocation: eq.equipLocation,
                            equipLocationRack: strTgs.ruToLocation(eq.equipLocation),
                            equipSN: eq.equipSN,
                            equipRUHieght: eq.equipRUHieght,
                            equipTicketNumber: eq.equipticketNumber,
                            equipInventoryStatus: strTgs.trueFalseIcon(eq.equipInventoryStatus,eq.equipticketNumber),
                            equipStatus: eq.equipStatus,
                            equipStatusLight: strTgs.trueFalseIcon(eq.equipStatus,eq.equipStatus),
                            equipIsVirtual: eq.equipIsVirtual,
                            equipType: eq.equipType,
                            equipMake: eq.equipMake,
                            equipModel: eq.equipModel,
                            equipSubModel: eq.equipSubModel,
                            equipAddOns: eq.equipAddOns,
                            equipReceived: strTgs.dateMod(eq.equipReceived),
                            equipPONum: eq.equipPONum,
                            equipInvoice: eq.equipInvoice,
                            equipProjectNum: eq.equipProjectNum,
                            equipAcquisition: strTgs.dateMod(eq.equipAcquisition),
                            equipNotes: eq.equipNotes,
                            createdOn: strTgs.dateMod(eq.createdOn),
                            modifiedOn: strTgs.dateMod(eq.modifiedOn),
                            equipPorts: eq.equipPorts.map((ep) => {
                           return {
                                equipPortsId: ep.id,
                                equipPortType: ep.equipPortType,
                                equipPortsAddr: ep.equipPortsAddr,
                                equipPortName: ep.equipPortName,
                                equipPortsOpt: ep.equipPortsOpt,
                                createdBy: ep.createdBy,
                                createdOn: strTgs.dateMod(ep.createdOn),
                                modifiedby: ep.modifiedbBy,
                                modifiedOn: strTgs.dateMod(ep.modifiedOn),
                            };
                            }),
                            systemName: tempSys.systemName,
                            systemEnviron: tempSys.systemEnviron,
                            systemRole: tempSys.systemRole,
                            systemStatus: strTgs.trueFalseIcon(tempSys.systemStatus,tempSys.systemStatus),
                            systemTicket: tempSys.systemTicket,
                            systemNotes: tempSys.systemNotes,
                            sysmodifiedOn: strTgs.dateMod(tempSys.modifiedOn),
                    };
                })
            };
           //logger.info('context Rack >>>>>> '+context.toString());
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/equipsys-list', context);
        });});
    }
}
};


// --------------------------------------------------------------------
//                   working to display list of Equipment w/ systems
//          will not show systems without equipment
//            first half does table version, second half does SVG version
// ---------------------------------------------------------------------

exports.dcRackElevationPage = (req, res, next) => {
        if (accConfig.accessCheck(req.user).read !== 1){
          req.session.flash = strTgs.notAuth;
        return res.redirect(303, '/');
    }else{
    //logger.info('***********exports.dcRackElevationPage First >' +req.params.datacenter);
    if (!req.params.datacenter){
    //logger.info('in EquipSysPages - List');
    // this looks for 'list' as the / url. if it exists, it prints the datacenter list
        Models.Equipment.find({}).exec((err, eqs) => {
        if (err) return next(err);
        if (!eqs) return next();
        //logger.info(eqs);
        Models.Systemdb.find({}, 'systemName systemEquipSN systemEnviron systemRole systemInventoryStatus systemTicket systemNotes systemStatus modifiedOn', (err, sys) => {

        if (err) return next(err);
        if (!sys) return next();
        //logger.info('SYS >>>>>>>>>>>'+sys);

            var context = {
               eqs: eqs.map((eq) => {
                 tempSys = strTgs.findThisInThatMulti(eq.equipSN,sys,'systemEquipSN');



                  return {

                            equipLocation: eq.equipLocation,
                            equipLocationRack: strTgs.ruToLocation(eq.equipLocation),
                            equipSN: eq.equipSN,
                            equipTicketNumber: eq.equipticketNumber,
                            equipInventoryStatus: strTgs.trueFalseIcon(eq.equipInventoryStatus,eq.equipticketNumber),
                            equipStatus: eq.equipStatus,
                            equipStatusLight: strTgs.trueFalseIcon(eq.equipStatus,eq.equipStatus),
                            equipType: eq.equipType,
                            equipMake: eq.equipMake,
                            equipModel: eq.equipModel,
                            equipSubModel: eq.equipSubModel,
                            equipAddOns: eq.equipAddOns,
                            equipReceived: strTgs.dateMod(eq.equipReceived),
                            equipPONum: eq.equipPONum,
                            equipProjectNum: eq.equipProjectNum,
                            createdOn: strTgs.dateMod(eq.createdOn),
                            modifiedOn: strTgs.dateMod(eq.modifiedOn),
                            equipPorts: eq.equipPorts.map((ep) => {
                           return {
                                equipPortsId: ep.id,
                                equipPortType: ep.equipPortType,
                                equipPortsAddr: ep.equipPortsAddr,
                                equipPortName: ep.equipPortName,
                                equipPortsOpt: ep.equipPortsOpt,
                                createdBy: ep.createdBy,
                                createdOn: strTgs.dateMod(ep.createdOn),
                                modifiedby: ep.modifiedbBy,
                                modifiedOn: strTgs.dateMod(ep.modifiedOn),
                            };
                            }),

                            systemName: tempSys.systemName,
                            systemEnviron: tempSys.systemEnviron,
                            systemRole: tempSys.systemRole,
                            systemStatus: strTgs.trueFalseIcon(tempSys.systemStatus,tempSys.systemStatus),
                            sysmodifiedOn: strTgs.dateMod(tempSys.modifiedOn),

                    };
                })
            };
           //logger.info('context List >>>>>> '+context.toString());
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/elevation', context);
        });});
    } else {
    // little regex to get the contains rack location
    var re = new RegExp(req.params.datacenter, 'i');
    Models.Equipment.find({equipLocation:  { $regex: re }}).sort({equipLocation:1}).exec((err, eqs) => {
        if (err) return next(err);
        if (!eqs) return next();
       //logger.info('eqs'+eqs);
        Models.Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus modifiedOn', (err, sys) => {

        if (err) return next(err);
        if (!sys) return next();
        //logger.info('SYS >>>>>>>>>>>'+sys);
        Models.Rack.findOne({rackUnique: { $regex: re }},'rackUnique rackDescription rackHeight rackWidth rackDepth rackLat rackLon rackRow rackStatus rUs',(err,rk) => {
        //logger.info('rk >>>>>>>>>>>'+rk);
        //logger.info('rk.rackUnique>'+rk.rackUnique);
            var context = {
                rackView: req.params.datacenter,
                rackUnique: rk.rackUnique,
                rackDescription: rk.rackDescription,
                rackHeight: rk.rackHeight,
                rackWidth: rk.rackWidth,
                rackDepth: rk.rackDepth,
                rackLat: rk.rackLat,
                rackLon: rk.rackLon,
                rackRow: rk.rackRow,
                rackStatus: rk.rackStatus,
                rUs: rk.rUs,
                menu1: rk.rackUnique,
                menuLink1: '/location/rack/'+rk.rackUnique,
                titleNow: rk.rackUnique,

                eqs: eqs.map((eq) => {
                tempSys = strTgs.findThisInThatMulti(eq.equipSN,sys,'systemEquipSN');
                var test = strTgs.ruElevation(eq.equipLocation);
                if (isNaN(test)===true){
                eq.equipLocation = 1;
                }
                var fullRack;
                if (eq.equipType === 'Full Rack'){
                    fullRack = 0.8;
                    logger.info('fullRack 1 '+ fullRack);
                 }
                  return {
                            fullRack : fullRack,
                            equipLocation: eq.equipLocation,
                            equipLocationRack: strTgs.ruToLocation(eq.equipLocation),
                            equipLocationRu: strTgs.ruElevation(eq.equipLocation),
                            equipSN: eq.equipSN,
                            equipRUHieght: strTgs.checkNull(eq.equipRUHieght),
                            equipTicketNumber: eq.equipticketNumber,
                            equipInventoryStatus: strTgs.trueFalseIcon(eq.equipInventoryStatus,eq.equipticketNumber),
                            equipStatus: eq.equipStatus,
                            equipStatusLight: strTgs.trueFalseD3(eq.equipStatus,eq.equipStatus),
                            equipIsVirtual: eq.equipIsVirtual,
                            equipType: eq.equipType,
                            equipTypeColor: strTgs.equipTypeColor(eq.equipType),
                            equipMake: eq.equipMake,
                            equipModel: eq.equipModel,
                            equipSubModel: eq.equipSubModel,
                            equipReceived: strTgs.dateMod(eq.equipReceived),
                            equipPONum: eq.equipPONum,
                            equipProjectNum: eq.equipProjectNum,
                            createdOn: strTgs.dateMod(eq.createdOn),
                            modifiedOn: strTgs.dateMod(eq.modifiedOn),
                            equipPorts: eq.equipPorts.map((ep) => {
                           return {
                                equipPortsId: ep.id,
                                equipPortType: ep.equipPortType,
                                equipPortsAddr: ep.equipPortsAddr,
                                equipPortName: ep.equipPortName,
                                equipPortsOpt: ep.equipPortsOpt,
                                createdBy: ep.createdBy,
                                createdOn: strTgs.dateMod(ep.createdOn),
                                modifiedby: ep.modifiedbBy,
                                modifiedOn: strTgs.dateMod(ep.modifiedOn),
                            };
                            }),
                            systemName: tempSys.systemName,
                            systemEnviron: tempSys.systemEnviron,
                            systemRole: tempSys.systemRole,
                            systemStatus: strTgs.trueFalseIcon(tempSys.systemStatus,tempSys.systemStatus),
                            sysmodifiedOn: strTgs.dateMod(tempSys.modifiedOn),
                    };
                })
            };
           //logger.info('context Rack >>>>>> '+context.rackUnique);
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/elevation', context);
        });});});
    }
}
};

/*---------------------------------------------------------------------
---------------------------- Equipment SN Change ----------------------
-----------------------------------------------------------------------
*/

exports.dcEquipSNChange = (req, res, next) => {
  var context;
  var tempSys;
  if (accConfig.accessCheck(req.user).delete !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
  // logger.info('req.params.datacenter >>>>>> '+req.params.datacenter);
    Models.Equipment.findOne({equipSN: req.params.datacenter}, (err, eq) => {
      if (err) return next(err);
      if (!eq) return next(err);
      Models.Systemdb.find({}, 'systemEquipSN systemName', (err, sys) => {
        tempSys = strTgs.findThisInThatMulti(eq.equipSN, sys, 'systemEquipSN');
        context = {
          menu1: eq.equipSN,
          menuLink1: '#',
          titleNow: eq.equipSN,
          equipId: eq._id,
          oldEquipSN: eq.equipSN,
          systemName: tempSys.systemName,
        };
        res.render('asset/equipmentsnchange', context);
      });
    });
  }
};



exports.dcEquipSNChangePost = (req, res) => {
// logger.info('got this far');
  if (accConfig.accessCheck(req.user).delete !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
    res.oldEquipSN = req.body.oldEquipSN;
    res.equipSN = strTgs.cTrim(req.body.equipSN);
    // logger.info('res. stuff'+res.oldEquipSN+' and '+res.equipSN+' for '+req.body.equipId);
    if (req.body.oldEquipSN) {
      async.waterfall([
        (callback) => {
          Models.Equipment.findOne({equipSN: res.oldEquipSN}, (err, equipSNtoChange) => {
            if (err) {
              logger.info(err);
              callback(null);
            } else {
              equipSNtoChange.equipSN = res.equipSN;
              equipSNtoChange.save((err) => {
                if (err) {
                  logger.log('validation error');
                  logger.error(err.stack);
                  return callback(err, 'validation error');
                } else {
                  logger.info('SN Updated');
                  callback(null, 'EquipSN Updated');
                }});
            }
          });
        },
        (arg1, callback) => {
          Models.Equipment.update({equipParent: res.oldEquipSN}, {equipParent: res.equipSN}, {multi: true}, (err) => {
            if (err) {
              // logger.error(err.stack);
              callback(null, arg1, 'equipLocation Failed');
            }
            // logger.info('Some sysEquipSN Updated');
            callback(null, 'EquipSN Updated');
          });
        },
        (arg1, callback) => {
          Models.Systemdb.update({systemEquipSN: res.oldEquipSN}, {systemEquipSN: res.equipSN}, {multi: true}, (err) => {
            if (err) {
              // logger.error(err.stack);
              callback(null, arg1, 'sysEquipSN Failed');
            }
            // logger.info('Some sysEquipSN Updated');
            callback(null, 'EquipSN Updated');
          });
        },
      ], (err, result) => {
        if (err) {
          logger.error(err.stack);
          req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'There was an error processing your request.',
          };
          return res.redirect(303, `/equipment/${strTgs.cTrim(res.oldEquipSN)}/edit`);
        }
        req.session.flash = {
          type: 'success',
          intro: 'Thank you!',
          message: 'The SN has been changed.',
        };
        return res.redirect(303, `/equipment/${strTgs.cTrim(res.equipSN)}`);
      });
    }
  }
};




/*---------------------------------------------------------------------
---------------------------- Equipment Delete ------------------------------
------------------------------------------------------------------------
*/
exports.dcEquipDelete = (req, res) => {
  if (accConfig.accessCheck(req.user).delete !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
    res.abbreviation = req.body.equipSN;
    res.newpage = req.body.equipLocationRack;
    if (req.body.equipSN) {
    // logger.info('delete got this far');
      Models.Equipment.findOne({equipSN: req.body.equipSN}, (err, equipSNtodelete) => {
        if (err) {
        // logger.info(err);
        // return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        } else {
          equipSNtodelete.remove((err) => {
            if (err) {
              logger.info(err);
              req.session.flash = {
                type: 'danger',
                intro: 'Ooops!',
                message: 'Something went wrong, '+ req.body.equipSNtodelete +' was not deleted.',
              };
              return res.redirect(303, '/location/equipment/'+ res.abbreviation);
            } else {
              req.session.flash = {
                type: 'success',
                intro: 'Done!',
                message: 'Equipment '+ res.abbreviation +' has been deleted. Good luck with that one',
              };
              return (res.newpage ==='')? res.redirect(303,'/') :  res.redirect(303, `/equipment-systems/${res.newpage}`);
            }
          });
        }
      });
    }
  }
};

/* ---------------------------------------------------------------------
-------------------    equipPorts Delete   --------------------------------
------------------------------------------------------------------------
*/

exports.equipSubDelete = (req, res) => {
  if (accConfig.accessCheck(req.user).delete !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
    res.abbreviation = req.body.abbreviation;
    if (req.body.id && req.body.subId) {
      Models.Equipment.findById(req.body.id, req.body.subDoc, (err, eq) => {
        if (err) {
          logger.info(err);
          // return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        } else {
          eq.equipPorts.id(req.body.subId).remove();
          eq.save((err) => {
            if (err) {
              logger.info(err);
              req.session.flash = {
                type: 'danger',
                intro: 'Ooops!',
                message: 'Something went wrong',
              };
              return res.redirect(303, `/equipment/${res.abbreviation}/edit`);
            } else {
              req.session.flash = {
                type: 'success',
                intro: 'Done!',
                message: 'The port has been deleted.',
              };
              return res.redirect(303, `/equipment/${res.abbreviation}/edit`);
            }
          });
        }
      });
    }
  }
};
