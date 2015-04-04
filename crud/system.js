var logConfig = require('../config/log.js');
var Systemdb = require('../models/system.js'),
      strTgs = require('../lib/stringThings.js'),
       dates = require('../lib/dates.js');
var winston = require('winston');
var logger = new (winston.Logger)({
  transports: [
    new winston.transports.DailyRotateFile({filename: logConfig.logDir+logConfig.fileName.uploadLog, json: false}),
    ],
  exitOnError: true
});

    
exports.systemdbCreate = function (data,req) {
    Systemdb.findOne({systemName: strTgs.csTrim(data.systemName)},function(err,sys){
        // checking for existing system
        if(!sys){

Systemdb.create({
                    systemName: strTgs.csTrim(data.systemName),
                    systemEquipSN: strTgs.cTrim(data.systemEquipSN),
                    systemEnviron: strTgs.clTrim(data.systemEnviron),
                    systemRole: strTgs.clTrim(data.systemRole),
                    systemInventoryStatus: data.systemInventoryStatus,
                    systemTicket: strTgs.sTrim(data.systemTicket),
                    systemStatus: data.systemStatus,
                    systemOwner: strTgs.uTrim(data.systemOwner),
                    systemImpact: data.systemImpact,
                    systemIsVirtual: data.systemIsVirtual,
                    systemParentId: strTgs.csTrim(data.systemParentId),
                    systemOSType: strTgs.uTrim(data.systemOSType),
                    systemOSVersion: strTgs.uTrim(data.systemOSVersion),
                    systemApplications: strTgs.uTrim(data.systemApplications),
                    systemSupLic: strTgs.uTrim(data.systemSupLic),
                    systemSupEndDate: strTgs.convertDates(data.systemSupEndDate,req.session.ses.timezone),
                    systemInstall: strTgs.convertDates(data.systemInstall,req.session.ses.timezone),
                    systemStart: strTgs.convertDates(data.systemStart,req.session.ses.timezone),
                    systemEnd: strTgs.convertDates(data.systemEnd,req.session.ses.timezone),
                    systemNotes: strTgs.uTrim(data.systemNotes),
                    createdBy: req.user.local.email,
                    createdOn: Date.now(),
                    modifiedBy: req.user.local.email,
                    modifiedOn: strTgs.compareDates(data.modifiedOn,req.session.ses.timezone),
    },function(err){
        if(err) {
            logger.info('sysCreate Failed,'+data.index+','+data.systemName);
            return (err.stack);
        }else{
            logger.info('sysCreate Sucessful,'+data.index+','+data.systemName);
            return ('done');
        }
    });
    }else{
        var thisDoc = sys;
        if(data.overwite === 'no'){
            logger.warn('sysCreate CSV date overwite=no,'+data.index+','+data.systemName);
        }else if(!data.modifiedOn && !data.overwrite){
            logger.warn('sysCreate CSV no modifiedOn or overwite,'+data.index+','+data.systemName);
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
            thisDoc.systemSupEndDate= strTgs.convertDates(data.systemSupEndDate,req.session.ses.timezone);}
            if(data.systemInstall){
            thisDoc.systemInstall= strTgs.convertDates(data.systemInstall,req.session.ses.timezone);}
            if(data.systemStart){
            thisDoc.systemStart= strTgs.convertDates(data.systemStart,req.session.ses.timezone);}
            if(data.systemEnd){
            thisDoc.systemEnd= strTgs.convertDates(data.systemEnd,req.session.ses.timezone);}
            if(data.systemNotes){
            thisDoc.systemNotes= strTgs.noteAdd(thisDoc.systemNotes,data.systemNotes);}
            thisDoc.modifiedOn = strTgs.convertDates(data.modifiedOn,req.session.ses.timezone);
            thisDoc.modifiedBy = req.user.local.email;
        
        sys.save(function(err){
            if(err){
                logger.warn(err);
                logger.warn('sysUpdate Failed Unknown,'+data.index+','+strTgs.csTrim(data.systemName));
            }else{
            logger.info('sysUpdate Sucessful write,'+data.index+','+data.systemName);
            return ('done');
            }
        });

        }else{
            logger.warn('sysUpdate Failed modifiedOn is older than existing,'+data.index+','+strTgs.csTrim(data.systemName));
        }
    }
    });
};
exports.systemdbPortsCreate = function (data,req) {
// Lookup system
Systemdb.findOne({systemName: strTgs.csTrim(data.systemName)},function(err,sys){
    if (err) {
        logger.warn('sysPortCreate,'+data.index+','+data.systemName+err);
    }else if(!sys){
        logger.warn('sysPortCreate Failed lookup,'+data.index+','+data.systemName.toLowerCase());
    } else {
        var portArray = [];
            for(var i = sys.systemPorts.length - 1; i >= 0; i--) {
                portArray[i] = sys.systemPorts[i].sysPortName;
            }
        var portPosition = portArray.indexOf(data.sysPortName);
            //logger.info('upload','portPosition >'+portPosition);
        if(portPosition === -1){
            sys.systemPorts.push({
                sysPortType: strTgs.sTrim(data.sysPortType),
                sysPortName: strTgs.sTrim(data.sysPortName),
                sysPortAddress: strTgs.sTrim(data.sysPortAddress),
                sysPortCablePath: strTgs.stTrim(data.sysPortCablePath),
                sysPortEndPoint: strTgs.csTrim(data.sysPortEndPoint),
                sysPortEndPointPre: strTgs.clTrim(data.sysPortEndPointPre),
                sysPortEndPointPort: strTgs.clTrim(data.sysPortEndPointPort),
                sysPortVlan: strTgs.sTrim(data.sysPortVlan),
                sysPortOptions: strTgs.stcTrim(data.sysPortOptions),
                sysPortURL: strTgs.clTrim(data.sysPortURL),
                modifiedBy: req.user.local.email,
                modifiedOn: strTgs.compareDates(data.modifiedOn,req.session.ses.timezone), 
            });
            sys.save(function(err){
	        if(err) {
                logger.warn('sysPortCreate Error,'+data.index+','+err);
                return (err.stack);
            }else{
                logger.info('sysPortsCreate Sucessful New write,'+data.index+','+data.systemName+','+data.sysPortName);
                return ('done');
            }
    });
    }else{
        var thisDoc = sys.systemPorts[portPosition];
        if(data.overwite === 'no'){
            logger.warn('sysPortUpdate CSV date overwite=no,'+data.index+','+data.systemName);
        }else if(!data.modifiedOn && !data.overwrite){
            logger.warn('sysPortUpdate CSV no modifiedOn or overwite,'+data.index+','+data.systemName);
        } else if (data.overwrite==='yes' || dates.compare(data.modifiedOn,thisDoc.modifiedOn)===1){    
                if(data.sysPortType){
                thisDoc.sysPortType= strTgs.sTrim(data.sysPortType);}
                if(data.sysPortAddress){
                thisDoc.sysPortAddress= strTgs.sTrim(data.sysPortAddress);}
                if(data.sysPortCablePath){
                thisDoc.sysPortCablePath= strTgs.stTrim(data.sysPortCablePath);}
                if(data.sysPortEndPoint){
                thisDoc.sysPortEndPoint= strTgs.csTrim(data.sysPortEndPoint);}
                if(data.sysPortEndPointPre){
                thisDoc.sysPortEndPointPre= strTgs.clTrim(data.sysPortEndPointPre);}
                if(data.sysPortEndPointPort){
                thisDoc.sysPortEndPointPort= strTgs.clTrim(data.sysPortEndPointPort);}
                if(data.sysPortVlan){
                thisDoc.sysPortVlan= strTgs.sTrim(data.sysPortVlan);}
                if(data.sysPortOptions){
                thisDoc.sysPortOptions= strTgs.stcTrim(data.sysPortOptions);}
                if(data.sysPortURL){
                thisDoc.sysPortURL= strTgs.clTrim(data.sysPortURL);}
                thisDoc.modifiedBy= req.user.local.email;
                thisDoc.modifiedOn= strTgs.compareDates(data.modifiedOn,req.session.ses.timezone); 
            sys.save(function(err){
            if(err){
                logger.warn('sysPortUpdate Failed,'+data.index+','+strTgs.csTrim(data.systemName)+','+err);
            }else{
                logger.info('sysPortUpdate Sucessful Update write,'+data.index+','+data.systemName+','+data.sysPortName);
            return ('done');
            }
        });
    } else {
        logger.warn('SysPortUpdate CSV modifiedOn date older,'+data.index+','+data.systemName);
    }
    }}
});

};
