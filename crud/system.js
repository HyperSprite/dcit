var Systemdb = require('../models/system.js'),
    strTgs = require('../lib/stringThings.js'),
    logger = require("winston");

exports.systemdbCreate = function (data,req) {
    Systemdb.findOne({systemName: strTgs.clTrim(data.systemName)},function(err,sys){
        // checking for existing system
        if(!sys){

Systemdb.create({
                    systemName: strTgs.clTrim(data.systemName),
                    systemEquipSN: strTgs.cTrim(data.systemEquipSN),
                    systemEnviron: strTgs.clTrim(data.systemEnviron),
                    systemRole: strTgs.clTrim(data.systemRole),
                    systemInventoryStatus: data.systemInventoryStatus,
                    systemTicket: strTgs.sTrim(data.systemTicket),
                    systemStatus: data.systemStatus,
                    systemOwner: strTgs.uTrim(data.systemOwner),
                    systemImpact: data.systemImpact,
                    systemIsVirtual: data.systemIsVirtual,
                    systemParentId: strTgs.clTrim(data.systemParentId),
                    systemOSType: strTgs.uTrim(data.systemOSType),
                    systemOSVersion: strTgs.uTrim(data.systemOSVersion),
                    systemApplications: strTgs.uTrim(data.systemApplications),
                    systemSupLic: strTgs.uTrim(data.systemSupLic),
                    systemSupEndDate: data.systemSupEndDate,
                    systemInstall: data.systemInstall,
                    systemStart: data.systemStart,
                    systemEnd: data.systemEnd,
                    systemNotes: strTgs.uTrim(data.systemNotes),
                    createdBy:'Admin',
                    createdOn: Date.now(),
                    modifiedBy: data.modifiedBy,
                    modifiedOn: strTgs.compareDates(data.modifiedOn),
    },function(err){
        if(err) {
            logger.info("systemdbCreate Failed write :"+data.index+" : "+data.systemName);
            return (err.stack);
        }else{
            logger.info("systemdbCreate Sucessful write :"+data.index+" : "+data.systemName);
            return ("done");
        }
    });
    }else{
        logger.info("systemdbCreate Failed - Duplicate :"+data.index+" systemName "+strTgs.clTrim(data.systemName)+" found");
    }
    });
};

exports.systemdbPortsCreate = function (data,req) {
// Lookup system
Systemdb.findOne({systemName: strTgs.clTrim(data.systemName)},function(err,sys){
        if(!sys){
        logger.info("systemdbPortsCreate Failed lookup :"+data.index+" systemName not found");
        }else{
        
            sys.systemPorts.push({
                sysPortType: strTgs.sTrim(data.sysPortType),
                sysPortName: strTgs.sTrim(data.sysPortName),
                sysPortAddress: strTgs.sTrim(data.sysPortAddress),
                sysPortCablePath: strTgs.stTrim(data.sysPortCablePath),
                sysPortEndPoint: strTgs.clTrim(data.sysPortEndPoint),
                sysPortEndPointPre: strTgs.clTrim(data.sysPortEndPointPre),
                sysPortEndPointPort: strTgs.clTrim(data.sysPortEndPointPort),
                sysPortVlan: strTgs.sTrim(data.sysPortVlan),
                sysPortOptions: strTgs.stcTrim(data.sysPortOptions),
                sysPortURL: strTgs.clTrim(data.sysPortURL),
            });
            sys.save(function(err){
	        if(err) {
                logger.info(err+data.index);
                logger.info("systemdbPortsCreate Failed write :"+data.index+" : "+data.systemName);
                return (err.stack);
            }else{
                logger.info("systemdbPortsCreate Sucessful write :"+data.index+" : "+data.systemName);
                return ("done");
            }
    });
    }
    });
};