// Equipment crud
var Equipment = require('../models/equipment.js'),
    strTgs = require('../lib/stringThings.js');
         
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
        equipPSUCount: strTgs.uTrim(data.equipPSUCount),
        equipPSUDraw: strTgs.uTrim(data.equipPSUDraw),
        equipAddOns: strTgs.uTrim(data.equipAddOns),
        equipRecieved: strTgs.uTrim(data.equipRecieved),
        equipAcquisition: strTgs.uTrim(data.equipAcquisition),
        equipInService: strTgs.uTrim(data.equipInService),
        equipPONum: strTgs.uTrim(data.equipPONum),
        equipInvoice: strTgs.uTrim(data.equipInvoice),
        equipProjectNum: strTgs.uTrim(data.equipProjectNum),
        equipLicense: strTgs.uTrim(data.equipLicense),
        equipMaintAgree: strTgs.uTrim(data.equipMaintAgree),
        equipPurchaseType: strTgs.uTrim(data.equipPurchaseType),
        equipPurchaser: strTgs.uTrim(data.equipPurchaser),
        equipPurchaseTerms: strTgs.uTrim(data.equipPurchaseTerms),
        equipPurchaseEnd: strTgs.uTrim(data.equipPurchaseEnd),
        equipNotes: strTgs.uTrim(data.equipNotes),
        createdBy:'Admin',
        createdOn: strTgs.compareDates(data.modifiedOn),
        modifiedBy: req.body.modifiedBy,
        modifiedOn: strTgs.compareDates(data.modifiedOn),
    },function(err){
	        if(err) {
                console.log("Failed write : "+data.equipSN);
                return (err.stack);
            }else{
                console.log("Sucessful write :"+data.index+" : "+data.equipSN);
                return ("done");
            }
    });

    }else{
    console.log("equipmentCreate Failed - Duplicate :"+data.index+" equipSN "+strTgs.cTrim(data.equipSN)+" found");    
    }
    });
};
exports.equipmentPortCreate = function (data,req) {
Equipment.findOne({equipSN: strTgs.cTrim(data.equipSN)},function(err,eq){

    if (err) {
        console.log(err);
    }else if(!eq){
        console.log("equipmentPortCreate Failed lookup :"+data.equipSN.toUpperCase()+" not found");
    } else {
        eq.equipPorts.push({
        equipPortType: strTgs.sTrim(data.equipPortType),
        equipPortsAddr: strTgs.mTrim(data.equipPortsAddr),
        equipPortName: strTgs.sTrim(data.equipPortName),
        equipPortsOpt: strTgs.sTrim(data.equipPortsOpt),
        });
                
        eq.save(function(err){
        if(err) {
            console.log("Failed write :"+data.equipSN);
            return (err.stack);
        }else{
            console.log("Sucessful write :"+data.index+" : "+data.equipSN);
            return ("done");
        }
    });
    }
    });
};





