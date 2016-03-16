const async = require('async');
const logger = require('../lib/logger.js');
const strTgs = require('../lib/stringThings.js');
const accConfig = require('../config/access');
const ObjectId = require('mongoose').Types.ObjectId;

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
            equipInventoryStatus: strTgs.trueFalseIcon(eq.equipInventoryStatus, eq.equipticketNumber),
            equipStatus: eq.equipStatus,
            equipStatusLight: strTgs.trueFalseIcon(eq.equipStatus, eq.equipStatus),
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
  var getRackrUs;
  Models.Optionsdb.find({}, 'optListKey optListArray', (err, opt) => {
    if (err) {
      logger.warn(`${funcName} Optionsdb \n${err}`);
      req.session.flash = strTgs.errMsg('There was an error processing your request.');
      res.redirect(backURL);
      return next;
    }
      // var RuTemp = 52;
    getRackrUs = (RuTemp) => {
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
            equipIPMIv: eq.equipIPMIv,
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
            equipIPMIv: eq.equipIPMIv,
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
            equipIPMIv: eq.equipIPMIv,
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
  var backURL = req.header('Referer') || '/';
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
                equipPortType: strTgs.multiTrim(body.equipPortType[i], 6, 0),
                equipPortsAddr: strTgs.multiTrim(body.equipPortsAddr[i], 10, 1),
                equipPortName: strTgs.multiTrim(body.equipPortName[i], 5, 2),
                equipPortsOpt: strTgs.multiTrim(body.equipPortsOpt[i], 6, 2),
              });
            }
          }
          return Ports;
        };

        Models.Equipment.create({
          equipPorts: varPortsNew(data),
          equipLocation: strTgs.locComb(data.equipLocationRack, data.equipLocationRu),
          equipSN: strTgs.cTrim(data.equipSN),
          equipAssetTag: strTgs.multiTrim(data.equipAssetTag, 5, 0),
          equipTicketNumber: strTgs.multiTrim(data.equipTicketNumber, 9, 2),
          equipInventoryStatus: data.equipInventoryStatus,
          equipStatus: strTgs.multiTrim(data.equipStatus, 5, 0),
          equipIsVirtual: data.equipIsVirtual,
          equipType: strTgs.multiTrim(data.equipType, 5, 0),
          equipMake: strTgs.multiTrim(data.equipMake, 5, 0),
          equipModel: strTgs.multiTrim(data.equipModel, 5, 0),
          equipSubModel: strTgs.multiTrim(data.equipSubModel, 5, 0),
          equipRUHieght: strTgs.multiTrim(data.equipRUHieght, 5, 0),
          equipParent: strTgs.multiTrim(data.equipParent, 9, 1),
          equipImgFront: strTgs.multiTrim(data.equipImgFront, 5, 0),
          equipImgRear: strTgs.multiTrim(data.equipImgRear, 5, 0),
          equipImgInternal: strTgs.multiTrim(data.equipImgInternal, 5, 0),
          equipFirmware: strTgs.multiTrim(data.equipFirmware, 5, 0),
          equipIPMIv: strTgs.multiTrim(data.equipIPMIv, 5, 0),
          equipMobo: strTgs.multiTrim(data.equipMobo, 5, 0),
          equipCPUCount: strTgs.multiTrim(data.equipCPUCount, 5, 0),
          equipCPUCores: strTgs.multiTrim(data.equipCPUCores, 5, 0),
          equipCPUType: strTgs.multiTrim(data.equipCPUType, 5, 0),
          equipMemType: strTgs.multiTrim(data.equipMemType, 5, 0),
          equipMemTotal: strTgs.multiTrim(data.equipMemTotal, 5, 0),
          equipRaidType: strTgs.multiTrim(data.equipRaidType, 5, 0),
          equipRaidLayout: strTgs.multiTrim(data.equipRaidLayout, 5, 0),
          equipHDDCount: strTgs.multiTrim(data.equipHDDCount, 5, 0),
          equipHDDType: strTgs.multiTrim(data.equipHDDType, 5, 0),
          equipNICCount: strTgs.multiTrim(data.equipNICCount, 5, 0),
          equipNICType: strTgs.multiTrim(data.equipNICType, 5, 0),
          equipPSUCount: strTgs.multiTrim(data.equipPSUCount, 5, 0),
          equipPSUDraw: strTgs.multiTrim(data.equipPSUDraw, 5, 0),
          equipAddOns: strTgs.multiTrim(data.equipAddOns, 5, 0),
          equipReceived: strTgs.dateAddTZ(data.equipReceived, req.session.ses.timezone),
          equipAcquisition: strTgs.dateAddTZ(data.equipAcquisition, req.session.ses.timezone),
          equipInService: strTgs.dateAddTZ(data.equipInService, req.session.ses.timezone),
          equipEndOfLife: strTgs.dateAddTZ(data.equipEndOfLife, req.session.ses.timezone),
          equipWarrantyMo: strTgs.multiTrim(data.equipWarrantyMo, 5, 0),
          equipPONum: strTgs.multiTrim(data.equipPONum, 5, 0),
          equipInvoice: strTgs.multiTrim(data.equipInvoice, 5, 0),
          equipProjectNum: strTgs.multiTrim(data.equipProjectNum, 5, 0),
          equipLicense: strTgs.multiTrim(data.equipLicense, 5, 0),
          equipMaintAgree: strTgs.multiTrim(data.equipMaintAgree, 5, 0),
          equipPurchaseType: strTgs.multiTrim(data.equipPurchaseType, 5, 0),
          equipPurchaser: strTgs.multiTrim(data.equipPurchaser, 5, 0),
          equipPurchaseTerms: strTgs.multiTrim(data.equipPurchaseTerms, 5, 0),
          equipPurchaseEnd: strTgs.dateAddTZ(data.equipPurchaseEnd, req.session.ses.timezone),
          equipNotes: strTgs.multiTrim(data.equipNotes, 5, 0),
          createdBy: req.user.local.email,
          createdOn: Date.now(),
          modifiedBy: req.user.local.email,
          modifiedOn: Date.now(),
        }, (err) => {
          if (err) {
            logger.warn(err);
            // if (err.indexOf('ValidationError') !== -1) {
              req.session.flash = {
                type: 'danger',
                intro: 'Duplicate!',
                message: 'That Equipment SN or MAC address already exists.',
              };
              return res.redirect(303, `/equipment/${res.abbreviation}/copy`);
            // }
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
                  equipPortType: strTgs.multiTrim(data.equipPortType[i], 6, 0),
                  equipPortsAddr: strTgs.multiTrim(data.equipPortsAddr[i], 10, 1),
                  equipPortName: strTgs.multiTrim(data.equipPortName[i], 5, 2),
                  equipPortsOpt: strTgs.multiTrim(data.equipPortsOpt[i], 6, 2),
                });
              } else {
              // logger.info('existing port');
                var thisSubDoc = eq.equipPorts.id(data.equipPortId[i]);
                thisSubDoc.equipPortType = strTgs.multiTrim(data.equipPortType[i], 6, 0);
                thisSubDoc.equipPortsAddr = strTgs.multiTrim(data.equipPortsAddr[i], 10, 1);
                thisSubDoc.equipPortName = strTgs.multiTrim(data.equipPortName[i], 5, 2);
                thisSubDoc.equipPortsOpt = strTgs.multiTrim(data.equipPortsOpt[i], 6, 2);
              }
            }
            thisDoc.equipLocation = strTgs.locComb(data.equipLocationRack, data.equipLocationRu);
            thisDoc.equipAssetTag = strTgs.multiTrim(data.equipAssetTag, 5, 0);
            thisDoc.equipTicketNumber = strTgs.multiTrim(data.equipTicketNumber, 9, 2);
            thisDoc.equipInventoryStatus = data.equipInventoryStatus;
            thisDoc.equipStatus = strTgs.multiTrim(data.equipStatus, 5, 0);
            thisDoc.equipIsVirtual = data.equipIsVirtual;
            thisDoc.equipEOL = data.equipEOL;
            thisDoc.equipType = strTgs.multiTrim(data.equipType, 5, 0);
            thisDoc.equipMake = strTgs.multiTrim(data.equipMake, 5, 0);
            thisDoc.equipModel = strTgs.multiTrim(data.equipModel, 5, 0);
            thisDoc.equipSubModel = strTgs.multiTrim(data.equipSubModel, 5, 0);
            thisDoc.equipRUHieght = strTgs.multiTrim(data.equipRUHieght, 5, 0);
            thisDoc.equipParent = strTgs.multiTrim(data.equipParent, 9, 1);
            thisDoc.equipImgFront = strTgs.multiTrim(data.equipImgFront, 5, 0);
            thisDoc.equipImgRear = strTgs.multiTrim(data.equipImgRear, 5, 0);
            thisDoc.equipImgInternal = strTgs.multiTrim(data.equipImgInternal, 5, 0);
            thisDoc.equipFirmware = strTgs.multiTrim(data.equipFirmware, 5, 0);
            thisDoc.equipIPMIv = strTgs.multiTrim(data.equipIPMIv, 5, 0);
            thisDoc.equipMobo = strTgs.multiTrim(data.equipMobo, 5, 0);
            thisDoc.equipCPUCount = strTgs.multiTrim(data.equipCPUCount, 5, 0);
            thisDoc.equipCPUCores = strTgs.multiTrim(data.equipCPUCores, 5, 0);
            thisDoc.equipCPUType = strTgs.multiTrim(data.equipCPUType, 5, 0);
            thisDoc.equipMemType = strTgs.multiTrim(data.equipMemType, 5, 0);
            thisDoc.equipMemTotal = strTgs.multiTrim(data.equipMemTotal, 5, 0);
            thisDoc.equipRaidType = strTgs.multiTrim(data.equipRaidType, 5, 0);
            thisDoc.equipRaidLayout = strTgs.multiTrim(data.equipRaidLayout, 5, 0);
            thisDoc.equipHDDCount = strTgs.multiTrim(data.equipHDDCount, 5, 0);
            thisDoc.equipHDDType = strTgs.multiTrim(data.equipHDDType, 5, 0);
            thisDoc.equipNICCount = strTgs.multiTrim(data.equipNICCount, 5, 0);
            thisDoc.equipNICType = strTgs.multiTrim(data.equipNICType, 5, 0);
            thisDoc.equipPSUCount = strTgs.multiTrim(data.equipPSUCount, 5, 0);
            thisDoc.equipPSUDraw = strTgs.multiTrim(data.equipPSUDraw, 5, 0);
            thisDoc.equipAddOns = strTgs.multiTrim(data.equipAddOns, 5, 0);
            thisDoc.equipReceived = strTgs.dateAddTZ(data.equipReceived, req.session.ses.timezone);
            thisDoc.equipAcquisition = strTgs.dateAddTZ(data.equipAcquisition, req.session.ses.timezone);
            thisDoc.equipInService = strTgs.dateAddTZ(data.equipInService, req.session.ses.timezone);
            thisDoc.equipEndOfLife = strTgs.dateAddTZ(data.equipEndOfLife, req.session.ses.timezone);
            thisDoc.equipWarrantyMo = strTgs.multiTrim(data.equipWarrantyMo, 5, 0);
            thisDoc.equipPONum = strTgs.multiTrim(data.equipPONum, 5, 0);
            thisDoc.equipInvoice = strTgs.multiTrim(data.equipInvoice, 5, 0);
            thisDoc.equipProjectNum = strTgs.multiTrim(data.equipProjectNum, 5, 0);
            thisDoc.equipLicense = strTgs.multiTrim(data.equipLicense, 5, 0);
            thisDoc.equipMaintAgree = strTgs.multiTrim(data.equipMaintAgree, 5, 0);
            thisDoc.equipPurchaseType = strTgs.multiTrim(data.equipPurchaseType, 5, 0);
            thisDoc.equipPurchaser = strTgs.multiTrim(data.equipPurchaser, 5, 0);
            thisDoc.equipPurchaseTerms = strTgs.multiTrim(data.equipPurchaseTerms, 5, 0);
            thisDoc.equipPurchaseEnd = strTgs.dateAddTZ(data.equipPurchaseEnd, req.session.ses.timezone);
            thisDoc.equipNotes = strTgs.multiTrim(data.equipNotes, 5, 0);
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

