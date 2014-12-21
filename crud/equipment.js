// Equipment crud
var logger = require('../lib/logger.js'), 
 Equipment = require('../models/equipment.js'),
    strTgs = require('../lib/stringThings.js'),
     dates = require('../lib/dates.js');
         
exports.equipmentCreate = function (data,req) {
Equipment.findOne({equipSN: strTgs.cTrim(data.equipSN)},function(err,eq){
    if(!eq){

    Equipment.create({
        equipLocation: strTgs.clTrim(data.equipLocation),
        equipSN: strTgs.cTrim(data.equipSN),
        equipAssetTag: strTgs.sTrim(data.equipAssetTag),
        equipTicketNumber: strTgs.sTrim(data.equipTicketNumber),
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
        createdBy:'Admin',
        createdOn: strTgs.compareDates(data.modifiedOn),
        modifiedBy: req.body.modifiedBy,
        modifiedOn: strTgs.compareDates(data.modifiedOn),
    },function(err){
	        if(err) {

                logger.warn('equipmentCreate Failed write : '+data.equipSN);
                return (err.stack);
            }else{
                logger.info('equipmentCreate Sucessful write :'+data.index+' : '+data.equipSN);
                return ('done');
            }
    });

    }else{
        var thisDoc = eq;
        if(!data.modifiedOn){
            logger.warn('CSV missing modifiedOn date or ignore command for existing equipment.');
        } else if (data.overwrite==='yes' || dates.compare(data.modifiedOn,thisDoc.modifiedOn)===1){

                thisDoc.equipLocation = strTgs.locComb(data.equipLocationRack,data.equipLocationRu);
                thisDoc.equipAssetTag = strTgs.uTrim(data.equipAssetTag);
                thisDoc.equipTicketNumber = strTgs.uTrim(data.equipTicketNumber);
                thisDoc.equipInventoryStatus = strTgs.uTrim(data.equipInventoryStatus);
                thisDoc.equipStatus = strTgs.uTrim(data.equipStatus);
                thisDoc.equipIsVirtual = strTgs.uTrim(data.equipIsVirtual);
                thisDoc.equipType = strTgs.uTrim(data.equipType);
                thisDoc.equipMake = strTgs.uTrim(data.equipMake);
                thisDoc.equipModel = strTgs.uTrim(data.equipModel);
                thisDoc.equipSubModel = strTgs.uTrim(data.equipSubModel);
                thisDoc.equipRUHieght = strTgs.uTrim(data.equipRUHieght);
                thisDoc.equipImgFront = strTgs.uTrim(data.equipImgFront);
                thisDoc.equipImgRear = strTgs.uTrim(data.equipImgRear);
                thisDoc.equipImgInternal = strTgs.uTrim(data.equipImgInternal);
                thisDoc.equipFirmware = strTgs.uTrim(data.equipFirmware);
                thisDoc.equipMobo = strTgs.uTrim(data.equipMobo);
                thisDoc.equipCPUCount = strTgs.uTrim(data.equipCPUCount);
                thisDoc.equipCPUCores = strTgs.uTrim(data.equipCPUCores);
                thisDoc.equipCPUType = strTgs.uTrim(data.equipCPUType);
                thisDoc.equipMemType = strTgs.uTrim(data.equipMemType);
                thisDoc.equipMemTotal = strTgs.uTrim(data.equipMemTotal);
                thisDoc.equipRaidType = strTgs.uTrim(data.equipRaidType);
                thisDoc.equipRaidLayout = strTgs.uTrim(data.equipRaidLayout);
                thisDoc.equipHDDCount = strTgs.uTrim(data.equipHDDCount);
                thisDoc.equipHDDType = strTgs.uTrim(data.equipHDDType);
                thisDoc.equipNICCount = strTgs.uTrim(data.equipNICCount);
                thisDoc.equipNICType= strTgs.uTrim(data.equipNicType);
                thisDoc.equipPSUCount = strTgs.uTrim(data.equipPSUCount);
                thisDoc.equipPSUDraw = strTgs.uTrim(data.equipPSUDraw);
                thisDoc.equipAddOns = strTgs.uTrim(data.equipAddOns);
                thisDoc.equipRecieved = dates.convert(data.equipRecieved);
                thisDoc.equipAcquisition = dates.convert(data.equipAcquisition);
                thisDoc.equipInService = dates.convert(data.equipInService);
                thisDoc.equipPONum = strTgs.uTrim(data.equipPONum);
                thisDoc.equipInvoice = strTgs.uTrim(data.equipInvoice);
                thisDoc.equipProjectNum = strTgs.uTrim(data.equipProjectNum);
                thisDoc.equipLicense = strTgs.uTrim(data.equipLicense);
                thisDoc.equipMaintAgree = strTgs.uTrim(data.equipMaintAgree);
                thisDoc.equipPurchaseType = strTgs.uTrim(data.equipPurchaseType);
                thisDoc.equipPurchaser = strTgs.uTrim(data.equipPurchaser);
                thisDoc.equipPurchaseTerms = strTgs.uTrim(data.equipPurchaseTerms);
                thisDoc.equipPurchaseEnd = dates.convert(data.equipPurchaseEnd);
                thisDoc.equipNotes = strTgs.uTrim(data.equipNotes);
                thisDoc.modifiedOn = dates.convert(data.modifiedOn);
                thisDoc.modifiedBy ='Admin';

        eq.save(function(err){
            if(err){
                logger.warn(err);
                logger.warn('equipmentCreate Failed - No idea what when wrong :'+data.index+' equipSN '+strTgs.cTrim(data.equipSN)+' found');
            }else{
            logger.info('equipmentCreate Sucessful write :'+data.index+' : '+data.equipSN);
            return ('done');
            }
        });

        }else{
            logger.warn('equipmentCreate Failed - Modified date is older than the existing date for :'+data.index+' equipSN '+strTgs.clTrim(data.equipSN));
        }
    }
    });
};
exports.equipmentPortCreate = function (data,req) {
Equipment.findOne({equipSN: strTgs.cTrim(data.equipSN)},function(err,eq){

    if (err) {
        logger.warn('equipmentPortCreate'+data.equipSN+err);
    }else if(!eq){
        logger.warn('equipmentPortCreate Failed lookup :'+data.equipSN.toUpperCase()+' not found');
    } else {
        eq.equipPorts.push({
        equipPortType: strTgs.sTrim(data.equipPortType),
        equipPortsAddr: strTgs.mTrim(data.equipPortsAddr),
        equipPortName: strTgs.sTrim(data.equipPortName),
        equipPortsOpt: strTgs.sTrim(data.equipPortsOpt),
        });
                
        eq.save(function(err){
        if(err) {
            logger.warn(err);
            logger.warn('equipmentPortCreate Failed write :'+data.equipSN);
            return (err.stack);
        }else{
            logger.info('equipmentPortCreate Sucessful write :'+data.index+' : '+data.equipSN);
            return ('done');
        }
    });
    }
    });
};





