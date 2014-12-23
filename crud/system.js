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
        if(data.overwite === 'no'){
            logger.warn('SysCreate CSV date overwite=no: '+data.index+' '+data.systemName);
        }else if(!data.modifiedOn && !data.overwrite){
            logger.warn('SysCreate CSV no modifiedOn or overwite: '+data.index+' '+data.systemName);
        } else if (data.overwrite==='yes' || dates.compare(data.modifiedOn,thisDoc.modifiedOn)===1){
            if(data.systemEquipSN){   
            thisDoc.systemEquipSN= strTgs.sTrim(data.systemEquipSN);}
            if(data.systemEnviron){
            thisDoc.systemEnviron= strTgs.sTrim(data.systemEnviron);}
            if(data.systemRole){
            thisDoc.systemRole= strTgs.uTrim(data.systemRole);}
            if(data.systemInventoryStatus){
            thisDoc.systemInventoryStatus= data.systemInventoryStatus;}
            if(data.systemTicket){
            thisDoc.systemTicket= strTgs.sTrim(data.systemTicket);}
            if(data.systemStatus){
            thisDoc.systemStatus= data.systemStatus;}
            if(data.systemOwner){
            thisDoc.systemOwner= strTgs.uTrim(data.systemOwner);}
            if(data.systemImpact){
            thisDoc.systemImpact= data.systemImpact;}
            if(data.systemIsVirtual){
            thisDoc.systemIsVirtual= data.systemIsVirtual;}
            if(data.systemParentId){
            thisDoc.systemParentId= strTgs.sTrim(data.systemParentId);}
            if(data.systemOSType){
            thisDoc.systemOSType= strTgs.uTrim(data.systemOSType);}
            if(data.systemOSVersion){
            thisDoc.systemOSVersion= strTgs.uTrim(data.systemOSVersion);}
            if(data.systemApplications){
            thisDoc.systemApplications= strTgs.uTrim(data.systemApplications);}
            if(data.systemSupLic){
            thisDoc.systemSupLic= strTgs.uTrim(data.systemSupLic);}
            if(data.systemSupEndDate){
            thisDoc.systemSupEndDate= dates.convert(data.systemSupEndDate);}
            if(data.systemInstall){
            thisDoc.systemInstall= dates.convert(data.systemInstall);}
            if(data.systemStart){
            thisDoc.systemStart= dates.convert(data.systemStart);}
            if(data.systemEnd){
            thisDoc.systemEnd= dates.convert(data.systemEnd);}
            if(data.systemNotes){
            thisDoc.systemNotes= strTgs.uTrim(data.systemNotes);}
            thisDoc.modifiedOn = dates.convert(data.modifiedOn);
            thisDoc.modifiedBy ='Admin';
        
        sys.save(function(err){
            if(err){
                logger.warn(err);
                logger.warn('systemdbCreate Failed - No idea what when wrong :'+data.index+' systemName '+strTgs.clTrim(data.systemName)+' found');
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
    if (err) {
        logger.warn('PortCreate'+data.systemName+err);
    }else if(!sys){
        logger.warn('PortCreate Failed lookup :'+data.systemName.toLowerCase()+' not found');
    } else {
        var portArray = [];
            for(var i = sys.systemPorts.length - 1; i >= 0; i--) {
                portArray[i] = sys.systemPorts[i].sysPortName;
            }
        var portPosition = portArray.indexOf(data.sysPortName);
            logger.info('portPosition >'+portPosition);
        if(portPosition === -1){
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
                modifiedBy: req.body.modifiedBy,
                modifiedOn: strTgs.compareDates(data.modifiedOn), 
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
    }else{
        var thisDoc = sys.systemPorts[portPosition];
        if(data.overwite === 'no'){
            logger.warn('SysPortCreate CSV date overwite=no: '+data.index+' '+data.systemName);
        }else if(!data.modifiedOn && !data.overwrite){
            logger.warn('SysPortCreate CSV no modifiedOn or overwite: '+data.index+' '+data.systemName);
        } else if (data.overwrite==='yes' || dates.compare(data.modifiedOn,thisDoc.modifiedOn)===1){    
                if(data.sysPortType){
                thisDoc.sysPortType= strTgs.sTrim(data.sysPortType);}
                if(data.sysPortType){
                thisDoc.sysPortAddress= strTgs.sTrim(data.sysPortAddress);}
                if(data.sysPortType){
                thisDoc.sysPortCablePath= strTgs.stTrim(data.sysPortCablePath);}
                if(data.sysPortType){
                thisDoc.sysPortEndPoint= strTgs.clTrim(data.sysPortEndPoint);}
                if(data.sysPortType){
                thisDoc.sysPortEndPointPre= strTgs.clTrim(data.sysPortEndPointPre);}
                if(data.sysPortType){
                thisDoc.sysPortEndPointPort= strTgs.clTrim(data.sysPortEndPointPort);}
                if(data.sysPortType){
                thisDoc.sysPortVlan= strTgs.sTrim(data.sysPortVlan);}
                if(data.sysPortType){
                thisDoc.sysPortOptions= strTgs.stcTrim(data.sysPortOptions);}
                if(data.sysPortType){
                thisDoc.sysPortURL= strTgs.clTrim(data.sysPortURL);}
                thisDoc.modifiedBy= req.body.modifiedBy;
                thisDoc.modifiedOn= strTgs.compareDates(data.modifiedOn); 
            sys.save(function(err){
            if(err){
                logger.warn('SysPortCreate Failed - '+err+' '+data.index+' systemName '+strTgs.clTrim(data.systemName)+' found');
            }else{
            logger.info('SysPortCreate Sucessful write :'+data.index+' '+data.systemName);
            return ('done');
            }
        });
    } else {
        logger.warn('SysPortCreate CSV modifiedOn date older: '+data.index+' '+data.systemName);
    }
    }}
});

};