exports.dcEquipSysPages = (req, res, next) => {
  var context = {};
  var tempSys;
  var re;
  if (accConfig.accessCheck(req.user).read !== 1) {
  req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
  // logger.info('***********exports.dcEquipSysPages First >' +req.params.datacenter);
    if (!req.params.datacenter) {
    // logger.info('in EquipSysPages - List');
    // this looks for 'list' as the / url. if it exists, it prints the datacenter list
      Models.Equipment.find({}).exec((err, eqs) => {
        if (err || !eqs) return next(err);
        //  logger.info(eqs);
        Models.Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus systemTicket systemNotes modifiedOn', (err, sys) => {
          if (err) return next(err);
          if (!sys) return next();
          // logger.info('SYS >>>>>>>>>>>'+sys);
          context = {
            eqs: eqs.map((eq) => {
              tempSys = strTgs.findThisInThatMulti(eq.equipSN, sys, 'systemEquipSN');
              return {
              // titleNow:dc.abbreviation,
                equipLocation: eq.equipLocation,
                equipLocationRack: strTgs.ruToLocation(eq.equipLocation),
                equipSN: eq.equipSN,
                equipTicketNumber: eq.equipticketNumber,
                equipInventoryStatus: strTgs.trueFalseIcon(eq.equipInventoryStatus, eq.equipticketNumber),
                equipStatus: eq.equipStatus,
                equipStatusLight: strTgs.trueFalseIcon(eq.equipStatus, eq.equipStatus),
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
                systemStatus: strTgs.trueFalseIcon(tempSys.systemStatus, tempSys.systemStatus),
                systemTicket: tempSys.systemTicket,
                systemNotes: tempSys.systemNotes,
                sysmodifiedOn: strTgs.dateMod(tempSys.modifiedOn),
              };
            }),
          };
          // logger.info('context List >>>>>> '+context.toString());
          // the 'location/datacenter-list' is the view that will be called
          // context is the data from above
          res.render('asset/equipsys-list', context);
        });
      });
    } else {
    // little regex to get the contains rack location
      re = new RegExp(req.params.datacenter, 'i');
      Models.Equipment.find({equipLocation:  { $regex: re }}).sort({equipLocation: - 1}).exec((err, eqs) => {
        if (err || !eqs) return next(err);
       // logger.info('eqs'+eqs);
        Models.Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus systemTicket systemNotes modifiedOn', (err, sys) => {
          if (err || !sys) return next(err);
          // logger.info('SYS >>>>>>>>>>>'+sys);
          context = {
            rackView: req.params.datacenter,
            menu1: req.params.datacenter,
            menuLink1: `/location/rack/${req.params.datacenter}`,
            titleNow: req.params.datacenter,
            eqs: eqs.map((eq) => {
              tempSys = strTgs.findThisInThatMulti(eq.equipSN, sys, 'systemEquipSN');
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
            }),
          };
          // logger.info('context Rack >>>>>> '+context.toString());
          // the 'location/datacenter-list' is the view that will be called
          // context is the data from above
          res.render('asset/equipsys-list', context);
        });
      });
    }
  }
};


