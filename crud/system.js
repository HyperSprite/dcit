var   logger = require('../lib/logger.js'),
    Systemdb = require('../models/system.js'),
      strTgs = require('../lib/stringThings.js'),
       dates = require('../lib/dates.js');
    

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
                    systemSupEndDate: dates.convert(data.systemSupEndDate),
                    systemInstall: dates.convert(data.systemInstall),
                    systemStart: dates.convert(data.systemStart),
                    systemEnd: dates.convert(data.systemEnd),
                    systemNotes: strTgs.uTrim(data.systemNotes),
                    createdBy:'Admin',
                    createdOn: Date.now(),
                    modifiedBy: data.modifiedBy,
                    modifiedOn: strTgs.compareDates(data.modifiedOn),
    },function(err){
        if(err) {
            logger.info('systemdbCreate Failed write :'+data.index+' : '+data.systemName);
            return (err.stack);
        }else{
            logger.info('systemdbCreate Sucessful write :'+data.index+' : '+data.systemName);
            return ('done');
        }
    });
    }else{
        var thisDoc = sys;
        if(!data.modifiedOn){
            logger.warn('CSV missing modifiedOn date or ignore command for existing system.');
        } else if (data.overwrite==='yes' || dates.compare(data.modifiedOn,thisDoc.modifiedOn)===1){
               
            thisDoc.systemEquipSN= strTgs.sTrim(data.systemEquipSN);
            thisDoc.systemEnviron= strTgs.sTrim(data.systemEnviron);
            thisDoc.systemRole= strTgs.uTrim(data.systemRole);
            thisDoc.systemInventoryStatus= data.systemInventoryStatus;
            thisDoc.systemTicket= strTgs.sTrim(data.systemTicket);
            thisDoc.systemStatus= data.systemStatus;
            thisDoc.systemOwner= strTgs.uTrim(data.systemOwner);
            thisDoc.systemImpact= data.systemImpact;
            thisDoc.systemIsVirtual= data.systemIsVirtual;
            thisDoc.systemParentId= strTgs.sTrim(data.systemParentId);
            thisDoc.systemOSType= strTgs.uTrim(data.systemOSType);
            thisDoc.systemOSVersion= strTgs.uTrim(data.systemOSVersion);
            thisDoc.systemApplications= strTgs.uTrim(data.systemApplications);
            thisDoc.systemSupLic= strTgs.uTrim(data.systemSupLic);
            thisDoc.systemSupEndDate= dates.convert(data.systemSupEndDate);
            thisDoc.systemInstall= dates.convert(data.systemInstall);
            thisDoc.systemStart= dates.convert(data.systemStart);
            thisDoc.systemEnd= dates.convert(data.systemEnd);
            thisDoc.systemNotes= strTgs.uTrim(data.systemNotes);
            thisDoc.modifiedOn = dates.convert(data.modifiedOn);
            thisDoc.modifiedBy ='Admin';
        
        sys.save(function(err){
            if(err){
                logger.info('systemdbCreate Failed - No idea what when wrong :'+data.index+' systemName '+strTgs.clTrim(data.systemName)+' found');
            }else{
            logger.info('systemdbCreate Sucessful write :'+data.index+' : '+data.systemName);
            return ('done');
            }
        });

        }else{
            logger.warn('systemdbCreate Failed - Modified date is older than the existing date for :'+data.index+' systemName '+strTgs.clTrim(data.systemName));
        }
    }
    });
};
exports.systemdbPortsCreate = function (data,req) {
// Lookup system
Systemdb.findOne({systemName: strTgs.clTrim(data.systemName)},function(err,sys){
        var thisDoc = sys;
        if(!sys){
        logger.warn('systemdbPortsCreate Failed lookup :'+data.index+' systemName not found');
        }else if(!data.modifiedOn){
            logger.warn('CSV missing modifiedOn date or ignore command for existing system port.');
        } else if (data.overwrite==='yes' || dates.compare(data.modifiedOn,thisDoc.modifiedOn)===1){
        
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
                logger.warn(err+data.index);
                logger.warn('systemdbPortsCreate Failed write :'+data.index+' : '+data.systemName);
                return (err.stack);
            }else{
                logger.info('systemdbPortsCreate Sucessful write :'+data.index+' : '+data.systemName);
                return ('done');
            }
    });
    }
    });
};