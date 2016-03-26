const async = require('async');
const logger = require('../lib/logger.js');
const strTgs = require('../lib/stringThings.js');
const accConfig = require('../config/access');
const moment = require('moment');
const IpSubnetCalculator = require('ip-subnet-calculator');

// Models
const Models = require('../models');

// ---------------------------------------------------------------------
// ----------------------   System List  ----------------------------
// ---------------------------------------------------------------------
// app.get('/systems', handlers.system.dcSystemAll);

module.exports.dcSystemAll = (req, res, next) => {
  var funcName = 'dcSystemAll';
  var backURL = req.header('Referer') || '/';
  var context;
  // logger.info('***********exports.dcSystemAll First >' +req.params.datacenter);
  Models.Systemdb.find({}).sort({'modifiedOn': 'desc'}).exec((err, sys) => {
    if (err || !sys) {
      logger.warn(`${funcName} Systemdb find all \n${err}`);
      req.session.flash = strTgs.errMsg('Could not find Systems');
      res.redirect(backURL);
      return next;
    } else {
      // logger.info('system-list'+sys);
      context = {
        sys: sys.map((sy) => {
        // rack.populate('rackParentDC', 'abbreviation cageNickname')
        // logger.info('sy Map>'+sy);
          return {
            systemName: sy.systemName,
            systemEquipSN: sy.systemEquipSN,
            systemEnviron: sy.systemEnviron,
            systemRole: sy.systemRole,
            systemTicket: sy.systemTicket,
            systemTicketLit: strTgs.trueFalseIcon(sy.systemInventoryStatus, sy.systemTicket),
            systemStatus: strTgs.trueFalseIcon(sy.systemStatus, sy.systemStatus),
            createdOn: strTgs.dateMod(sy.createdOn),
            modifiedOn: strTgs.dateMod(sy.modifiedOn),
          };
        }),
      };
      // the 'location/datacenter-list' is the view that will be called
      // context is the data from above
      res.render('asset/system-list', context);
    }
  });
};

// ---------------------------------------------------------------------
// ---------------------  Create New System  ---------------------------
// ---------------------------------------------------------------------
// app.get('/systems/new', handlers.system.dcSystemNew);
module.exports.dcSystemNew = (req, res, next) => {
  var funcName = 'dcSystemNew';
  var backURL = req.header('Referer') || '/';
  var context;
  Models.Optionsdb.find({}, 'optListKey optListArray', (err, opt) => {
    if (err || !opt) {
      logger.warn(`${funcName} Optionsdb \n${err}`);
      req.session.flash = strTgs.errMsg('Could not find Options');
      res.redirect(backURL);
      return next;
    } else {
      context = {
        titleNow: 'New System',
        optSystPortType: strTgs.findThisInThatMulti('optSystPortType', opt, 'optListKey'),
        optSystStatus: strTgs.findThisInThatMulti('optSystStatus', opt, 'optListKey'),
        optEnvironment: strTgs.findThisInThatMulti('optEnvironment', opt, 'optListKey'),
        optImpactLevel: strTgs.findThisInThatMulti('optImpactLevel', opt, 'optListKey'),
      };
      // logger.info(context);
      res.render('asset/systemedit', context);
    }
  });
};