// --------------------------------------------------------------------
//                   working to display list of Equipment w/ systems
//          will not show systems without equipment
//            first half does table version, second half does SVG version
// ---------------------------------------------------------------------

exports.dcRackElevationPage = (req, res, next) => {
  var context = {};
  var tempSys;
  var re;
  var test;
  var fullRack;
  if (accConfig.accessCheck(req.user).read !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
  // logger.info('***********exports.dcRackElevationPage First >' +req.params.datacenter);
    if (!req.params.datacenter) {
    // logger.info('in EquipSysPages - List');
    // this looks for 'list' as the / url. if it exists, it prints the datacenter list
      Models.Equipment.find({}).exec((err, eqs) => {
        if (err) return next(err);
        if (!eqs) return next();
        // logger.info(eqs);
        Models.Systemdb.find({}, 'systemName systemEquipSN systemEnviron systemRole systemInventoryStatus systemTicket systemNotes systemStatus modifiedOn', (err, sys) => {
          if (err || !sys) return next(err);
          // logger.info('SYS >>>>>>>>>>>'+sys);
          context = {
            eqs: eqs.map((eq) => {
              tempSys = strTgs.findThisInThatMulti(eq.equipSN, sys, 'systemEquipSN');
              return {
                equipLocation: eq.equipLocation,
                equipLocationRack: strTgs.ruToLocation(eq.equipLocation),
                equipSN: eq.equipSN,
                equipTicketNumber: eq.equipticketNumber,
                equipInventoryStatus: strTgs.trueFalseIcon(eq.equipInventoryStatus, eq.equipticketNumber),
                equipStatus: eq.equipStatus,
                equipStatusLight: strTgs.trueFalseIcon(eq.equipStatus, eq.equipStatus),
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
            }),
          };
          // logger.info('context List >>>>>> '+context.toString());
          // the 'location/datacenter-list' is the view that will be called
          // context is the data from above
          res.render('asset/elevation', context);
        });
      });
    } else {
    // little regex to get the contains rack location
      re = new RegExp(req.params.datacenter, 'i');
      Models.Equipment.find({equipLocation:  { $regex: re }}).sort({equipLocation: 1}).exec((err, eqs) => {
        if (err || !eqs) return next(err);
        // logger.info('eqs'+eqs);
        Models.Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus modifiedOn', (err, sys) => {
          if (err || !sys) return next(err);
          // logger.info('SYS >>>>>>>>>>>'+sys);
          Models.Rack.findOne({rackUnique: { $regex: re }}, 'rackUnique rackDescription rackHeight rackWidth rackDepth rackLat rackLon rackRow rackStatus rUs',(err, rk) => {
            // logger.info('rk >>>>>>>>>>>'+rk);
            // logger.info('rk.rackUnique>'+rk.rackUnique);
            context = {
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
              menuLink1: `/location/rack/${rk.rackUnique}`,
              titleNow: rk.rackUnique,
              eqs: eqs.map((eq) => {
                tempSys = strTgs.findThisInThatMulti(eq.equipSN, sys, 'systemEquipSN');
                test = strTgs.ruElevation(eq.equipLocation);
                if (isNaN(test) === true) {
                  eq.equipLocation = 1;
                }
                if (eq.equipType === 'Full Rack') {
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
              }),
            };
            // logger.info('context Rack >>>>>> '+context.rackUnique);
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/elevation', context);
          });
        });
      });
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
