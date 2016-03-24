const logConfig = require('../config/log.js');
const Systemdb = require('../models/system.js');
const strTgs = require('../lib/stringThings.js');
const logger = require('../lib/logger.js');
const dates = require('../lib/dates.js');
const winston = require('winston');

/* var logger = new (winston.Logger)({
  transports: [
    new winston.transports.DailyRotateFile({filename: logConfig.logDir+logConfig.fileName.uploadLog, json: false}),
    ],
  exitOnError: true
});
*/

module.exports.systemdbCreate = (data, req, next) => {
  Systemdb.findOne({ systemName: strTgs.csTrim(data.systemName) }, (err, sys) => {
  // checking for existing system
    if (!sys) {
      Systemdb.create({
        systemName: strTgs.csTrim(data.systemName),
        systemEquipSN: strTgs.cTrim(data.systemEquipSN),
        systemAlias: strTgs.clTrim(data.systemAlias),
        systemEnviron: strTgs.clTrim(data.systemEnviron),
        systemRole: strTgs.uTrim(data.systemRole),
        systemInventoryStatus: data.systemInventoryStatus,
        systemTicket: strTgs.clTrim(data.systemTicket),
        systemStatus: data.systemStatus,
        systemOwner: strTgs.uTrim(data.systemOwner),
        systemImpact: data.systemImpact,
        systemIsVirtual: data.systemIsVirtual,
        systemParentId: strTgs.csTrim(data.systemParentId),
        systemOSType: strTgs.uTrim(data.systemOSType),
        systemOSVersion: strTgs.uTrim(data.systemOSVersion),
        systemApplications: strTgs.uTrim(data.systemApplications),
        systemSupLic: strTgs.uTrim(data.systemSupLic),
        systemSupEndDate: strTgs.convertDates(data.systemSupEndDate, req.session.ses.timezone),
        systemInstall: strTgs.convertDates(data.systemInstall, req.session.ses.timezone),
        systemStart: strTgs.convertDates(data.systemStart, req.session.ses.timezone),
        systemEnd: strTgs.convertDates(data.systemEnd, req.session.ses.timezone),
        systemNotes: strTgs.uTrim(data.systemNotes),
        createdBy: req.user.local.email,
        createdOn: Date.now(),
        modifiedBy: req.user.local.email,
        modifiedOn: strTgs.compareDates(data.modifiedOn, req.session.ses.timezone),
      }, (err) => {
        if (err) {
          logger.info(`sysCreate Failed, ${data.index},${data.systemName}`);
        }
        logger.info(`sysCreate Sucessful,${data.index},${data.systemName}`);
        return req.done;
      });
    } else {
      var thisDoc = sys;
      if (data.overwite === 'no') {
        logger.warn(`sysCreate CSV date overwite=no,${data.index},${data.systemName}`);
      } else if (!data.modifiedOn && !data.overwrite) {
        logger.warn(`sysCreate CSV no modifiedOn or overwite,${data.index},${data.systemName}`);
      } else if (data.overwrite === 'yes' || dates.compare(data.modifiedOn, thisDoc.modifiedOn) === 1) {
        if (data.systemEquipSN) {
          thisDoc.systemEquipSN = strTgs.cTrim(data.systemEquipSN);
        }
        if (data.systemAlias) {
          thisDoc.systemAlias = strTgs.clTrim(data.systemAlias);
        }
        if (data.systemEnviron) {
          thisDoc.systemEnviron = strTgs.sTrim(data.systemEnviron);
        }
        if (data.systemRole) {
          thisDoc.systemRole = strTgs.uTrim(data.systemRole);
        }
        if (data.systemInventoryStatus) {
          thisDoc.systemInventoryStatus = data.systemInventoryStatus;
        }
        if (data.systemTicket) {
          thisDoc.systemTicket = strTgs.sTrim(data.systemTicket);
        }
        if (data.systemStatus) {
          thisDoc.systemStatus = data.systemStatus;
        }
        if (data.systemOwner) {
          thisDoc.systemOwner = strTgs.uTrim(data.systemOwner);
        }
        if (data.systemImpact) {
          thisDoc.systemImpact = data.systemImpact;
        }
        if (data.systemIsVirtual) {
          thisDoc.systemIsVirtual = data.systemIsVirtual;
        }
        if (data.systemParentId) {
          thisDoc.systemParentId = strTgs.sTrim(data.systemParentId);
        }
        if (data.systemOSType) {
          thisDoc.systemOSType = strTgs.uTrim(data.systemOSType);
        }
        if (data.systemOSVersion) {
          thisDoc.systemOSVersion = strTgs.uTrim(data.systemOSVersion);
        }
        if (data.systemApplications) {
          thisDoc.systemApplications = strTgs.uTrim(data.systemApplications);
        }
        if (data.systemSupLic) {
          thisDoc.systemSupLic = strTgs.uTrim(data.systemSupLic);
        }
        if (data.systemSupEndDate) {
          thisDoc.systemSupEndDate = strTgs.convertDates(data.systemSupEndDate, req.session.ses.timezone);
        }
        if (data.systemInstall) {
          thisDoc.systemInstall = strTgs.convertDates(data.systemInstall, req.session.ses.timezone);
        }
        if (data.systemStart) {
          thisDoc.systemStart = strTgs.convertDates(data.systemStart, req.session.ses.timezone);
        }
        if (data.systemEnd) {
          thisDoc.systemEnd = strTgs.convertDates(data.systemEnd, req.session.ses.timezone);
        }
        if (data.systemNotes) {
          thisDoc.systemNotes = strTgs.noteAdd(thisDoc.systemNotes, data.systemNotes);
        }
        thisDoc.modifiedOn = strTgs.convertDates(data.modifiedOn, req.session.ses.timezone);
        thisDoc.modifiedBy = req.user.local.email;

        sys.save((err) => {
          if (err) {
            logger.warn(err);
            logger.warn(`sysUpdate Failed Unknown,${data.index},${strTgs.csTrim(data.systemName)}`);
          } else {
            logger.info(`sysUpdate Sucessful write,${data.index},${data.systemName}`);
            return req.done;
          }
        });
      } else {
        logger.warn(`sysUpdate Failed CSV modifiedOn older than existing,${data.index},${strTgs.csTrim(data.systemName)}`);
      }
    }
  });
};

