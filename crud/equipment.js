const Equipment = require('../models/equipment.js');
const strTgs = require('../lib/stringThings.js');
const logger = require('../lib/logger.js');
const dates = require('../lib/dates.js');

exports.equipmentCreate = function (data, req) {
  Equipment.findOne({ equipSN: strTgs.cTrim(data.equipSN) }, (err, eq, next) => {
    if (err) next(err);
    if (!eq) {
      Equipment.create({
        equipLocation: strTgs.locComb(data.equipLocationRack, data.equipLocationRu),
        equipSN: strTgs.cTrim(data.equipSN),
        equipAssetTag: strTgs.sTrim(data.equipAssetTag),
        equipTicketNumber: strTgs.cTrim(data.equipTicketNumber),
        equipInventoryStatus: strTgs.uTrim(data.equipInventoryStatus),
        equipStatus: strTgs.uTrim(data.equipStatus),
        equipIsVirtual: data.equipIsVirtual,
        equipEOL: data.equipEOL,
        equipLOB: strTgs.multiTrim(data.equipLOB, 5, 0),
        equipType: strTgs.uTrim(data.equipType),
        equipMake: strTgs.uTrim(data.equipMake),
        equipModel: strTgs.uTrim(data.equipModel),
        equipSubModel: strTgs.uTrim(data.equipSubModel),
        equipRUHieght: strTgs.uTrim(data.equipRUHieght),
        equipImgFront: strTgs.uTrim(data.equipImgFront),
        equipImgRear: strTgs.uTrim(data.equipImgRear),
        equipImgInternal: strTgs.uTrim(data.equipImgInternal),
        equipFirmware: strTgs.uTrim(data.equipFirmware),
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
        equipReceived: strTgs.convertDates(data.equipReceived),
        equipAcquisition: strTgs.convertDates(data.equipAcquisition),
        equipInService: strTgs.convertDates(data.equipInService),
        equipEndOfLife: strTgs.convertDates(data.equipEndOfLife),
        equipWarrantyMo: strTgs.uTrim(data.equipWarrantyMo),
        equipPONum: strTgs.uTrim(data.equipPONum),
        equipInvoice: strTgs.uTrim(data.equipInvoice),
        equipProjectNum: strTgs.uTrim(data.equipProjectNum),
        equipLicense: strTgs.uTrim(data.equipLicense),
        equipMaintAgree: strTgs.uTrim(data.equipMaintAgree),
        equipPurchaseType: strTgs.uTrim(data.equipPurchaseType),
        equipPurchaser: strTgs.uTrim(data.equipPurchaser),
        equipPurchaseTerms: strTgs.uTrim(data.equipPurchaseTerms),
        equipPurchaseEnd: strTgs.convertDates(data.equipPurchaseEnd),
        equipNotes: strTgs.uTrim(data.equipNotes),
        createdBy: req.user.local.email,
        createdOn: strTgs.compareDates(data.modifiedOn),
        modifiedBy: req.user.local.email,
        modifiedOn: strTgs.compareDates(data.modifiedOn),
      }, (err) => {
        if (err) {
          logger.warn(`csvUpload, eqCreate Failed, ${data.index}, ${data.equipSN}`);
          return (err.stack);
        }
        logger.info(`csvUpload, eqCreate Sucess, ${data.index}, ${data.equipSN}`);
        return ('done');
      });
    } else {
      var thisDoc = eq;
      if (data.overwite === 'no') {
        logger.warn(`csvUpload, eqUpdate Failed no CSV date overwite=no, ${data.index}, ${data.equipSN}`);
      } else if (!data.modifiedOn && !data.overwrite) {
        logger.warn(`csvUpload, eqUpdate Failed CSV no modifiedOn or overwite, ${data.index}, ${data.equipSN}`);
      } else if (data.overwrite === 'yes' || dates.compare(data.modifiedOn, thisDoc.modifiedOn) === 1) {
        if (data.equipLocationRack && data.equipLocationRu) {
          thisDoc.equipLocation = strTgs.locComb(data.equipLocationRack, data.equipLocationRu);
        }
        if (data.equipAssetTag) {
          thisDoc.equipAssetTag = strTgs.uTrim(data.equipAssetTag);
        }
        if (data.equipTicketNumber) {
          thisDoc.equipTicketNumber = strTgs.uTrim(data.equipTicketNumber);
        }
        if (data.equipInventoryStatus) {
          thisDoc.equipInventoryStatus = strTgs.uTrim(data.equipInventoryStatus);
        }
        if (data.equipStatus) {
          thisDoc.equipStatus = strTgs.uTrim(data.equipStatus);
        }
        if (data.equipIsVirtual) {
          thisDoc.equipIsVirtual = strTgs.uTrim(data.equipIsVirtual);
        }
        if (data.equipEOL) {
          thisDoc.equipEOL = data.equipEOL;
        }
        if (data.equipLOB) {
          thisDoc.equipLOB = strTgs.multiTrim(data.equipLOB, 5, 0);
        }
        if (data.equipType) {
          thisDoc.equipType = strTgs.uTrim(data.equipType);
        }
        if (data.equipMake) {
          thisDoc.equipMake = strTgs.uTrim(data.equipMake);
        }
        if (data.equipModel) {
          thisDoc.equipModel = strTgs.uTrim(data.equipModel);
        }
        if (data.equipSubModel) {
          thisDoc.equipSubModel = strTgs.uTrim(data.equipSubModel);
        }
        if (data.equipRUHieght) {
          thisDoc.equipRUHieght = strTgs.uTrim(data.equipRUHieght);
        }
        if (data.equipImgFront) {
          thisDoc.equipImgFront = strTgs.uTrim(data.equipImgFront);
        }
        if (data.equipImgRear) {
          thisDoc.equipImgRear = strTgs.uTrim(data.equipImgRear);
        }
        if (data.equipImgInternal) {
          thisDoc.equipImgInternal = strTgs.uTrim(data.equipImgInternal);
        }
        if (data.equipFirmware) {
          thisDoc.equipFirmware = strTgs.uTrim(data.equipFirmware);
        }
        if (data.equipMobo) {
          thisDoc.equipMobo = strTgs.uTrim(data.equipMobo);
        }
        if (data.equipCPUCount) {
          thisDoc.equipCPUCount = strTgs.uTrim(data.equipCPUCount);
        }
        if (data.equipCPUCores) {
          thisDoc.equipCPUCores = strTgs.uTrim(data.equipCPUCores);
        }
        if (data.equipCPUType) {
          thisDoc.equipCPUType = strTgs.uTrim(data.equipCPUType);
        }
        if (data.equipMemType) {
          thisDoc.equipMemType = strTgs.uTrim(data.equipMemType);
        }
        if (data.equipMemTotal) {
          thisDoc.equipMemTotal = strTgs.uTrim(data.equipMemTotal);
        }
        if (data.equipRaidType) {
          thisDoc.equipRaidType = strTgs.uTrim(data.equipRaidType);
        }
        if (data.equipRaidLayout) {
          thisDoc.equipRaidLayout = strTgs.uTrim(data.equipRaidLayout);
        }
        if (data.equipHDDCount) {
          thisDoc.equipHDDCount = strTgs.uTrim(data.equipHDDCount);
        }
        if (data.equipHDDType) {
          thisDoc.equipHDDType = strTgs.uTrim(data.equipHDDType);
        }
        if (data.equipPSUCount) {
          thisDoc.equipPSUCount = strTgs.uTrim(data.equipPSUCount);
        }
        if (data.equipPSUDraw) {
          thisDoc.equipPSUDraw = strTgs.uTrim(data.equipPSUDraw);
        }
        if (data.equipAddOns) {
          thisDoc.equipAddOns = strTgs.uTrim(data.equipAddOns);
        }
        if (data.equipReceived) {
          thisDoc.equipReceived = strTgs.convertDates(data.equipReceived, req.session.ses.timezone);
        }
        if (data.equipAcquisition) {
          thisDoc.equipAcquisition = strTgs.convertDates(data.equipAcquisition, req.session.ses.timezone);
        }
        if (data.equipInService) {
          thisDoc.equipInService = strTgs.convertDates(data.equipInService, req.session.ses.timezone);
        }
        if (data.equipEndOfLife) {
          thisDoc.equipEndOfLife = strTgs.convertDates(data.equipEndOfLife, req.session.ses.timezone);
        }
        if (data.equipWarrantyMo) {
          thisDoc.equipWarrantyMo = strTgs.convertDates(data.equipWarrantyMo, req.session.ses.timezone);
        }
        if (data.equipPONum) {
          thisDoc.equipPONum = strTgs.uTrim(data.equipPONum);
        }
        if (data.equipInvoice) {
          thisDoc.equipInvoice = strTgs.uTrim(data.equipInvoice);
        }
        if (data.equipProjectNum) {
          thisDoc.equipProjectNum = strTgs.uTrim(data.equipProjectNum);
        }
        if (data.equipLicense) {
          thisDoc.equipLicense = strTgs.uTrim(data.equipLicense);
        }
        if (data.equipMaintAgree) {
          thisDoc.equipMaintAgree = strTgs.uTrim(data.equipMaintAgree);
        }
        if (data.equipPurchaseType) {
          thisDoc.equipPurchaseType = strTgs.uTrim(data.equipPurchaseType);
        }
        if (data.equipPurchaser) {
          thisDoc.equipPurchaser = strTgs.uTrim(data.equipPurchaser);
        }
        if (data.equipPurchaseTerms) {
          thisDoc.equipPurchaseTerms = strTgs.uTrim(data.equipPurchaseTerms);
        }
        if (data.equipPurchaseEnd) {
          thisDoc.equipPurchaseEnd = strTgs.convertDates(data.equipPurchaseEnd, req.session.ses.timezone);
        }
        if (data.equipNotes) {
          thisDoc.equipNotes = strTgs.noteAdd(thisDoc.equipNotes, data.equipNotes);
        }
        thisDoc.modifiedOn = strTgs.compareDates(data.modifiedOn, req.session.ses.timezone);
        thisDoc.modifiedBy = req.user.local.email;

        eq.save((err) => {
          if (err) {
            logger.warn(`csvUpload, ${err}`);
            logger.warn(`csvUpload, eqUpdate Failed - Unknown,${data.index}, ${strTgs.cTrim(data.equipSN)}`);
          } else {
            logger.info(`csvUpload, eqUpdate Sucess, ${data.index}, ${data.equipSN}`);
            return ('done');
          }
        });
      } else {
        logger.warn(`csvUpload, eqUpdate Failed modifiedOn older than existing, ${data.index}, ${strTgs.cTrim(data.equipSN)}`);
      }
    }
  });
};

