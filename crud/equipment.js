var logconfig = require('./../logconfig.js');
var Equipment = require('../models/equipment.js'),
    strTgs = require('../lib/stringThings.js'),
     dates = require('../lib/dates.js');
var winston = require('winston');
var logger = new (winston.Logger)({
  transports: [
    new winston.transports.DailyRotateFile({filename: logconfig.logDir+logconfig.fileName.uploadLog, json: false}),
    ],
  exitOnError: true
});
         
exports.equipmentCreate = function (data,req) {
Equipment.findOne({equipSN: strTgs.cTrim(data.equipSN)},function(err,eq){
    if(!eq){

    Equipment.create({
        equipLocation: strTgs.clTrim(data.equipLocation),
        equipSN: strTgs.cTrim(data.equipSN),
        equipAssetTag: strTgs.sTrim(data.equipAssetTag),
        equipTicketNumber: strTgs.cTrim(data.equipTicketNumber),
        equipInventoryStatus: strTgs.uTrim(data.equipInventoryStatus),
        equipStatus: strTgs.uTrim(data.equipStatus),
        equipIsVirtual: data.equipIsVirtual,
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
        equipNICCount:strTgs.uTrim(data.equipNICCount),
        etuipNICType:strTgs.uTrim(data.etuipNICType),
        equipPSUCount: strTgs.uTrim(data.equipPSUCount),
        equipPSUDraw: strTgs.uTrim(data.equipPSUDraw),
        equipAddOns: strTgs.uTrim(data.equipAddOns),
        equipRecieved: dates.convert(data.equipRecieved),
        equipAcquisition: dates.convert(data.equipAcquisition),
        equipInService: dates.convert(data.equipInService),
        equipEndOfLife: dates.convert(data.equipEndOfLife),
        equipWarrantyMo: strTgs.uTrim(data.equipWarrantyMo),        
        equipPONum: strTgs.uTrim(data.equipPONum),
        equipInvoice: strTgs.uTrim(data.equipInvoice),
        equipProjectNum: strTgs.uTrim(data.equipProjectNum),
        equipLicense: strTgs.uTrim(data.equipLicense),
        equipMaintAgree: strTgs.uTrim(data.equipMaintAgree),
        equipPurchaseType: strTgs.uTrim(data.equipPurchaseType),
        equipPurchaser: strTgs.uTrim(data.equipPurchaser),
        equipPurchaseTerms: strTgs.uTrim(data.equipPurchaseTerms),
        equipPurchaseEnd: dates.convert(data.equipPurchaseEnd),
        equipNotes: strTgs.uTrim(data.equipNotes),
        createdBy: req.user.local.email,
        createdOn: strTgs.compareDates(data.modifiedOn),
        modifiedBy: req.user.local.email,
        modifiedOn: strTgs.compareDates(data.modifiedOn),
    },function(err){
	        if(err) {

                logger.warn('csvUpload','eqCreate Failed,'+data.index+','+data.equipSN);
                return (err.stack);
            }else{
                logger.info('csvUpload','eqCreate Sucess,'+data.index+','+data.equipSN);
                return ('done');
            }
    });

    }else{
        var thisDoc = eq;
        if(data.overwite === 'no'){
            logger.warn('csvUpload','eqCreate Failed no CSV date overwite=no,'+data.index+','+data.equipSN);
        }else if(!data.modifiedOn && !data.overwrite){
            logger.warn('csvUpload','eqCreate Failed CSV no modifiedOn or overwite,'+data.index+','+data.equipSN);
        } else if (data.overwrite==='yes' || dates.compare(data.modifiedOn,thisDoc.modifiedOn)===1){
                if(data.equipLocationRack && data.equipLocationRu){
                thisDoc.equipLocation = strTgs.locComb(data.equipLocationRack,data.equipLocationRu);}
                if(data.equipAssetTag){
                thisDoc.equipAssetTag = strTgs.uTrim(data.equipAssetTag);}
                if(data.equipTicketNumber){
                thisDoc.equipTicketNumber = strTgs.uTrim(data.equipTicketNumber);}
                if(data.equipInventoryStatus){
                thisDoc.equipInventoryStatus = strTgs.uTrim(data.equipInventoryStatus);}
                if(data.equipStatus){
                thisDoc.equipStatus = strTgs.uTrim(data.equipStatus);}
                if(data.equipIsVirtual){
                thisDoc.equipIsVirtual = strTgs.uTrim(data.equipIsVirtual);}
                if(data.equipType){
                thisDoc.equipType = strTgs.uTrim(data.equipType);}
                if(data.equipMake){
                thisDoc.equipMake = strTgs.uTrim(data.equipMake);}
                if(data.equipModel){
                thisDoc.equipModel = strTgs.uTrim(data.equipModel);}
                if(data.equipSubModel){
                thisDoc.equipSubModel = strTgs.uTrim(data.equipSubModel);}
                if(data.equipRUHieght){
                thisDoc.equipRUHieght = strTgs.uTrim(data.equipRUHieght);}
                if(data.equipImgFront){
                thisDoc.equipImgFront = strTgs.uTrim(data.equipImgFront);}
                if(data.equipImgRear){
                thisDoc.equipImgRear = strTgs.uTrim(data.equipImgRear);}
                if(data.equipImgInternal){
                thisDoc.equipImgInternal = strTgs.uTrim(data.equipImgInternal);}
                if(data.equipFirmware){
                thisDoc.equipFirmware = strTgs.uTrim(data.equipFirmware);}
                if(data.equipMobo){
                thisDoc.equipMobo = strTgs.uTrim(data.equipMobo);}
                if(data.equipCPUCount){
                thisDoc.equipCPUCount = strTgs.uTrim(data.equipCPUCount);}
                if(data.equipCPUCores){
                thisDoc.equipCPUCores = strTgs.uTrim(data.equipCPUCores);}
                if(data.equipCPUType){
                thisDoc.equipCPUType = strTgs.uTrim(data.equipCPUType);}
                if(data.equipMemType){
                thisDoc.equipMemType = strTgs.uTrim(data.equipMemType);}
                if(data.equipMemTotal){
                thisDoc.equipMemTotal = strTgs.uTrim(data.equipMemTotal);}
                if(data.equipRaidType){
                thisDoc.equipRaidType = strTgs.uTrim(data.equipRaidType);}
                if(data.equipRaidLayout){
                thisDoc.equipRaidLayout = strTgs.uTrim(data.equipRaidLayout);}
                if(data.equipHDDCount){
                thisDoc.equipHDDCount = strTgs.uTrim(data.equipHDDCount);}
                if(data.equipHDDType){
                thisDoc.equipHDDType = strTgs.uTrim(data.equipHDDType);}
                if(data.equipPSUCount){
                thisDoc.equipPSUCount = strTgs.uTrim(data.equipPSUCount);}
                if(data.equipPSUDraw){
                thisDoc.equipPSUDraw = strTgs.uTrim(data.equipPSUDraw);}
                if(data.equipAddOns){
                thisDoc.equipAddOns = strTgs.uTrim(data.equipAddOns);}
                if(data.equipRecieved){
                thisDoc.equipRecieved = dates.convert(data.equipRecieved);}
                if(data.equipAcquisition){
                thisDoc.equipAcquisition = dates.convert(data.equipAcquisition);}
                if(data.equipInService){
                thisDoc.equipInService = dates.convert(data.equipInService);}
                if(data.equipEndOfLife){
                thisDoc.equipEndOfLife = dates.convert(data.equipEndOfLife);}
                if(data.equipWarrantyMo){
                thisDoc.equipWarrantyMo = dates.convert(data.equipWarrantyMo);}
                if(data.equipPONum){
                thisDoc.equipPONum = strTgs.uTrim(data.equipPONum);}
                if(data.equipInvoice){
                thisDoc.equipInvoice = strTgs.uTrim(data.equipInvoice);}
                if(data.equipProjectNum){
                thisDoc.equipProjectNum = strTgs.uTrim(data.equipProjectNum);}
                if(data.equipLicense){
                thisDoc.equipLicense = strTgs.uTrim(data.equipLicense);}
                if(data.equipMaintAgree){
                thisDoc.equipMaintAgree = strTgs.uTrim(data.equipMaintAgree);}
                if(data.equipPurchaseType){
                thisDoc.equipPurchaseType = strTgs.uTrim(data.equipPurchaseType);}
                if(data.equipPurchaser){
                thisDoc.equipPurchaser = strTgs.uTrim(data.equipPurchaser);}
                if(data.equipPurchaseTerms){
                thisDoc.equipPurchaseTerms = strTgs.uTrim(data.equipPurchaseTerms);}
                if(data.equipPurchaseEnd){
                thisDoc.equipPurchaseEnd = dates.convert(data.equipPurchaseEnd);}
                if(data.equipNotes){
                thisDoc.equipNotes = strTgs.noteAdd(thisDoc.equipNotes,data.equipNotes);}
                thisDoc.modifiedOn = dates.convert(data.modifiedOn);
                thisDoc.modifiedBy =req.user.local.email;

        eq.save(function(err){
            if(err){
                logger.warn('csvUpload',err);
                logger.warn('csvUpload','eqCreate Failed - Unknown,'+data.index+','+strTgs.cTrim(data.equipSN));
            }else{
            logger.info('csvUpload','eqCreate Sucess,'+data.index+','+data.equipSN);
            return ('done');
            }
        });

        }else{
            logger.warn('csvUpload','eqCreate Failed modifiedOn older than existing,'+data.index+','+strTgs.cTrim(data.equipSN));
        }
    }
    });
};
exports.equipmentPortCreate = function (data,req) {
Equipment.findOne({equipSN: strTgs.cTrim(data.equipSN)},function(err,eq){
    if (err) {
        logger.warn('csvUpload','eqPortCreate Err,'+data.equipSN+err);
    }else if(!eq){
        logger.warn('csvUpload','eqPortCreate Failed lookup,'+data.index+','+data.equipSN.toUpperCase());
    } else {
        var portArray = [];
            for(var i = eq.equipPorts.length - 1; i >= 0; i--) {
                portArray[i] = eq.equipPorts[i].equipPortName;
            }
        var portPosition = portArray.indexOf(data.equipPortName);
            //logger.info('csvUpload','portPosition >'+portPosition);
        if(portPosition === -1){
            eq.equipPorts.push({
                equipPortType: strTgs.sTrim(data.equipPortType),
                equipPortsAddr: strTgs.mTrim(data.equipPortsAddr),
                equipPortName: strTgs.sTrim(data.equipPortName),
                equipPortsOpt: strTgs.sTrim(data.equipPortsOpt),
                modifiedBy: req.user.local.email,
                modifiedOn: strTgs.compareDates(data.modifiedOn),   
        });
        eq.save(function(err){
        if(err) {
            logger.warn('csvUpload',err);
            logger.warn('csvUpload','eqPortCreate Failed,'+data.index+','+data.equipSN);
            return (err.stack);
        }else{
            logger.info('csvUpload','eqPortCreate Sucessful,'+data.index+','+data.equipSN+','+data.equipPortName);
            return ('done');
        }
    });
    } else {
        var thisDoc = eq.equipPorts[portPosition];
        if(data.overwite === 'no'){
            logger.warn('csvUpload','eqPortCreate Failed CSV date overwite=no,'+data.index+','+data.equipSN);
        }else if(!data.modifiedOn && !data.overwrite){
            logger.warn('csvUpload','eqPortCreate Failed CSV no modifiedOn or overwite,'+data.index+','+data.equipSN);
        } else if (data.overwrite==='yes' || dates.compare(data.modifiedOn,thisDoc.modifiedOn)===1){
                if(data.equipPortType){
                thisDoc.equipPortType= strTgs.sTrim(data.equipPortType);}
                if(data.equipPortsAddr){
                thisDoc.equipPortsAddr= strTgs.mTrim(data.equipPortsAddr);}
                if(data.equipPortsOpt){
                thisDoc.equipPortsOpt= strTgs.sTrim(data.equipPortsOpt);}
                thisDoc.modifiedBy= req.user.local.email;
                thisDoc.modifiedOn= strTgs.compareDates(data.modifiedOn);
            eq.save(function(err){
            if(err){
                logger.warn('csvUpload','eqPortCreate Failed,'+err+','+data.index+','+strTgs.cTrim(data.equipSN));
            }else{
            logger.info('csvUpload','eqPortCreate Sucessful write,'+data.index+','+data.equipSN+','+data.equipPortName);
            return ('done');
            }
        });
    } else {
        logger.warn('csvUpload','eqPortCreate Failed CSV modifiedOn date older,'+data.index+','+data.equipSN);
    }

    }}
});

};