module.exports.systemdbPortsCreate = (data, req) => {
  data.forEach((sysData) => {
    var portArray = [];
// Lookup system
    Systemdb.findOne({ systemName: strTgs.multiTrim(sysData.systemName, 9, 2) }, (err, sys) => {
      if (err) {
        logger.warn(`sysPortCreate, ${sysData.systemName} ERR: ${err}`);
      } else if (!sys) {
        logger.warn(`sysPortCreate Failed lookup, ${strTgs.multiTrim(sysData.systemName, 9, 2)}`);
      } else {
        for (var i = 0; i < sys.systemPorts.length; i++) {
          portArray[i] = sys.systemPorts[i].sysPortName;
        }
        // logger.info(`portArray ${portArray}`);
        sysData.systemPorts.forEach((sDataSysPort) => {
          var thisSubDoc;
          if (!sDataSysPort.sysPortType) {
            logger.info(`sysPortUpdate,${sysData.systemName} No Port Found Issue`);
          } else if (portArray.indexOf(sDataSysPort.sysPortName) === -1) {
            sys.systemPorts.push({
              sysPortType: strTgs.multiTrim(sDataSysPort.sysPortType, 7, 0),
              sysPortName: strTgs.multiTrim(sDataSysPort.sysPortName, 9, 2),
              sysPortAddress: strTgs.multiTrim(sDataSysPort.sysPortAddress, 7, 0),
              sysPortCablePath: strTgs.multiTrim(sDataSysPort.sysPortCablePath, 4, 2),
              sysPortEndPoint: strTgs.multiTrim(sDataSysPort.sysPortEndPoint, 9, 2),
              sysPortEndPointPre: strTgs.multiTrim(sDataSysPort.sysPortEndPointPre, 9, 2),
              sysPortEndPointPort: strTgs.multiTrim(sDataSysPort.sysPortEndPointPort, 9, 2),
              sysPortVlan: strTgs.multiTrim(sDataSysPort.sysPortVlan, 7, 0),
              sysPortOptions: strTgs.multiTrim(sDataSysPort.sysPortOptions, 4, 2),
              sysPortURL: req.sanitize(sDataSysPort.sysPortURL),
              modifiedOn: sDataSysPort.modifiedOn,
              /*            sysPortCrossover: strTgs.doCheckbox(bd.sysPortCrossover[i]),  future*/
            });
          } else {
            thisSubDoc = sys.systemPorts[portArray.indexOf(sDataSysPort.sysPortName)];
            if (sDataSysPort.overwite === 'no') {
              logger.warn(`sysPortUpdate CSV date overwite=no,${data.index},${data.systemName}`);
            } else if (!sDataSysPort.modifiedOn && !sDataSysPort.overwrite) {
              logger.warn(`sysPortUpdate CSV no modifiedOn or overwite,${data.index},${data.systemName}`);
            } else if (sDataSysPort.overwrite === 'yes' || dates.compare(sDataSysPort.modifiedOn, thisSubDoc.modifiedOn) === 1) {
              if (sDataSysPort.sysPortType) {
                thisSubDoc.sysPortType = strTgs.multiTrim(sDataSysPort.sysPortType, 7, 0);
              }
              if (sDataSysPort.sysPortName) {
                thisSubDoc.sysPortName = strTgs.multiTrim(sDataSysPort.sysPortName, 9, 2);
              }
              if (sDataSysPort.sysPortAddress) {
                thisSubDoc.sysPortAddress = strTgs.multiTrim(sDataSysPort.sysPortAddress, 7, 0);
              }
              if (sDataSysPort.sysPortCablePath) {
                thisSubDoc.sysPortCablePath = strTgs.multiTrim(sDataSysPort.sysPortCablePath, 4, 2);
              }
              if (sDataSysPort.sysPortEndPoint) {
                thisSubDoc.sysPortEndPoint = strTgs.multiTrim(sDataSysPort.sysPortEndPoint, 9, 2);
              }
              if (sDataSysPort.sysPortEndPointPre) {
                thisSubDoc.sysPortEndPointPre = strTgs.multiTrim(sDataSysPort.sysPortEndPointPre, 9, 2);
              }
              if (sDataSysPort.sysPortEndPointPort) {
                thisSubDoc.sysPortEndPointPort = strTgs.multiTrim(sDataSysPort.sysPortEndPointPort, 9, 2);
              }
              if (sDataSysPort.sysPortVlan) {
                thisSubDoc.sysPortVlan = strTgs.multiTrim(sDataSysPort.sysPortVlan, 7, 0);
              }
              if (sDataSysPort.sysPortOptions) {
                thisSubDoc.sysPortOptions = strTgs.multiTrim(sDataSysPort.sysPortOptions, 4, 2);
              }
              if (sDataSysPort.sysPortURL) {
                thisSubDoc.sysPortURL = req.sanitize(sDataSysPort.sysPortURL);
              }
              if (sDataSysPort.modifiedOn) {
                thisSubDoc.modifiedOn = sDataSysPort.modifiedOn;
              }
              /*            thisSubDoc.sysPortCrossover= strTgs.doCheckbox(bd.sysPortCrossover[i]);  future*/
            }
          //  }
          }
        });
        sys.save((err) => {
          if (err) {
            logger.warn(`sysPortUpdate Failed,${strTgs.multiTrim(sysData.systemName, 9, 0)},${err}`);
          } else {
            logger.info(`sysPortUpdate Sucessful Update write, ${sysData.systemName}`);
            return req.done;
          }
      // } else {
          logger.warn(`SysPortUpdate CSV modifiedOn date older, ${data.index} ,${data.systemName}`);
        });
        // return res.redirect(303, '/admin/filemanager');
      }
    });
  });
};