exports.equipmentPortCreate = function (data, req) {
  data.forEach((portData) => {
    var portArray = [];
    Equipment.findOne({ equipSN: strTgs.multiTrim(portData.equipSN, 9, 1) }, (err, eq) => {
      if (err) {
        logger.warn(`csvUpload, eqPortCreate Err,${portData.equipSN + err}`);
      } else if (!eq) {
        logger.warn(`csvUpload, eqPortCreate Failed lookup,${portData.index}, ${portData.equipSN.toUpperCase()}`);
      } else {
        for (var i = 0; i < eq.equipPorts.length; i++) {
          portArray[i] = eq.equipPorts[i].equipPortName;
        }
        portData.equipPorts.forEach((sPortData) => {
          var thisSubDoc;
          if (!sPortData.equipPortType) {
            logger.warn(`csvUpload, eqPortCreate Failed: No Port Found Issue`);
          } else if (portArray.indexOf(sPortData.equipPortName) === -1) {
            eq.equipPorts.push({
              equipPortType: strTgs.multiTrim(sPortData.equipPortType, 7, 0),
              equipPortsAddr: strTgs.multiTrim(sPortData.equipPortsAddr, 10, 0),
              equipPortName: strTgs.multiTrim(sPortData.equipPortName, 9, 2),
              equipPortsOpt: strTgs.multiTrim(sPortData.equipPortsOpt, 4, 2),
              modifiedBy: req.user.local.email,
              modifiedOn: strTgs.compareDates(sPortData.modifiedOn, req.session.ses.timezone),
            });
          } else {
            thisSubDoc = eq.equipPorts[portArray.indexOf(sPortData.equipPortName)];
            if (sPortData.overwite === 'no') {
              logger.warn(`eqPortUpdate CSV date overwite=no,${sPortData.index},${sPortData.systemName}`);
            } else if (!sPortData.modifiedOn && !sPortData.overwrite) {
              logger.warn(`eqPortUpdate CSV no modifiedOn or overwite,${sPortData.index},${sPortData.systemName}`);
            } else if (sPortData.overwrite === 'yes' || dates.compare(sPortData.modifiedOn, thisSubDoc.modifiedOn) === 1) {
              if (sPortData.equipPortType) {
                thisSubDoc.equipPortType = strTgs.multiTrim(sPortData.equipPortType, 7, 0);
              }
              if (sPortData.equipPortName) {
                thisSubDoc.equipPortName = strTgs.multiTrim(sPortData.equipPortName, 9, 2);
              }
              if (sPortData.equipPortsAddr) {
                thisSubDoc.equipPortsAddr = strTgs.multiTrim(sPortData.equipPortsAddr, 10, 0);
              }
              if (sPortData.equipPortsOpt) {
                thisSubDoc.equipPortsOpt = strTgs.multiTrim(sPortData.equipPortsOpt, 4, 2);
              }
              thisSubDoc.modifiedBy = req.user.local.email;
              thisSubDoc.modifiedOn = strTgs.compareDates(sPortData.modifiedOn, req.session.ses.timezone);
            }
          }
        });
        eq.save((err) => {
          if (err) {
            logger.warn(`csvUpload, eqPortUpdate Failed, ${err}, ${strTgs.multiTrim(portData.equipSN, 9, 1)}`);
          } else {
            logger.info(`csvUpload, eqPortUpdate Sucessful write, ${strTgs.multiTrim(portData.equipSN, 9, 1)}`);
            return ('done');
          }
          logger.warn(`csvUpload, eqPortUpdate Failed CSV modifiedOn date older, ${strTgs.multiTrim(portData.equipSN, 9, 1)}`);
        });
      }
    });
  });
};

        //   }
        // })
        // var portPosition = portArray.indexOf(data.equipPortName);
        // // logger.info('csvUpload','portPosition >'+portPosition);
        // if (portPosition === -1) {
        //   eq.equipPorts.push({

        //   eq.save((err) => {
        //     if (err) {
        //       logger.warn(`csvUpload ${err}`);
        //       logger.warn(`csvUpload, eqPortCreate Failed, ${data.index}, ${data.equipSN}`);
        //       return next(err);
        //     }
        //     logger.info(`csvUpload, eqPortCreate Sucessful, ${data.index}, $data.equipSN}, ${data.equipPortName}`);
        //     return ('done');
        //   });