// -----------------------------------------------------------------------
// ------------------------ System View ----------------------------------
// -----------------------------------------------------------------------
// app.get('/system/:data', handlers.system.dcSystemView);
module.exports.dcSystemView = (req, res, next) => {
  var funcName = 'dcSystemView';
  var backURL = req.header('Referer') || '/';
  var syName = req.params.data;
  var context;
  var dcabbr;
  var thisEquip
  var thisEquipPortsMapped;
  var hasIlom;
  var makeMod;
  var isACS6000;
  var isServTechPDU;
  var sTHostName;
  var sTHostAB;
  Models.Systemdb.find({}, {'systemName': 1, 'systemAlias': 1, 'systemParentId': 1, '_id': 0}, {sort: {systemName: 1}}, (err, sysName) => {
    // For building Parent/alias port config reports.
    if (err || !sysName) {
      logger.warn(`${funcName} Systemdb find all for Parent/alias \n${err}`);
      req.session.flash = strTgs.errMsg('Could not find Systems');
      res.redirect(backURL);
      return next;
    }
    Models.Systemdb.findOne({systemName: syName.toLowerCase()}, (err, sy) => {
      // Finds System in question
      if (err || !sy) {
        logger.warn(`${funcName} Systemdb find one \n${err}`);
        req.session.flash = strTgs.errMsg('Could not find Systems');
        res.redirect(backURL);
        return next;
      }
      Models.Optionsdb.find({}, 'optListKey optListArray', (err, opt) => {
        if (err) {
          logger.warn(`${funcName} Optionsdb find one \n${err}`);
          req.session.flash = strTgs.errMsg('Could not find Options');
          res.redirect(backURL);
          return next;
        }
        Models.Equipment.find({}, {'equipSN': 1, 'equipLocation': 1, 'equipMake': 1, 'equipModel': 1, 'equipSubModel': 1, 'equipStatus': 1, 'equipType': 1, 'equipRUHieght': 1, 'equipPorts': 1, 'equipAddOns': 1, '_id': 0}, {sort: {equipSN: 1}}, (err, eq) => {
          if (err) {
            logger.warn(`${funcName} Equipment find all \n${err}`);
            req.session.flash = strTgs.errMsg('Could not find Equipment');
            res.redirect(backURL);
            return next;
          }
          thisEquip = strTgs.findThisInThatMulti(sy.systemEquipSN, eq, 'equipSN');
          dcabbr = strTgs.getDCfromLoc(thisEquip.equipLocation);
          Models.Datacenter.findOne({abbreviation: dcabbr}, {'networks': 1, '_id': 0}, (err, oneDC) => {
            if (err) {
              logger.warn(`${funcName} Equipment find all \n${err}`);
              req.session.flash = strTgs.errMsg('Could not find Equipment');
              res.redirect(backURL);
              return next;
            }
            if (thisEquip.equipMake && thisEquip.equipModel !== false) {
              makeMod = thisEquip.equipMake.toLowerCase() + thisEquip.equipModel.toLowerCase();
              // logger.info('makeMod >'+makeMod);
              if (makeMod.indexOf('oracle') != -1 || makeMod.indexOf('sun') != -1) {
                hasIlom = 1;
                // logger.info('hasIlom >'+hasIlom);
              } else if (makeMod.indexOf('avocent') != -1 && makeMod.indexOf('60') != -1) {
                isACS6000 = 1;
                // logger.info('isACS6k >'+isACS6000);
              } else if (makeMod.indexOf('server technology') != -1) {
              // removes the A and B from the end of the PDU name
                sTHostName = sy.systemName.substring(0, sy.systemName.length - 1);
                // A or B from end of PDU name
                sTHostAB = sy.systemName.substring(sy.systemName.length - 1);
                if (sTHostAB === 'a') {
                  isServTechPDU = 1;
                }
              }
              thisEquipPortsMapped = thisEquip.equipPorts.map((tep) => {
                return {
                  equipPortType: tep.equipPortType,
                  equipPortsAddr: tep.equipPortsAddr,
                  equipPortName: tep.equipPortName,
                  equipPortsOpt: tep.equipPortsOpt,
                };
              });
            } else {
              thisEquipPortsMapped = '';
            }
            context = {
              titleNow: sy.systemName,
              menu1: 'Show connected ports',
              menuLink1: `/endpoint/${sy.systemName}`,
              ilom: hasIlom,
              isACS6000: isACS6000,
              isServTechPDU: isServTechPDU,
              sTHostName: sTHostName,
              sTHostAB: sTHostAB,
              optSystPortType: strTgs.findThisInThatMulti('optSystPortType', opt, 'optListKey'),
              optSystStatus: strTgs.findThisInThatMulti('optSystStatus', opt, 'optListKey'),
              optEnvironment: strTgs.findThisInThatMulti('optEnvironment', opt, 'optListKey'),
              optImpactLevel: strTgs.findThisInThatMulti('optImpactLevel', opt, 'optListKey'),
              systemId: sy._id,
              systemName: sy.systemName,
              systemEquipSN: sy.systemEquipSN,
              systemAlias: sy.systemAlias,
              systemEnviron: sy.systemEnviron,
              systemRole: sy.systemRole,
              systemInventoryStatus: sy.systemInventoryStatus,
              systemInventoryStatusChecked: strTgs.setCheckBox(sy.systemInventoryStatus),
              systemTicket: sy.systemTicket,
              systemTicketLit: strTgs.trueFalseIcon(sy.systemInventoryStatus, sy.systemTicket),
              systemStatus: sy.systemStatus,
              systemStatusLit: strTgs.trueFalseIcon(sy.systemStatus, sy.systemStatus),
              systemOwner: sy.systemOwner,
              //    systemImpact: sy.systemImpact,
              systemIsVirtual: sy.systemIsVirtual,
              systemIsVirtualChecked: strTgs.setCheckBox(sy.systmeIsVirtual),
              systemParentId: sy.systemParentId,
              systemOSType: sy.systemOSType,
              systemOSVersion: sy.systemOSVersion,
              systemApplications: sy.systemApplications,
              systemSupLic: sy.systemSupLic,
              systemSupEndDate: strTgs.dateMod(sy.systemSupEndDate),
              systemInstall: strTgs.dateMod(sy.systemInstall),
              systemStart: strTgs.dateMod(sy.systemStart),
              systemEnd: strTgs.dateMod(sy.systemEnd),
              systemNotes: sy.systemNotes,
              createdBy: sy.createdBy,
              createdOn: strTgs.dateMod(sy.createdOn),
              modifiedBy: sy.modifiedBy,
              modifiedOn: strTgs.dateMod(sy.modifiedOn),
              systemPorts: sy.systemPorts.map((sp) => {
                var isConsole;
                var isEthernet;
                var isInfiniband;
                var isInterconnect;
                var isNetMgmt;
                var isPower;
                var isSAN;
                var dcNet;
                var netMask;
                var endPointAlias;
                switch (sp.sysPortType) {
                  case 'Console':
                    isConsole = 'isConsole';
                    break;
                  case 'Ethernet':
                    isEthernet = 'isEthernet';
                    endPointAlias = strTgs.findThisInThatMulti(sp.sysPortEndPoint, sysName, 'systemName');
                    break;
                  case 'Infiniband':
                    isInfiniband = 'isInfiniband';
                    break;
                  case 'Interconnect':
                    isInterconnect = 'isInterconnect';
                    break;
                  case 'NetMgmt':
                    isNetMgmt = 'isNetMgmt';

                    if (!sp.sysPortVlan || thisEquip === false) {
                        // logger.info('findThisInThat.findThis is null');
                      dcNet = false;
                      netMask = false;
                    } else {
                        // logger.info('dc > '+oneDC);
                      dcNet = strTgs.findThisInThatNetwork(sp.sysPortVlan, oneDC.networks);
                      if (dcNet !== false) {
                        netMask = IpSubnetCalculator.calculateSubnetMask(dcNet.dcNetNetwork, dcNet.dcNetMask);
                        netMask = netMask.prefixMaskStr;
                      }
                    }
                    endPointAlias = strTgs.findThisInThatMulti(sp.sysPortEndPoint, sysName, 'systemName');

                    // dcNet = strTgs.findThisInThatNetwork(sp.sysPortVlan,dc);
                    // logger.info('system.dcNetwork >>>'+ dcNet);
                    break;
                  case 'Power':
                    isPower = 'isPower';
                    break;
                  case 'SAN':
                    isSAN = 'isSAN';
                    break;
                  default:
                    break;
                }
                return {
                  sysPortisConsole: isConsole,
                  sysPortisEthernet: isEthernet,
                  sysPortisInfiniband: isInfiniband,
                  sysPortisInterconnect: isInterconnect,
                  sysPortisNetMgmt: isNetMgmt,
                  sysPortisPower: isPower,
                  sysPortisSAN: isSAN,

                  dcNet: dcNet,
                  netMask: netMask,
                  endPointAlias: endPointAlias,

                  sysPortId: sp._id,
                  systemName: sy.systemName,
                  systemAlias: sy.systemAlias,
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
              equipLocation: thisEquip.equipLocation,
              equipLocationRack: strTgs.ruToLocation(thisEquip.equipLocation),
              equipStatus: thisEquip.equipStatus,
              equipStatusLight: strTgs.trueFalseIcon(thisEquip.equipStatus, thisEquip.equipStatus),
              equipType: thisEquip.equipType,
              equipMake: thisEquip.equipMake,
              equipModel: thisEquip.equipModel,
              equipSubModel: thisEquip.equipSubModel,
              equipRUHieght: thisEquip.equipRUHieght,
              equipAddOns: thisEquip.equipAddOns,
              equipPorts: thisEquipPortsMapped,
            };
            res.render('asset/system', context);
          });
        });
      });
    });
  });
};

// -----------------------------------------------------------------------
// -------------------------System Edit ----------------------------------
// -----------------------------------------------------------------------
// app.get('/system/:data/edit', handlers.system.dcSystemEdit);

module.exports.dcSystemEdit = (req, res, next) => {
  var funcName = 'dcSystemEdit';
  var backURL = req.header('Referer') || '/';
  var syName = req.params.data;
  var context;
  var thisEquip;
  var thisEquipPortsMapped;
  Models.Systemdb.findOne({systemName: syName.toLowerCase()}, (err, sy) => {
    // Finds System in question
    if (err || !sy) {
      logger.warn(`${funcName} Systemdb find one \n${err}`);
      req.session.flash = strTgs.errMsg('Could not find Systems');
      res.redirect(backURL);
      return next;
    }
    Models.Optionsdb.find({}, 'optListKey optListArray', (err, opt) => {
      if (err || !opt) {
        logger.warn(`${funcName} Optionsdb find one \n${err}`);
        req.session.flash = strTgs.errMsg('Could not find Options');
        res.redirect(backURL);
        return next;
      }
      Models.Equipment.find({equipSN: sy.systemEquipSN}, {'equipSN': 1, 'equipLocation': 1, 'equipMake': 1, 'equipModel': 1, 'equipSubModel': 1, 'equipStatus': 1, 'equipType': 1, 'equipRUHieght': 1, 'equipPorts': 1, 'equipAddOns': 1, '_id': 0}, {sort: {equipSN: 1}}, (err, eq) => {
        if (err) {
          logger.warn(`${funcName} Equipment find all \n${err}`);
          req.session.flash = strTgs.errMsg('Could not find Equipment');
          res.redirect(backURL);
          return next;
        }
        thisEquip = strTgs.findThisInThatMulti(sy.systemEquipSN, eq, 'equipSN');
        context = {
          titleNow: sy.systemName,
          menu1: 'Show connected ports',
          menuLink1: `/endpoint/${sy.systemName}`,
          optSystPortType: strTgs.findThisInThatMulti('optSystPortType', opt, 'optListKey'),
          optSystStatus: strTgs.findThisInThatMulti('optSystStatus', opt, 'optListKey'),
          optEnvironment: strTgs.findThisInThatMulti('optEnvironment', opt, 'optListKey'),
          optImpactLevel: strTgs.findThisInThatMulti('optImpactLevel', opt, 'optListKey'),
          systemId: sy._id,
          systemName: sy.systemName,
          systemEquipSN: sy.systemEquipSN,
          systemAlias: sy.systemAlias,
          systemEnviron: sy.systemEnviron,
          systemRole: sy.systemRole,
          systemInventoryStatus: sy.systemInventoryStatus,
          systemInventoryStatusChecked: strTgs.setCheckBox(sy.systemInventoryStatus),
          systemTicket: sy.systemTicket,
          systemTicketLit: strTgs.trueFalseIcon(sy.systemInventoryStatus, sy.systemTicket),
          systemStatus: sy.systemStatus,
          systemStatusLit: strTgs.trueFalseIcon(sy.systemStatus, sy.systemStatus),
          systemOwner: sy.systemOwner,
          //    systemImpact: sy.systemImpact,
          systemIsVirtual: sy.systemIsVirtual,
          systemIsVirtualChecked: strTgs.setCheckBox(sy.systmeIsVirtual),
          systemParentId: sy.systemParentId,
          systemOSType: sy.systemOSType,
          systemOSVersion: sy.systemOSVersion,
          systemApplications: sy.systemApplications,
          systemSupLic: sy.systemSupLic,
          systemSupEndDate: strTgs.dateMod(sy.systemSupEndDate),
          systemInstall: strTgs.dateMod(sy.systemInstall),
          systemStart: strTgs.dateMod(sy.systemStart),
          systemEnd: strTgs.dateMod(sy.systemEnd),
          systemNotes: sy.systemNotes,
          createdBy: sy.createdBy,
          createdOn: strTgs.dateMod(sy.createdOn),
          modifiedBy: sy.modifiedBy,
          modifiedOn: strTgs.dateMod(sy.modifiedOn),
          systemPorts: sy.systemPorts.map((sp) => {
            return {
              sysPortId: sp._id,
              systemName: sy.systemName,
              systemAlias: sy.systemAlias,
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
          equipLocation: thisEquip.equipLocation,
          equipLocationRack: strTgs.ruToLocation(thisEquip.equipLocation),
          equipStatus: thisEquip.equipStatus,
          equipStatusLight: strTgs.trueFalseIcon(thisEquip.equipStatus, thisEquip.equipStatus),
          equipType: thisEquip.equipType,
          equipMake: thisEquip.equipMake,
          equipModel: thisEquip.equipModel,
          equipSubModel: thisEquip.equipSubModel,
          equipRUHieght: thisEquip.equipRUHieght,
          equipAddOns: thisEquip.equipAddOns,
          equipPorts: thisEquipPortsMapped,
        };
        res.render('asset/systemedit', context);
      });
    });
  });
};

// -----------------------------------------------------------------------
// -------------------------System Copy ----------------------------------
// -----------------------------------------------------------------------
// app.get('/system/:data/copy', handlers.system.dcSystemCopy);
module.exports.dcSystemCopy = (req, res, next) => {
  var funcName = 'dcSystemCopy';
  var backURL = req.header('Referer') || '/';
  var syName = req.params.data;
  var context;
  Models.Systemdb.findOne({systemName: syName.toLowerCase()}, (err, sy) => {
    // Finds System in question
    if (err || !sy) {
      logger.warn(`${funcName} Systemdb find one \n${err}`);
      req.session.flash = strTgs.errMsg('Could not find Systems');
      res.redirect(backURL);
      return next;
    }
    Models.Optionsdb.find({}, 'optListKey optListArray', (err, opt) => {
      if (err || !opt) {
        logger.warn(`${funcName} Optionsdb find one \n${err}`);
        req.session.flash = strTgs.errMsg('Could not find Options');
        res.redirect(backURL);
        return next;
      }
      context = {
        optSystPortType: strTgs.findThisInThatMulti('optSystPortType', opt, 'optListKey'),
        optSystStatus: strTgs.findThisInThatMulti('optSystStatus', opt, 'optListKey'),
        optEnvironment: strTgs.findThisInThatMulti('optEnvironment', opt, 'optListKey'),
        wasCopy: sy.systemName,
        systemEnviron: sy.systemEnviron,
        systemRole: sy.systemRole,
        systemInventoryStatus: sy.systemInventoryStatus,
        systemInventoryStatusChecked: strTgs.setCheckBox(sy.systemInventoryStatus),
        systemTicket: sy.systemTicket,
        systemStatus: sy.systemStatus,
        systemOwner: sy.systemOwner,
        //     systemImpact: sy.systemImpact,
        systemIsVirtual: sy.systemIsVirual,
        systemIsVirtualChecked: strTgs.setCheckBox(sy.systmeIsVirtual),
        systemParentId: sy.systemParentId,
        systemOSType: sy.systemOSType,
        systemOSVersion: sy.systemOSVersion,
        systemApplications: sy.systemApplications,
        systemSupLic: sy.systemSupLic,
        systemSupEndDate: strTgs.dateMod(sy.systemSupEndDate),
        systemInstall: strTgs.dateMod(sy.systemInstall),
        systemStart: strTgs.dateMod(sy.systemStart),
        systemEnd: strTgs.dateMod(sy.systemEnd),
        systemPorts: sy.systemPorts.map((sp) => {
          return {
            sysPortType: sp.sysPortType,
            sysPortName: sp.sysPortName,
            sysPortVlan: sp.sysPortVlan,
            sysPortOptions: sp.sysPortOptions,
          };
        }),
      };
      res.render('asset/systemedit', context);
    });
  });
};

//  /////////////////////////////////////////////////////////////////////////
//  _______ System Ports Report  __________________________________________________
//  ////////////////////////////////////////////////////////////////////////

exports.dcSystemPortPages = (req, res, next) => {
    //logger.info('--------------------exports.dcSystemPortPages First >');
  if (!req.params.data) {
    Models.Systemdb.find({}).sort({ 'modifiedOn': 'desc'}).exec((err, sys) => {
      if (err) {
        //    logger.info(err);
      } else {
        //logger.info('system-list'+sys);
        var context = {
          sys: sys.map((sy) => {
            // rack.populate('rackParentDC', 'abbreviation cageNickname')
            // logger.info('sy Map>'+sy);
            return {
              systemPorts: sy.systemPorts.map((sp) => {
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
};

exports.findEndpoints = (req, res, next) => {
  var context;
  var fEndPoint = req.params.data.toLowerCase();
  if (!fEndPoint) {
    //    logger.warn('findEndpoints: No endpoint found');
    return;
  } else {
    //    logger.info('findEndpoints >'+fEndPoint);

    Models.Systemdb.find({
      'systemPorts.sysPortEndPoint': fEndPoint
    }, 'systemName systemPorts.sysPortName systemPorts.sysPortCablePath systemPorts.sysPortEndPoint systemPorts.sysPortEndPointPre systemPorts.sysPortEndPointPort systemPorts.sysPortVlan systemPorts.sysPortOptions systemPorts.sysPortAddress systemPorts.sysPortType', (err, sys) => {
      if (err) return next(err);
      // logger.info('sys > '+sys);
      context = {
        titleNow: fEndPoint,
        sysPortEndPoint: fEndPoint,
        menu1: 'Show ' + fEndPoint + ' details',
        menuLink1: '/system/' + fEndPoint,
        sys: sys.map((sy) => {
          return {
            systemPorts: sy.systemPorts.map((sysPort) => {
              if (sysPort.sysPortEndPoint === fEndPoint) {
                var isConsole,
                  isEthernet,
                  isInfiniband,
                  isInterconnect,
                  isNetMgmt,
                  isPower,
                  isSAN;
                switch (sysPort.sysPortType) {
                  case 'Console':
                    isConsole = 'isConsole';
                    break;
                  case 'Ethernet':
                    isEthernet = 'isEthernet';
                    break;
                  case 'Infiniband':
                    isInfiniband = 'isInfiniband';
                    break;
                  case 'Interconnect':
                    isInterconnect = 'isInterconnect';
                    break;
                  case 'NetMgmt':
                    isNetMgmt = 'isNetMgmt';
                    break;
                  case 'Power':
                    isPower = 'isPower';
                    break;
                  case 'SAN':
                    isSAN = 'isSAN';
                    break;
                  default:
                    break;
                }
                return {
                  sysPortisConsole: isConsole,
                  sysPortisEthernet: isEthernet,
                  sysPortisInfiniband: isInfiniband,
                  sysPortisInterconnect: isInterconnect,
                  sysPortisNetMgmt: isNetMgmt,
                  sysPortisPower: isPower,
                  sysPortisSAN: isSAN,
                  systemName: sy.systemName,
                  sysPortName: sysPort.sysPortName,
                  sysPortCablePath: sysPort.sysPortCablePath,
                  sysPortEndPoint: sysPort.sysPortEndPoint,
                  sysPortEndPointPre: sysPort.sysPortEndPointPre,
                  sysPortEndPointPortPad: strTgs.pad(sysPort.sysPortEndPointPort),
                  sysPortEndPointPort: sysPort.sysPortEndPointPort,
                  sysPortVlan: sysPort.sysPortVlan,
                  sysPortOptions: sysPort.sysPortOptions,
                  sysPortAddress: sysPort.sysPortAddress,
                  sysPortType: sysPort.sysPortType,
                };
              }
            }),
          };
        }),

      };
      res.render('asset/endpointports-list', context);
    });
  }
};


// ---------------------------------------------------------------------
// -----------------------   New and copy system POST working   --------
// ------------------------------------------------------------------------

exports.dcSystemPost = (req, res) => {
  var varPortsNew;
  var systemdbCrud;
  var bd = req.body;
  var backURL = req.header('Referer') || '/';
  // this makes the abbreviation available for the URL
  res.abbreviation = strTgs.multiTrim(bd.systemName, 9, 2);
  res.equipLocation = bd.equipLocation;
  // logger.info('dcRackPost abbreviation>'+strTgs.clTrim(bd.systemName));
  // logger.info('rUs expanded >'+ strTgs.compUs(req.body.rUs));
  if (!bd.isEdit) {

    // logger.info('new System in DC');
    varPortsNew = (bd) => {
      if (!bd.sysPortName[i] !== '') {
        var Ports = [];
        var bdSysPortNameLen = bd.sysPortName.length;
        for (var i = 0; i < bdSysPortNameLen; i++) {
          // logger.info('sysPortName.length '+bd.sysPortName.length);
          Ports[i] = ({
            sysPortType: strTgs.multiTrim(bd.sysPortType[i], 7, 0),
            sysPortName: strTgs.multiTrim(bd.sysPortName[i], 9, 2),
            sysPortAddress: strTgs.multiTrim(bd.sysPortAddress[i], 7, 0),
            sysPortCablePath: strTgs.multiTrim(bd.sysPortCablePath[i], 4, 2),
            sysPortEndPoint: strTgs.multiTrim(bd.sysPortEndPoint[i], 9, 2),
            sysPortEndPointPre: strTgs.multiTrim(bd.sysPortEndPointPre[i], 9, 2),
            sysPortEndPointPort: strTgs.multiTrim(bd.sysPortEndPointPort[i], 9, 2),
            sysPortVlan: strTgs.multiTrim(bd.sysPortVlan[i], 7, 0),
            sysPortOptions: strTgs.multiTrim(bd.sysPortOptions[i], 4, 2),
            sysPortURL: req.sanitize(bd.sysPortURL[i]),
            // sysPortCrossover: bd.sysPortCrossover[i],
          });
        }
        return Ports;
      }
    };

    Models.Systemdb.create({
      systemPorts: varPortsNew(bd),
      systemName: strTgs.multiTrim(bd.systemName, 9, 2),
      systemEquipSN: strTgs.multiTrim(bd.systemEquipSN, 9, 1),
      systemAlias: strTgs.multiTrim(bd.systemAlias, 9, 2),
      systemEnviron: strTgs.multiTrim(bd.systemEnviron, 9, 2),
      systemRole: strTgs.multiTrim(bd.systemRole, 9, 2),
      systemInventoryStatus: bd.systemInventoryStatus,
      systemTicket: strTgs.multiTrim(bd.systemTicket, 6, 2),
      systemStatus: bd.systemStatus,
      systemOwner: strTgs.multiTrim(bd.systemOwner, 5, 0),
      //    systemImpact: bd.systemImpact,
      systemIsVirtual: bd.systemIsVirtual,
      systemParentId: strTgs.multiTrim(bd.systemParentId, 9, 2),
      systemOSType: strTgs.multiTrim(bd.systemOSType, 5, 0),
      systemOSVersion: strTgs.multiTrim(bd.systemOSVersion, 5, 0),
      systemApplications: strTgs.multiTrim(bd.systemApplications, 5, 0),
      systemSupLic: strTgs.multiTrim(bd.systemSupLic, 5, 0),
      systemSupEndDate: strTgs.dateAddTZ(bd.systemSupEndDate, req.session.ses.timezone),
      systemInstall: strTgs.dateAddTZ(bd.systemInstall, req.session.ses.timezone),
      systemStart: strTgs.dateAddTZ(bd.systemStart, req.session.ses.timezone),
      systemEnd: strTgs.dateAddTZ(bd.systemEnd, req.session.ses.timezone),
      systemNotes: strTgs.multiTrim(bd.systemNotes, 5, 0),
      createdBy: req.user.local.email,
      createdOn: Date.now(),
      modifiedBy: req.user.local.email,
      modifiedOn: Date.now(),
    }, (err) => {
      if (err) {
        logger.warn(err.stack);
        if (err.stack.indexOf('matching') != -1) {
          req.session.flash = {
            type: 'danger',
            intro: 'Duplicate!',
            message: 'Looks like there is already a System by that name.',
          };
        } else {
          req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'There was an error processing your request. \n ' + err.message,
          };
        }
        return res.redirect(303, backURL);
      }
      if (!req.body.wasCopy) {
        req.session.flash = {
          type: 'success',
          intro: 'Saved!',
          message: `<a href="/system/${res.abbreviation}">${res.abbreviation}</a> has been created.`,
        };
        return res.redirect(303, `/system/${res.abbreviation}`);
      } else {
        req.session.flash = {
          type: 'success',
          intro: 'Saved!',
          message: `<a href="/system/${res.abbreviation}">${res.abbreviation}</a> has been created.`,
        };
        return res.redirect(303, `/system/${res.abbreviation}/edit`);
      }
    });
  } else {
    Models.Systemdb.findOne({systemName: req.body.isEdit}, (err, sys) => {
      res.abbreviation = req.body.systemName;

      var thisDoc = sys;
      // logger.info('existing id>'+thisDoc);
      if (err) {
        logger.warn(err);
        res.redirect(`location/datacenter/${res.abbreviation}`);
      } else {
        var bdSysPortTypeLen = bd.sysPortType.length;
        for (var i = 0; i < bdSysPortTypeLen; i++) {
        // logger.info('equip \n Portname >'+bd.sysPortName[i] +' - path >'+ bd.sysPortCablePath[i] +' - endpoint >'+ bd.sysPortEndPoint[i] +' - Opt >'+ bd.sysPortOptions[i]/*+'crossover'+strTgs.doCheckbox(bd.sysPortCrossover[i]  future*/);
          if (!bd.sysPortType[i]) {
          // logger.info('No new port');
          } else if (bd.sysPortId[i] === 'new') {
          // logger.info('new port >'+bd.sysPortId[i]);
            sys.systemPorts.push({
              sysPortType: strTgs.multiTrim(bd.sysPortType[i], 7, 0),
              sysPortName: strTgs.multiTrim(bd.sysPortName[i], 9, 2),
              sysPortAddress: strTgs.multiTrim(bd.sysPortAddress[i], 7, 0),
              sysPortCablePath: strTgs.multiTrim(bd.sysPortCablePath[i], 4, 2),
              sysPortEndPoint: strTgs.multiTrim(bd.sysPortEndPoint[i], 9, 2),
              sysPortEndPointPre: strTgs.multiTrim(bd.sysPortEndPointPre[i], 9, 2),
              sysPortEndPointPort: strTgs.multiTrim(bd.sysPortEndPointPort[i], 9, 2),
              sysPortVlan: strTgs.multiTrim(bd.sysPortVlan[i], 7, 0),
              sysPortOptions: strTgs.multiTrim(bd.sysPortOptions[i], 4, 2),
              sysPortURL: req.sanitize(bd.sysPortURL[i]),
              /*            sysPortCrossover: strTgs.doCheckbox(bd.sysPortCrossover[i]),  future*/
            });
          } else {
            //        logger.info('existing port');
            var thisSubDoc = sys.systemPorts.id(bd.sysPortId[i]);
            thisSubDoc.sysPortType = strTgs.multiTrim(bd.sysPortType[i], 7, 0);
            thisSubDoc.sysPortName = strTgs.multiTrim(bd.sysPortName[i], 9, 2);
            thisSubDoc.sysPortAddress = strTgs.multiTrim(bd.sysPortAddress[i], 7, 0);
            thisSubDoc.sysPortCablePath = strTgs.multiTrim(bd.sysPortCablePath[i], 4, 2);
            thisSubDoc.sysPortEndPoint = strTgs.multiTrim(bd.sysPortEndPoint[i], 9, 2);
            thisSubDoc.sysPortEndPointPre = strTgs.multiTrim(bd.sysPortEndPointPre[i], 9, 2);
            thisSubDoc.sysPortEndPointPort = strTgs.multiTrim(bd.sysPortEndPointPort[i], 9, 2);
            thisSubDoc.sysPortVlan = strTgs.multiTrim(bd.sysPortVlan[i], 7, 0);
            thisSubDoc.sysPortOptions = strTgs.multiTrim(bd.sysPortOptions[i], 4, 2);
            thisSubDoc.sysPortURL = req.sanitize(bd.sysPortURL[i]);
            /*            thisSubDoc.sysPortCrossover= strTgs.doCheckbox(bd.sysPortCrossover[i]);  future*/
          }
        }
        thisDoc.systemName = strTgs.multiTrim(bd.systemName, 9, 2);
        thisDoc.systemEquipSN = strTgs.multiTrim(bd.systemEquipSN, 9, 1);
        thisDoc.systemAlias = strTgs.multiTrim(bd.systemAlias, 9, 1);
        thisDoc.systemEnviron = strTgs.multiTrim(bd.systemEnviron, 9, 2);
        thisDoc.systemRole = strTgs.multiTrim(bd.systemRole, 9, 2);
        thisDoc.systemInventoryStatus = bd.systemInventoryStatus;
        thisDoc.systemTicket = strTgs.multiTrim(bd.systemTicket, 6, 2);
        thisDoc.systemStatus = bd.systemStatus;
        thisDoc.systemOwner = strTgs.multiTrim(bd.systemOwner, 5, 0);
        //    thisDoc.systemImpact= bd.systemImpact;
        thisDoc.systemIsVirtual = bd.systemIsVirtual;
        thisDoc.systemParentId = strTgs.multiTrim(bd.systemParentId, 9, 2);
        thisDoc.systemOSType = strTgs.multiTrim(bd.systemOSType, 5, 0);
        thisDoc.systemOSVersion = strTgs.multiTrim(bd.systemOSVersion, 5, 0);
        thisDoc.systemApplications = strTgs.multiTrim(bd.systemApplications, 5, 0);
        thisDoc.systemSupLic = strTgs.multiTrim(bd.systemSupLic, 5, 0);

        thisDoc.systemSupEndDate = strTgs.dCleanup(thisDoc.systemSupEndDate, bd.systemSupEndDate, req.session.ses.timezone);
        thisDoc.systemInstall = strTgs.dCleanup(thisDoc.systemInstall, bd.systemInstall, req.session.ses.timezone);
        thisDoc.systemStart = strTgs.dCleanup(thisDoc.systemStart, bd.systemStart, req.session.ses.timezone);
        thisDoc.systemEnd = strTgs.dCleanup(thisDoc.systemEnd, bd.systemEnd, req.session.ses.timezone);

        thisDoc.systemNotes = req.sanitize(bd.systemNotes);
        thisDoc.modifiedOn = moment();
        thisDoc.modifiedBy = req.user.local.email;
      }
      sys.save((err) => {
        if (err) {
          console.error(err.stack);
          req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'There was an error processing your request.',
          };
          return res.redirect(303, `/system/${res.abbreviation}`);
        }
        //          this updates EndPoints when the system name changes
        if (thisDoc.systemName !== strTgs.multiTrim(bd.systemName, 9, 2)) {
          Models.Systemdb.find({
            'systemPorts.sysPortEndPoint': thisDoc.systemName
          }, 'systemName systemPorts.sysPortName systemPorts.sysPortEndPoint', (err, sys) => {
            sys.map((sy) => {
              sy.systemPorts.map((sysPort) => {
                if (thisDoc.systemName === sysPort.systemPorts.sysPortEndPoint) {
                  systemdbCrud.systemdbPortsCreate(sysPort, req);
                } else {
                  logger.warn(`EndPoint error ${sysPort.systemPorts.sysPortEndPoint}`);
                }
              });
            });
          });
        }
        req.session.flash = {
          type: 'success',
          intro: 'Thank you!',
          message: 'Your update has been made.',
        };
        return res.redirect(303, `/system/${res.abbreviation}`);
      });
    });
  }
};


/*---------------------------------------------------------------------
---------------------------- System Name Change ----------------------
-----------------------------------------------------------------------
*/

exports.dcSystemNameChange = (req, res) => {
  var context;
  //    logger.info('req.params.datacenter >>>>>> '+req.params.datacenter);
  Models.Systemdb.findOne({
    systemName: req.params.data,
  }, (err, sys) => {
    if (err) {
      logger.info(err.stack);
      return res.redirect(303, '/');
    } else if (!sys) {
      logger.info('dcSystemNameChange = no sys');
      return res.redirect(303, '/');
    } else {
      context = {
        menu1: sys.systemName,
        menuLink1: '#',
        titleNow: sys.systemName,
        systemId: sys._id,
        oldSystemName: sys.systemName,
      };
      res.render('asset/systemnamechange', context);
    }
  });
};

function updateEndPoints(oldSystemName, systemName, callback) {
  var data;
  var sysList;
  logger.info(`updateEndPoints start ${oldSystemName} ${systemName}`);
  Models.Systemdb.findOne({systemName: sysList.systemName[i]}, (err, sys) => {
    if (err) {
      logger.warn(`sysPortEndPoint change, ${sysList.index},${sysList.systemName} ${err}`);
      return (err);
    } else if (!sys) {
      logger.warn(`sysPortCreate Failed lookup,${sysList.index},${sysList.systemName}`);
      return true;
    } else {
      var portArray = [];
      var sysSystemPortsLen = sys.systemPorts.length;
      for (var j = sysSystemPortsLen - 1; j >= 0; j--) {
        logger.info(`sys.systemPorts[${j}] = ${sys.systemPorts[j].sysPortEndPoint}`);
        logger.info(`sys.systemPorts[${j}] = ${sys.systemPorts[j].sysPortEndPoint}`);
        if (sys.systemPorts[j].sysPortEndPoint === oldSystemName) {
          sys.systemPorts[j].sysPortEndPoint = systemName;
        }
      }
      sys.modifiedBy = req.user.local.email;
      sys.modifiedOn = strTgs.compareDates(data.modifiedOn, req.session.ses.timezone);
      sys.save((err) => {
        if (err) {
          logger.warn('sysPortUpdate Failed,' + data.index + ',' + strTgs.multiTrim(data.systemName, 9, 2) + ',' + err);
          return (err);
        } else {
          logger.info('sysPortUpdate Sucessful Update write,' + data.index + ',' + data.systemName + ',' + data.sysPortName);
          return true;
        }
      });
    }
  });
}



function countPortEndPoint(oldSystemName, systemName) {
  logger.log(`oldSystemName: ${oldSystemName} systemName: ${systemName}`);
  Models.Systemdb.find({
    'systemPorts.sysPortEndPoint': oldSystemName
  }, (err, sysList) => {
    if (err) {
      logger.info(err.stack);
      return (err);
    } else if (!sysList) {
      logger.info('model not found');
      return;
    } else {
      logger.info(`Found Ports 0 ${sysList.length}` /*+ sysList*/ );
      return sysList;
    }
  });
}


exports.dcSystemNameChangePost = (req, res) => {
  if (accConfig.accessCheck(req.user).delete !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
    var oldSystemName = strTgs.multiTrim(req.body.oldSystemName, 9, 2);
    var systemName = strTgs.multiTrim(req.body.systemName, 9, 2);
    var numAffected;
    if (oldSystemName) {
      Models.Systemdb.findOne({
        systemName: oldSystemName
      }, (err, sysNametoChange) => {
        if (err) {
          logger.info(err.stack);
          callback(null);
        } else {
          sysNametoChange.systemName = systemName;
          sysNametoChange.save((err) => {
            if (err) {
              logger.log('validation error');
              logger.error(err.stack);
              req.session.flash = {
                type: 'danger',
                intro: 'Ooops!',
                message: 'There was an error processing your request.',
              };
              return res.redirect(303, `/system/${oldSystemName}/edit`);
            } else {
              var sysCount = 1;
              async.whilst(() => {
                return sysCount > 0;
              }, (wcallback) => {
                Models.Systemdb.find({'systemPorts.sysPortEndPoint': oldSystemName}, (err, sys) => {
                  if (err) {
                    logger.error(err.stack);
                    return wcallback(err);
                  } else if (!sys) {
                    sysCount = 0;
                    return wcallback(null);
                  } else {
                    // logger.info('Found Ports '+sys.length);
                    sysCount = sys.length;
                  }
                  Models.Systemdb.update({'systemPorts.sysPortEndPoint': oldSystemName}, {
                      'systemPorts.$.sysPortEndPoint': systemName
                  }, {multi: true}, (err, numAffected) => { if (err) {
                    logger.log('validation error');
                    logger.error(err.stack);
                    req.session.flash = {
                      type: 'danger',
                      intro: 'Ooops!',
                      message: 'There was an error updating EndPoints.',
                    };
                    return res.redirect(303, `/system/${oldSystemName}/edit`);
                  }
                  // logger.info(numAffected+ ' sysPortEndPoint Updated');
                    wcallback(null, numAffected);
                  });
                });
              });
              logger.info(`${oldSystemName} System Name Updated to ${systemName}`);
              req.session.flash = {
                type: 'success',
                intro: 'Thank you!',
                message: `${oldSystemName} system name changed to ${systemName} and related EndPoints updated.`,
              };
              return res.redirect(303, `/system/${systemName}/edit`);
            }
          });
        }
      });
    }
  }
};


/*---------------------------------------------------------------------
---------------------------- System Delete ------------------------------
------------------------------------------------------------------------
*/
exports.dcsystemDelete = (req, res) => {
  res.abbreviation = req.body.systemName;
  res.newpage = req.body.equipLocationRack;
  if (req.body.systemName) {
    //    logger.info('delete got this far');
    Models.Systemdb.findOne({
      systemName: req.body.systemName
    }, (err, systemNametodelete) => {
      if (err) {
        logger.warn(err);
        //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
      } else {
        systemNametodelete.remove((err) => {
          if (err) {
            logger.warn(err);
            req.session.flash = {
              type: 'danger',
              intro: 'Ooops!',
              message: `Something went wrong, ${req.body.systemNametodelete} was not deleted.`,
            };
            return res.redirect(303, `/location/equipment/ ${res.abbreviation}`);
          } else {
            req.session.flash = {
              type: 'success',
              intro: 'Done!',
              message: `System ${res.abbreviation} has been deleted.`,
            };
            return (res.newpage === '') ? res.redirect(303, '/') : res.redirect(303, `/equipment-systems/${res.newpage}`);
          }
        });
      }
    });
  }
};

/* ---------------------------------------------------------------------
-------------------    systemPorts Delete   --------------------------------
------------------------------------------------------------------------
*/

exports.dcsystemSubDelete = (req, res) => {
  logger.info('portSubDelete');
  res.abbreviation = req.body.abbreviation;
  if (req.body.id && req.body.subId) {
    Models.Systemdb.findById(req.body.id, req.body.subDoc, (err, sys) => {
      if (err) {
        logger.warn(`dcsystemSubDelete ${err}`);
      // return res.redirect(303 '/location/datacenter/'+res.abbreviation);
      } else {
        sys.systemPorts.id(req.body.subId).remove();
        sys.save((err) => {
          if (err) {
            logger.warn(`dcsystemSubDelete2 ${err}`);
            req.session.flash = {
              type: 'danger',
              intro: 'Ooops!',
              message: 'Something went wrong',
            };
            return res.redirect(303, `/system/${res.abbreviation}/edit`);
          }
          req.session.flash = {
            type: 'success',
            intro: 'Done!',
            message: 'The port has been deleted.',
          };
          return res.redirect(303, `/system/${res.abbreviation}/edit`);
        });
      }
    });
  }
};
