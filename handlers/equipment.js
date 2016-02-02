
var      async = require('async'),
        logger = require('../lib/logger.js'),
        strTgs = require('../lib/stringThings.js'),
     accConfig = require('../config/access'),
      ObjectId = require('mongoose').Types.ObjectId;


// Models
var Datacenter = require('../models/datacenter.js'),
          Rack = require('../models/rack.js'),
     Optionsdb = require('../models/options.js'),
     Equipment = require('../models/equipment.js'),
      Systemdb = require('../models/system.js');


var start  = '',
    editLoad =0,
    dcabbr = '',
    dcInfo = '',
    dcInfoSplit = '',
    dcSubId = '',
    dcId ='';


//---------------------------------------------------------------------     
//----------------------   Equipment List  ----------------------------
//--------------------------------------------------------------------- 
/*
this is the Equip List block. Looks for 'List' in the URL and returns list of Equipment.
*/
exports.dcEquipPages = function(req,res,next){
    //logger.info('***********exports.dcEquipPages First >' +req.params.datacenter);
    if (accConfig.accessCheck(req.user).read !== 1){
    req.session.flash = strTgs.notAuth;
        return res.redirect(303, '/');
    }else{ 
    if (!req.params.datacenter ){
    //logger.info('in List');
    // this looks for 'list' as the / url. if it exists, it prints the datacenter list
        Equipment.find({}).sort({'modifiedOn': 'desc'}).exec(function(err, eqs){
        if(err){
        logger.info(err);
        }else{
            var context = {
                access : accConfig.accessCheck(req.user),
                user : req.user,
                requrl : req.url,
                eqs: eqs.map(function(eq){
                       // rack.populate('rackParentDC', 'abbreviation cageNickname')
                    //logger.info(eq);
                    return {
                            equipLocation: eq.equipLocation,
                            equipLocationRack: strTgs.ruToLocation(eq.equipLocation),
                            equipSN: eq.equipSN,
                            equipTicketNumber: eq.equipticketNumber,
                            equipInventoryStatus: strTgs.trueFalseIcon(eq.equipInventoryStatus,eq.equipticketNumber),
                            equipStatus: eq.equipStatus,
                            equipStatusLight: strTgs.trueFalseIcon(eq.equipStatus,eq.equipStatus),
                            equipType: eq.equipType,
                            equipMake: eq.equipMake,
                            equipModel: eq.equipModel,
                            equipSubModel: eq.equipSubModel,
                            equipAcquisition: strTgs.addAndCompDates(eq.equipAcquisition, eq.equipWarrantyMo),
                            equipPONum: eq.equipPONum,
                            equipProjectNum: eq.equipProjectNum,
                            createdOn: strTgs.dateMod(eq.createdOn),
                            modifiedOn: strTgs.dateMod(eq.modifiedOn),
                    };
                })
            };
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/equipment-list', context);
        }});
        
/*------------------------------------------------------------------
----------------------- Create New Rack Power   --------------------   
------------------------------------------------------------------------
*/
    } else if (req.params.datacenter.indexOf ('circuit') !=-1){
        //logger.info('else if (req.params.datacenter.indexOf ("circuit")');
        //logger.info('rack '+req.params.datacenter);
        start = req.params.datacenter.indexOf ('~')+1;
            //logger.info('|start   >'+start);
        dcInfo = req.params.datacenter.substring (start);
            //logger.info('|dcInfo  >'+dcInfo);
        dcSplit = dcInfo.indexOf ('>');
            //logger.info('|dcSplit >'+dcSplit);
        dcSubId = dcInfo.substring (dcSplit+1);
            //logger.info('|dcSubId >'+dcSubId);
        dcId = dcInfo.substring (0,dcSplit);
            //logger.info('|dcId    >'+dcId);
        
        
        
        Rack.findOne({rackUnique: dcId},function(err,rk){
        if(err)return next(err);
        Datacenter.find({},'_id fullName abbreviation foundingCompany powerNames cages._id cages.cageNickname cages.cageAbbreviation cages.cageName',function(err,datacenter){
        if(err) return next(err);
        
        
        var uber = strTgs.findCGParent(rk.rackParentCage,datacenter);
        var context;
        if (dcSubId === 'new'){
            context ={
                access : accConfig.accessCheck(req.user),
                user : req.user,
                requrl : req.url,
                rackParentDC: rk.rackParentDC,
                fullName: uber.fullName,
                abbreviation: uber.abbreviation,
                foundingCompany: uber.foundingCompany,
                powerNames: uber.powerNames,
                cageAbbreviation: uber.cageAbbreviation,
                cageNickname: uber.cageNickname,
                cageName: uber.cageName,
                rackId: rk._id,
                rackNickname: rk.rackNickname,
                rackName: rk.rackName,
                rackUnique: rk.rackUnique,
                rackParentCage: rk.rackParentCage,
                };
            res.render('location/rackpower', context);
        
        } else {
       
        var thisSubDoc = rk.powers.id(dcSubId);

        if(err) return next(err);
        if(!rk) return next();
        
        if (req.params.datacenter.indexOf ('copy') !=-1){
           //logger.info(rk);
                context ={
                    access : accConfig.accessCheck(req.user),
                    user : req.user,
                    requrl : req.url,
                    rackParentDC: rk.rackParentDC,
                    fullName: uber.fullName,
                    abbreviation: uber.abbreviation,
                    foundingCompany: uber.foundingCompany,
                    powerNames: uber.powerNames,
                    cageAbbreviation: uber.cageAbbreviation,
                    cageNickname: uber.cageNickname,
                    cageName: uber.cageName,
                    rackId: rk._id,
                    rackNickname: rk.rackNickname,
                    rackName: rk.rackName,
                    rackUnique: rk.rackUnique,
                    rackParentCage: rk.rackParentCage,
                    rackPowStatus: thisSubDoc.rackPowStatus,
                    rackPowVolts: thisSubDoc.rackPowVolts,
                    rackPowPhase: thisSubDoc.rackPowPhase,
                    rackPowAmps: thisSubDoc.rackPowAmps,
                    rackPowReceptacle: thisSubDoc.rackPowReceptacle,
                    };        
        
        } else {
        
       //logger.info(rk);
            context ={
                access : accConfig.accessCheck(req.user),
                user : req.user,
                requrl : req.url,
                rackParentDC: rk.rackParentDC,
                fullName: uber.fullName,
                abbreviation: uber.abbreviation,
                foundingCompany: uber.foundingCompany,
                powerNames: uber.powerNames,
                cageAbbreviation: uber.cageAbbreviation,
                cageNickname: uber.cageNickname,
                cageName: uber.cageName,
                rackId: rk._id,
                rackNickname: rk.rackNickname,
                rackName: rk.rackName,
                rackUnique: rk.rackUnique,
                rackParentCage: rk.rackParentCage,
                rackPowId: thisSubDoc.id,
                rackPowMain: thisSubDoc.rackPowMain,
                rackPowCircuit: thisSubDoc.rackPowCircuit,
                rackPowUnique: thisSubDoc.rackPowUnique,
                rackPowStatus: thisSubDoc.rackPowStatus,
                rackPowVolts: thisSubDoc.rackPowVolts,
                rackPowPhase: thisSubDoc.rackPowPhase,
                rackPowAmps: thisSubDoc.rackPowAmps,
                rackPowReceptacle: thisSubDoc.rackPowReceptacle,
                };
            }    
        //logger.info(context);
        res.render('location/rackpower', context); 
        }});});
/*------------------------------------------------------------------
---------------------  Create New Equipment   ---------------------------
------------------------------------------------------------------------
*/


    } else if (req.params.datacenter.indexOf ('new') !=-1){
        //logger.info('else if (req.params.datacenter.indexOf ("newequip")');
        //logger.info('datacenter '+req.params.datacenter);
        start = req.params.datacenter.indexOf ('-')+1;
            //logger.info('|start   >'+start);
        dcId = req.params.datacenter.substring (start);
        
            //logger.info('|dcId    >'+dcId);

    Optionsdb.find({}, 'optListKey optListArray',function(err,opt){
        if(err)return next(err);
        

    Rack.find({},{ 'rUs':1,'rackUnique':1,'_id': 0},{sort:{rackUnique:1}},function(err, rk){
        if(err) return next(err);
        if(!rk) return next();
        //logger.info('rk'+rk);
        var rackUni=[];
        for(i=0;i<rk.length;i++){
        rackUni[i] = rk[i].rackUnique;
        //logger.info('rackUni >'+rackUni[i]);
        }
        
        //var RuTemp = 52;
        var getRackrUs = function(RuTemp){
           //logger.info('getRackrUs'+RuTemp);
            var tempRu=[];
            for(i=0;i<RuTemp;i++){
            tempRu[i]=strTgs.pad([i]);
        }
            //logger.info('getRackrUs>> '+tempRu);
        return tempRu; 
        };
            context ={
                access : accConfig.accessCheck(req.user),
                user : req.user,
                requrl : req.url,
                optSystPortType: strTgs.findThisInThatMulti('optSystPortType',opt,'optListKey'),
                optEquipStatus: strTgs.findThisInThatMulti('optEquipStatus',opt,'optListKey'),
                optEquipType: strTgs.findThisInThatMulti('optEquipType',opt,'optListKey'),
                rackUnique: rackUni,
                rackrUs: getRackrUs(52),
                };
       //logger.info(context);
        res.render('asset/equipmentedit', context);  
        });});

    }  else {
/*---------------------------------------------------------------------
-------------------------Equipment Edit, Copy or View------------------
                   /asset/equipment/edit~copy-
------------------------------------------------------------------------
*/

    if (req.params.datacenter.indexOf ('edit') !=-1){
        //logger.info('else if (req.params.datacenter.indexOf ("edit")');
    // this section decides if it is a Copy, Edit or View
        start = req.params.datacenter.indexOf ('-');
        dcabbr = req.params.datacenter.substring (start+1);
            if (req.params.datacenter.indexOf ('copy') !=-1){
            editLoad = 5;
            //logger.info('copy equip '+dcabbr);
        } else {
            editLoad = 3;
            //logger.info('edit equip '+dcabbr);
        }
        } else {
            editLoad = 1;
            dcabbr = req.params.datacenter;
            //logger.info('view equip '+dcabbr);
        }
        
  
    Equipment.findOne({equipSN: dcabbr},function(err,eq){
        if(err) return next(err);
        if(!eq) return next();
        //logger.info(datacenter);
    //Optionsdb.findOne({optListKey: 'optEquipStatus'},function(err,opt){
    //    if(err)return next(err);
    
    Optionsdb.find({}, 'optListKey optListArray',function(err,opt){
        if(err)return next(err);
    
    Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus modifiedOn',function(err, sys){


    Rack.find({},{ 'rUs':1,'rackUnique':1,'_id': 0},{sort:{rackUnique:1}},function(err, rk){
        if(err) return next(err);
        if(!rk) return next();
        //logger.info('rk'+rk);
        var rackUni=[];
        for(i=0;i<rk.length;i++){
        rackUni[i] = rk[i].rackUnique;
        //logger.info('rackUni >'+rackUni[i]);
        }
        
        //var RuTemp = 52;
        var getRackrUs = function(RuTemp){
           //logger.info('getRackrUs'+RuTemp);
            var tempRu=[];
            for(i=0;i<RuTemp;i++){
            tempRu[i]=strTgs.pad([i]);
        }
            //logger.info('getRackrUs>> '+tempRu);
        return tempRu; 
        };
        //logger.info('rackUni >'+rackUni);

       //logger.info ('Equipment.findOne '+dcabbr);
        
        if(editLoad < 4){

            tempSys = strTgs.findThisInThatMulti(eq.equipSN,sys,'systemEquipSN');

             context = {
                access : accConfig.accessCheck(req.user),
                user : req.user,
                requrl : req.url, 
                                menu1: eq.equipSN,
                                menuLink1: '#',
                                titleNow:eq.equipSN,
                                optSystPortType: strTgs.findThisInThatMulti('optSystPortType',opt,'optListKey'),
                                optEquipStatus: strTgs.findThisInThatMulti('optEquipStatus',opt,'optListKey'),
                                optEquipType: strTgs.findThisInThatMulti('optEquipType',opt,'optListKey'),
                                rackUnique: rackUni,
                                rackrUs: getRackrUs(52),
                                equipId: eq._id,
                                equipLocationRack: strTgs.ruToLocation(eq.equipLocation),
                                equipLocationRu: strTgs.ruElevation(eq.equipLocation),
                                equipLocation: eq.equipLocation,
                                equipSN: eq.equipSN,
                                equipAssetTag: eq.equipAssetTag,
                                equipTicketNumber: eq.equipTicketNumber,
                                equipTicketNumberlit: strTgs.trueFalseIcon(eq.equipInventoryStatus,eq.equipTicketNumber),
                                equipInventoryStatus: eq.equipInventoryStatus,
                                equipStatuslit: strTgs.trueFalseIcon(eq.equipStatus,eq.equipStatus),
                                equipInventoryStatusChecked: strTgs.setCheckBox(eq.equipInventoryStatus),
                                equipStatus: eq.equipStatus,
                                equipIsVirtual: eq.equipIsVirtual,
                                equipIsVirtualChecked: strTgs.setCheckBox(eq.equipIsVirtual),
                                equipType: eq.equipType,
                                equipMake: eq.equipMake,
                                equipModel: eq.equipModel,
                                equipSubModel: eq.equipSubModel,
                                equipRUHieght: eq.equipRUHieght,
                                equipImgFront: eq.equipImgFront,
                                equipImgRear: eq.equipImgRear,
                                equipImgInternal: eq.equipImgInternal,
                                equipFirmware: eq.equipFirmware,
                                equipMobo: eq.equipMobo,
                                equipCPUCount: eq.equipCPUCount,
                                equipCPUCores: eq.equipCPUCores,
                                equipCPUType: eq.equipCPUType,
                                equipMemType: eq.equipMemType,
                                equipMemTotal: eq.equipMemTotal,
                                equipRaidType: eq.equipRaidType,
                                equipRaidLayout: eq.equipRaidLayout,
                                equipHDDCount: eq.equipHDDCount,
                                equipHDDType: eq.equipHDDType,
                                equipNICCount: eq.equipNICCount,
                                equipNICType: eq.equipNICType,
                                equipPSUCount: eq.equipPSUCount,
                                equipPSUDraw: eq.equipPSUDraw,
                                equipAddOns: eq.equipAddOns,
                                equipReceived: strTgs.dateMod(eq.equipReceived),
                                equipAcquisition: strTgs.dateMod(eq.equipAcquisition),
                                equipInService: strTgs.dateMod(eq.equipInService),
                                equipEndOfLife: strTgs.dateMod(eq.equipEndOfLife),
                                equipWarrantyMo: eq.equipWarrantyMo,
                                equipPONum: eq.equipPONum,
                                equipInvoice: eq.equipInvoice,
                                equipProjectNum: eq.equipProjectNum,
                                equipLicense: eq.equipLicense,
                                equipMaintAgree: eq.equipMaintAgree,
                                equipPurchaseType: eq.equipPurchaseType,
                                equipPurchaser: eq.equipPurchaser,
                                equipPurchaseTerms: eq.equipPurchaseTerms,
                                equipPurchaseEnd: strTgs.dateMod(eq.equipPurchaseEnd),
                                equipNotes: eq.equipNotes,
                                createdBy: eq.createdBy,
                                createdOn: strTgs.dateMod(eq.createdOn),
                                modifiedBy: eq.modifiedBy,
                                modifiedOn: strTgs.dateMod(eq.modifiedOn),
                            equipPorts: eq.equipPorts.map(function(ep){
                            return {
                                equipPortId: ep._id,
                                equipPortType: ep.equipPortType,
                                equipPortsAddr: ep.equipPortsAddr,
                                equipPortName: ep.equipPortName,
                                equipPortsOpt: ep.equipPortsOpt,
                                createdBy: ep.createdBy,
                                createdOn: strTgs.dateMod(ep.createdOn),
                                modifiedby: ep.modifiedbBy,
                                modifiedOn: strTgs.dateMod(ep.modifiedOn),
                            };
                            }),
                            equipRMAs: eq.equipRMAs.map(function(er){
                            return {
                                equipRMA: er._id,
                                equipRMAOpened: strTgs.dateMod(er.equipRMAOpened),
                                equipRMAClosed: strTgs.dateMod(er.equipRMAClosed),
                                equipRMATicket: er.equipRMATicket,
                                equipRMANumber: er.equipRMANumber,
                                equipRMANotes: er.equipRMANotes,
                                createdBy: er.createdBy,
                                createdOn: strTgs.dateMod(er.createdOn),
                                modifiedby: er.modifiedbBy,
                                modifiedOn: strTgs.dateMod(er.modifiedOn), 
                            };
                            }),
                            systemName: tempSys.systemName,
                            systemEnviron: tempSys.systemEnviron,
                            systemRole: tempSys.systemRole,
                            systemStatus: strTgs.trueFalseIcon(tempSys.systemStatus,tempSys.systemStatus),
                            sysmodifiedOn: strTgs.dateMod(tempSys.modifiedOn),
                        }; 
        
        } else {
           context = {
            access : accConfig.accessCheck(req.user),
            user : req.user,
            requrl : req.url, 
                                optSystPortType: strTgs.findThisInThatMulti('optSystPortType',opt,'optListKey'),
                                optEquipStatus: strTgs.findThisInThatMulti('optEquipStatus',opt,'optListKey'),
                                optEquipType: strTgs.findThisInThatMulti('optEquipType',opt,'optListKey'),
                                rackrUs: getRackrUs(52),
                                rackUnique: rackUni,
                                rUs: rk.rUs,
                                wasCopy: eq.equipSN,
                                equipTicketNumber: eq.equipTicketNumber,
                                equipTicketNumberlit: strTgs.trueFalseIcon(eq.equipInventoryStatus,eq.equipTicketNumber),
                                equipInventoryStatus: eq.equipInventoryStatus,
                                equipStatuslit: strTgs.trueFalseIcon(eq.equipStatus,eq.equipStatus),
                                equipStatus: eq.equipStatus,
                                equipIsVirtualChecked: strTgs.setCheckBox(eq.equipIsVirtual),
                                equipType: eq.equipType,
                                equipMake: eq.equipMake,
                                equipModel: eq.equipModel,
                                equipSubModel: eq.equipSubModel,
                                equipRUHieght: eq.equipRUHieght,
                                equipImgFront: eq.equipImgFront,
                                equipImgRear: eq.equipImgRear,
                                equipImgInternal: eq.equipImgInternal,
                                equipFirmware: eq.equipFirmware,
                                equipMobo: eq.equipMobo,
                                equipCPUCount: eq.equipCPUCount,
                                equipCPUCores: eq.equipCPUCores,
                                equipCPUType: eq.equipCPUType,
                                equipMemType: eq.equipMemType,
                                equipMemTotal: eq.equipMemTotal,
                                equipRaidType: eq.equipRaidType,
                                equipRaidLayout: eq.equipRaidLayout,
                                equipHDDCount: eq.equipHDDCount,
                                equipHDDType: eq.equipHDDType,
                                equipNICCount: eq.equipNICCount,
                                equipNICType: eq.equipNICType,
                                equipPSUCount: eq.equipPSUCount,
                                equipPSUDraw: eq.equipPSUDraw,
                                equipAddOns: eq.equipAddOns,
                                equipReceived: strTgs.dateMod(eq.equipReceived),
                                equipAcquisition: strTgs.dateMod(eq.equipAcquisition),
                                equipInService: strTgs.dateMod(eq.equipInService),
                            //    equipEndOfLife: strTgs.dateMod(eq.equipEndOfLife),
                                equipWarrantyMo: eq.equipWarrantyMo,
                                equipPONum: eq.equipPONum,
                                equipInvoice: eq.equipInvoice,
                                equipProjectNum: eq.equipProjectNum,
                                equipLicense: eq.equipLicense,
                                equipMaintAgree: eq.equipMaintAgree,
                                equipPurchaseType: eq.equipPurchaseType,
                                equipPurchaser: eq.equipPurchaser,
                                equipPurchaseTerms: eq.equipPurchaseTerms,
                                equipPurchaseEnd: strTgs.dateMod(eq.equipPurchaseEnd),
                        };     
        }                    
 
        //logger.info(context);
        if (editLoad > 2){
            //logger.info('equipment Edit');
            res.render('asset/equipmentedit', context); 
        }else{
        res.render('asset/equipment', context);  
        }
        });});});});
    }
}
};
    

/* ---------------------------------------------------------------------
-----------------------   New and copy equipment POST working   --------
------------------------------------------------------------------------
*/
exports.dcEquipmentPost = function(req,res){
    // this makes the abbreviation available for the URL
    if (accConfig.accessCheck(req.user).edit !== 1){
    req.session.flash = strTgs.notAuth;
        return res.redirect(303, '/');
    }else{ 
    var data = req.body;
    res.abbreviation = strTgs.cTrim(data.equipSN);
    if(data.isEdit){
    res.abbreviation = strTgs.cTrim(data.isEdit);
    }
    //logger.info('dcRackPost abbreviation>'+res.abbreviation);
    // isEdit and wasCopy = equipment name using #if from handlebars
    if (!data.isEdit){
    if (data.wasCopy){
    res.abbreviation = strTgs.cTrim(data.equipSN);
    }
    //logger.info('new Equipment in DC');
    varPortsNew = function(body){
    if(data.equipPortsAddr[0] !== ''){
    var Ports = [];
    for(i=0;i<body.equipPortType.length;i++){
        //logger.info('equipPortType.length '+body.equipPortType.length);
        Ports[i]=({
            equipPortType: strTgs.sTrim(body.equipPortType[i]),
            equipPortsAddr: strTgs.mTrim(body.equipPortsAddr[i]),
            equipPortName: strTgs.sTrim(body.equipPortName[i]),
            equipPortsOpt: strTgs.sTrim(body.equipPortsOpt[i]),
            });
        }
        return Ports;
    }};
    
    Equipment.create({
            equipPorts: varPortsNew(data),
            equipLocation: strTgs.locComb(data.equipLocationRack,data.equipLocationRu),
            equipSN: strTgs.cTrim(data.equipSN),
            equipAssetTag: strTgs.sTrim(data.equipAssetTag),
            equipTicketNumber: strTgs.clTrim(data.equipTicketNumber),
            equipInventoryStatus: data.equipInventoryStatus,
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
            equipNICCount: strTgs.uTrim(data.equipNICCount),
            equipNICType: strTgs.uTrim(data.equipNICType),
            equipPSUCount: strTgs.uTrim(data.equipPSUCount),
            equipPSUDraw: strTgs.uTrim(data.equipPSUDraw),
            equipAddOns: strTgs.uTrim(data.equipAddOns),
            equipReceived: strTgs.dateAddTZ(data.equipReceived,req.session.ses.timezone),
            equipAcquisition: strTgs.dateAddTZ(data.equipAcquisition,req.session.ses.timezone),
            equipInService: strTgs.dateAddTZ(data.equipInService,req.session.ses.timezone),
            equipEndOfLife: strTgs.dateAddTZ(data.equipEndOfLife,req.session.ses.timezone),
            equipWarrantyMo: data.equipWarrantyMo,
            equipPONum: strTgs.uTrim(data.equipPONum),
            equipInvoice: strTgs.uTrim(data.equipInvoice),
            equipProjectNum: strTgs.uTrim(data.equipProjectNum),
            equipLicense: strTgs.uTrim(data.equipLicense),
            equipMaintAgree: strTgs.uTrim(data.equipMaintAgree),
            equipPurchaseType: strTgs.uTrim(data.equipPurchaseType),
            equipPurchaser: strTgs.uTrim(data.equipPurchaser),
            equipPurchaseTerms: strTgs.uTrim(data.equipPurchaseTerms),
            equipPurchaseEnd: strTgs.dateAddTZ(data.equipPurchaseEnd,req.session.ses.timezone),
            equipNotes: strTgs.uTrim(data.equipNotes),
            createdBy: req.user.local.email,
            createdOn: Date.now(),
            modifiedBy: req.user.local.email,
            modifiedOn: Date.now(),
                    },function(err){
	        if(err) {
	        	logger.warn(err.stack);
                if(err.stack.indexOf ('matching')!=-1){
                req.session.flash = {
	                type: 'danger',
	                intro: 'Duplicate!',
	                message: 'Looks like there is already a Equipment SN by that name.',
	            };
                
                } else { 
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };}
                return res.redirect(303, '/equipment');
	        }
            if (!data.wasCopy){
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: '<a href="/equipment/'+res.abbreviation+'">'+res.abbreviation+'</a> was created.',
                };
	        return res.redirect(303, '/equipment/'+ res.abbreviation);
            } else { 
            req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: '<a href="/equipment/'+res.abbreviation+'">'+res.abbreviation+'</a> was created.',
                };
	        return res.redirect(303, '/equipment/copy~edit-'+ res.abbreviation);

            }
	    }
        );
        
	} else {
    Equipment.findOne({equipSN: req.body.equipSN.toUpperCase()},function(err,eq){
    res.abbreviation = strTgs.cTrim(req.body.equipSN);
    var data = req.body;
    var thisDoc = eq;
       //logger.info('existing id>'+thisDoc);
        if (err) {
            //logger.info(err);
            res.redirect('location/datacenter/'+res.abbreviation);
        } else {
    
    for(i=0;i<data.equipPortType.length;i++){
        
        //logger.info('equip \n PortType >'+data.equipPortType[i] +' - addr >'+ data.equipPortsAddr[i] +' - name >'+ data.equipPortName[i] +' - Opt >'+ data.equipPortsOpt[i]);
        
        if(data.equipPortType[i] === ''){
        //logger.info('equipPortType nonw');
            } else if(data.equipPortId[i] === 'new'){
            //logger.info('new port >'+data.equipPortId[i]);
            eq.equipPorts.push({
            equipPortType: strTgs.sTrim(data.equipPortType[i]),
            equipPortsAddr: strTgs.mTrim(data.equipPortsAddr[i]),
            equipPortName: strTgs.sTrim(data.equipPortName[i]),
            equipPortsOpt: strTgs.sTrim(data.equipPortsOpt[i]),
            });
            }else{
            //logger.info('existing port');
        var thisSubDoc = eq.equipPorts.id(data.equipPortId[i]);
            thisSubDoc.equipPortType = strTgs.uCleanUp(thisSubDoc.equipPortType,data.equipPortType[i]);
            thisSubDoc.equipPortsAddr = strTgs.mCleanUp(thisSubDoc.equipPortsAddr,data.equipPortsAddr[i]);
            thisSubDoc.equipPortName = strTgs.uCleanUp(thisSubDoc.equipPortName,data.equipPortName[i]);
            thisSubDoc.equipPortsOpt = strTgs.uCleanUp(thisSubDoc.equipPortsOpt,data.equipPortsOpt[i]);
        }
    }
    

                        thisDoc.equipLocation = strTgs.locComb(data.equipLocationRack,data.equipLocationRu);
                        thisDoc.equipAssetTag = strTgs.uCleanUp(thisDoc.equipAssetTag,data.equipAssetTag);
                        thisDoc.equipTicketNumber = strTgs.clCleanUp(thisDoc.equipTicketNumber,data.equipTicketNumber);
                        thisDoc.equipInventoryStatus = strTgs.uCleanUp(thisDoc.equipInventoryStatus,data.equipInventoryStatus);
                        thisDoc.equipStatus = strTgs.uCleanUp(thisDoc.equipStatus,data.equipStatus);
                        thisDoc.equipIsVirtual = strTgs.uCleanUp(thisDoc.equipIsVirtual,data.equipIsVirtual);
                        thisDoc.equipType = strTgs.uCleanUp(thisDoc.equipType,data.equipType);
                        thisDoc.equipMake = strTgs.uCleanUp(thisDoc.equipMake,data.equipMake);
                        thisDoc.equipModel = strTgs.uCleanUp(thisDoc.equipModel,data.equipModel);
                        thisDoc.equipSubModel = strTgs.uCleanUp(thisDoc.equipSubModel,data.equipSubModel);
                        thisDoc.equipRUHieght = strTgs.uCleanUp(thisDoc.equipRUHieght,data.equipRUHieght);
                        thisDoc.equipImgFront = strTgs.uCleanUp(thisDoc.equipImgFront,data.equipImgFront);
                        thisDoc.equipImgRear = strTgs.uCleanUp(thisDoc.equipImgRear,data.equipImgRear);
                        thisDoc.equipImgInternal = strTgs.uCleanUp(thisDoc.equipImgInternal,data.equipImgInternal);
                        thisDoc.equipFirmware = strTgs.uCleanUp(thisDoc.equipFirmware,data.equipFirmware);
                        thisDoc.equipMobo = strTgs.uCleanUp(thisDoc.equipMobo,data.equipMobo);
                        thisDoc.equipCPUCount = strTgs.uCleanUp(thisDoc.equipCPUCount,data.equipCPUCount);
                        thisDoc.equipCPUCores = strTgs.uCleanUp(thisDoc.equipCPUCores,data.equipCPUCores);
                        thisDoc.equipCPUType = strTgs.uCleanUp(thisDoc.equipCPUType,data.equipCPUType);
                        thisDoc.equipMemType = strTgs.uCleanUp(thisDoc.equipMemType,data.equipMemType);
                        thisDoc.equipMemTotal = strTgs.uCleanUp(thisDoc.equipMemTotal,data.equipMemTotal);
                        thisDoc.equipRaidType = strTgs.uCleanUp(thisDoc.equipRaidType,data.equipRaidType);
                        thisDoc.equipRaidLayout = strTgs.uCleanUp(thisDoc.equipRaidLayout,data.equipRaidLayout);
                        thisDoc.equipHDDCount = strTgs.uCleanUp(thisDoc.equipHDDCount,data.equipHDDCount);
                        thisDoc.equipHDDType = strTgs.uCleanUp(thisDoc.equipHDDType,data.equipHDDType);
                        thisDoc.equipNICCount = strTgs.uCleanUp(thisDoc.equipNICCount,data.equipNICCount);
                        thisDoc.equipNICType = strTgs.uCleanUp(thisDoc.equipNICType,data.equipNICType);
                        thisDoc.equipPSUCount = strTgs.uCleanUp(thisDoc.equipPSUCount,data.equipPSUCount);
                        thisDoc.equipPSUDraw = strTgs.uCleanUp(thisDoc.equipPSUDraw,data.equipPSUDraw);
                        thisDoc.equipAddOns = strTgs.uCleanUp(thisDoc.equipAddOns,data.equipAddOns);
                        thisDoc.equipReceived = strTgs.dCleanup(thisDoc.equipReceived,data.equipReceived,req.session.ses.timezone);
                        thisDoc.equipAcquisition = strTgs.dCleanup(thisDoc.equipAcquisition,data.equipAcquisition,req.session.ses.timezone);
                        thisDoc.equipInService = strTgs.dCleanup(thisDoc.equipInService,data.equipInService,req.session.ses.timezone);
                        thisDoc.equipEndOfLife = strTgs.dCleanup(thisDoc.equipEndOfLife,data.equipEndOfLife,req.session.ses.timezone);
                        thisDoc.equipWarrantyMo = strTgs.uCleanUp(thisDoc.equipWarrantyMo,data.equipWarrantyMo);
                        thisDoc.equipPONum = strTgs.uCleanUp(thisDoc.equipPONum,data.equipPONum);
                        thisDoc.equipInvoice = strTgs.uCleanUp(thisDoc.equipInvoice,data.equipInvoice);
                        thisDoc.equipProjectNum = strTgs.uCleanUp(thisDoc.equipProjectNum,data.equipProjectNum);
                        thisDoc.equipLicense = strTgs.uCleanUp(thisDoc.equipLicense,data.equipLicense);
                        thisDoc.equipMaintAgree = strTgs.uCleanUp(thisDoc.equipMaintAgree,data.equipMaintAgree);
                        thisDoc.equipPurchaseType = strTgs.uCleanUp(thisDoc.equipPurchaseType,data.equipPurchaseType);
                        thisDoc.equipPurchaser = strTgs.uCleanUp(thisDoc.equipPurchaser,data.equipPurchaser);
                        thisDoc.equipPurchaseTerms = strTgs.uCleanUp(thisDoc.equipPurchaseTerms,data.equipPurchaseTerms);
                        thisDoc.equipPurchaseEnd = strTgs.dCleanup(thisDoc.equipPurchaseEnd,data.equipPurchaseEnd,req.session.ses.timezone);
                        thisDoc.equipNotes = strTgs.uCleanUp(thisDoc.equipNotes,data.equipNotes);
                        thisDoc.modifiedOn = Date.now();
                        thisDoc.modifiedBy = req.user.local.email;
                    }
	    eq.save(function(err){
	        if(err) {
	        	logger.error(err.stack);
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };
	            return res.redirect(303, '/equipment/'+ res.abbreviation);
	        }
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
	        };
	        return res.redirect(303, '/equipment/'+ res.abbreviation);
	    });
	});
}
}
};
  



exports.dcEquipPortPostAJAX = function(req,res){

};

// --------------------------------------------------------------------
//                   working to display list of Equipment w/ systems
//          will not show systems without equipment
// ---------------------------------------------------------------------

exports.dcEquipSysPages = function(req,res,next){
    if (accConfig.accessCheck(req.user).read !== 1){
    req.session.flash = strTgs.notAuth;
        return res.redirect(303, '/');
    }else{ 
    //logger.info('***********exports.dcEquipSysPages First >' +req.params.datacenter);
    if (!req.params.datacenter){
    //logger.info('in EquipSysPages - List');
    // this looks for 'list' as the / url. if it exists, it prints the datacenter list
        Equipment.find({}).exec(function(err, eqs){
        if(err) return next(err);
        if(!eqs) return next();
        //logger.info(eqs);
        Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus systemTicket systemNotes modifiedOn',function(err, sys){
        
        if(err) return next(err);
        if(!sys) return next();
        //logger.info('SYS >>>>>>>>>>>'+sys);

            var context = {
                access : accConfig.accessCheck(req.user),
                user : req.user,
                requrl : req.url,
               eqs: eqs.map(function(eq){
                 tempSys = strTgs.findThisInThatMulti(eq.equipSN,sys,'systemEquipSN');
                  return {
                            //titleNow:dc.abbreviation,
                            equipLocation: eq.equipLocation,
                            equipLocationRack: strTgs.ruToLocation(eq.equipLocation),
                            equipSN: eq.equipSN,
                            equipTicketNumber: eq.equipticketNumber,
                            equipInventoryStatus: strTgs.trueFalseIcon(eq.equipInventoryStatus,eq.equipticketNumber),
                            equipStatus: eq.equipStatus,
                            equipStatusLight: strTgs.trueFalseIcon(eq.equipStatus,eq.equipStatus),
                            equipType: eq.equipType,
                            equipMake: eq.equipMake,
                            equipModel: eq.equipModel,
                            equipSubModel: eq.equipSubModel,
                            equipAddOns: eq.equipAddOns,
                            equipRUHieght: eq.equipRUHieght,
                            equipReceived: strTgs.dateMod(eq.equipReceived),
                            equipPONum: eq.equipPONum,
                            equipInvoice: eq.equipInvoice,
                            equipProjectNum: eq.equipProjectNum,
                            equipAcquisition: strTgs.dateMod(eq.equipAcquisition),
                            equipNotes: eq.equipNotes,
                            createdOn: strTgs.dateMod(eq.createdOn),
                            modifiedOn: strTgs.dateMod(eq.modifiedOn),
                            equipPorts: eq.equipPorts.map(function(ep){
                           return {
                                equipPortsId: ep.id,
                                equipPortType: ep.equipPortType,
                                equipPortsAddr: ep.equipPortsAddr,
                                equipPortName: ep.equipPortName,
                                equipPortsOpt: ep.equipPortsOpt,
                                createdBy: ep.createdBy,
                                createdOn: strTgs.dateMod(ep.createdOn),
                                modifiedby: ep.modifiedbBy,
                                modifiedOn: strTgs.dateMod(ep.modifiedOn),
                            };
                            }),
                            
                            systemName: tempSys.systemName,
                            systemEnviron: tempSys.systemEnviron,
                            systemRole: tempSys.systemRole,
                            systemStatus: strTgs.trueFalseIcon(tempSys.systemStatus,tempSys.systemStatus),
                            systemTicket: tempSys.systemTicket,
                            systemNotes: tempSys.systemNotes,
                            sysmodifiedOn: strTgs.dateMod(tempSys.modifiedOn),
                            
                    };
                })
            };
           //logger.info('context List >>>>>> '+context.toString());
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/equipsys-list', context);
        });});
    } else { 
    // little regex to get the contains rack location
    var re = new RegExp(req.params.datacenter, 'i');
    Equipment.find({equipLocation:  { $regex: re }}).sort({equipLocation:-1}).exec(function(err, eqs){
        if(err) return next(err);
        if(!eqs) return next();
       //logger.info('eqs'+eqs);
        Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus systemTicket systemNotes modifiedOn',function(err, sys){
        
        if(err) return next(err);
        if(!sys) return next();
        //logger.info('SYS >>>>>>>>>>>'+sys);

            var context = {
                access : accConfig.accessCheck(req.user),
                user : req.user,
                requrl : req.url,
                        rackView: req.params.datacenter,
                        menu1: req.params.datacenter,
                        menuLink1: '/location/rack/'+req.params.datacenter,
                        titleNow: req.params.datacenter,
               eqs: eqs.map(function(eq){
                 tempSys = strTgs.findThisInThatMulti(eq.equipSN,sys,'systemEquipSN');
                  return {                      
                            equipLocation: eq.equipLocation,
                            equipLocationRack: strTgs.ruToLocation(eq.equipLocation),
                            equipSN: eq.equipSN,
                            equipRUHieght: eq.equipRUHieght,
                            equipTicketNumber: eq.equipticketNumber,
                            equipInventoryStatus: strTgs.trueFalseIcon(eq.equipInventoryStatus,eq.equipticketNumber),
                            equipStatus: eq.equipStatus,
                            equipStatusLight: strTgs.trueFalseIcon(eq.equipStatus,eq.equipStatus),
                            equipIsVirtual: eq.equipIsVirtual,
                            equipType: eq.equipType,
                            equipMake: eq.equipMake,
                            equipModel: eq.equipModel,
                            equipSubModel: eq.equipSubModel,
                            equipAddOns: eq.equipAddOns,
                            equipReceived: strTgs.dateMod(eq.equipReceived),
                            equipPONum: eq.equipPONum,
                            equipInvoice: eq.equipInvoice,
                            equipProjectNum: eq.equipProjectNum,
                            equipAcquisition: strTgs.dateMod(eq.equipAcquisition),
                            equipNotes: eq.equipNotes,
                            createdOn: strTgs.dateMod(eq.createdOn),
                            modifiedOn: strTgs.dateMod(eq.modifiedOn),
                            equipPorts: eq.equipPorts.map(function(ep){
                           return {
                                equipPortsId: ep.id,
                                equipPortType: ep.equipPortType,
                                equipPortsAddr: ep.equipPortsAddr,
                                equipPortName: ep.equipPortName,
                                equipPortsOpt: ep.equipPortsOpt,
                                createdBy: ep.createdBy,
                                createdOn: strTgs.dateMod(ep.createdOn),
                                modifiedby: ep.modifiedbBy,
                                modifiedOn: strTgs.dateMod(ep.modifiedOn),
                            };
                            }),
                            systemName: tempSys.systemName,
                            systemEnviron: tempSys.systemEnviron,
                            systemRole: tempSys.systemRole,
                            systemStatus: strTgs.trueFalseIcon(tempSys.systemStatus,tempSys.systemStatus),
                            systemTicket: tempSys.systemTicket,
                            systemNotes: tempSys.systemNotes,
                            sysmodifiedOn: strTgs.dateMod(tempSys.modifiedOn),
                    };
                })
            };
           //logger.info('context Rack >>>>>> '+context.toString());
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/equipsys-list', context);
        });});
    }
}
};


// --------------------------------------------------------------------
//                   working to display list of Equipment w/ systems
//          will not show systems without equipment
//            first half does table version, second half does SVG version
// ---------------------------------------------------------------------

exports.dcRackElevationPage = function(req,res,next){
        if (accConfig.accessCheck(req.user).read !== 1){
          req.session.flash = strTgs.notAuth;
        return res.redirect(303, '/');
    }else{ 
    //logger.info('***********exports.dcRackElevationPage First >' +req.params.datacenter);
    if (!req.params.datacenter){
    //logger.info('in EquipSysPages - List');
    // this looks for 'list' as the / url. if it exists, it prints the datacenter list
        Equipment.find({}).exec(function(err, eqs){
        if(err) return next(err);
        if(!eqs) return next();
        //logger.info(eqs);
        Systemdb.find({}, 'systemName systemEquipSN systemEnviron systemRole systemInventoryStatus systemTicket systemNotes systemStatus modifiedOn',function(err, sys){
        
        if(err) return next(err);
        if(!sys) return next();
        //logger.info('SYS >>>>>>>>>>>'+sys);

            var context = {
                access : accConfig.accessCheck(req.user),
                user : req.user,
                requrl : req.url,
               eqs: eqs.map(function(eq){
                 tempSys = strTgs.findThisInThatMulti(eq.equipSN,sys,'systemEquipSN');
                 
                 
                  
                  return {
                            
                            equipLocation: eq.equipLocation,
                            equipLocationRack: strTgs.ruToLocation(eq.equipLocation),
                            equipSN: eq.equipSN,
                            equipTicketNumber: eq.equipticketNumber,
                            equipInventoryStatus: strTgs.trueFalseIcon(eq.equipInventoryStatus,eq.equipticketNumber),
                            equipStatus: eq.equipStatus,
                            equipStatusLight: strTgs.trueFalseIcon(eq.equipStatus,eq.equipStatus),
                            equipType: eq.equipType,
                            equipMake: eq.equipMake,
                            equipModel: eq.equipModel,
                            equipSubModel: eq.equipSubModel,
                            equipAddOns: eq.equipAddOns,
                            equipReceived: strTgs.dateMod(eq.equipReceived),
                            equipPONum: eq.equipPONum,
                            equipProjectNum: eq.equipProjectNum,
                            createdOn: strTgs.dateMod(eq.createdOn),
                            modifiedOn: strTgs.dateMod(eq.modifiedOn),
                            equipPorts: eq.equipPorts.map(function(ep){
                           return {
                                equipPortsId: ep.id,
                                equipPortType: ep.equipPortType,
                                equipPortsAddr: ep.equipPortsAddr,
                                equipPortName: ep.equipPortName,
                                equipPortsOpt: ep.equipPortsOpt,
                                createdBy: ep.createdBy,
                                createdOn: strTgs.dateMod(ep.createdOn),
                                modifiedby: ep.modifiedbBy,
                                modifiedOn: strTgs.dateMod(ep.modifiedOn),
                            };
                            }),
                            
                            systemName: tempSys.systemName,
                            systemEnviron: tempSys.systemEnviron,
                            systemRole: tempSys.systemRole,
                            systemStatus: strTgs.trueFalseIcon(tempSys.systemStatus,tempSys.systemStatus),
                            sysmodifiedOn: strTgs.dateMod(tempSys.modifiedOn),
                            
                    };
                })
            };
           //logger.info('context List >>>>>> '+context.toString());
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/elevation', context);
        });});
    } else { 
    // little regex to get the contains rack location
    var re = new RegExp(req.params.datacenter, 'i');
    Equipment.find({equipLocation:  { $regex: re }}).sort({equipLocation:1}).exec(function(err, eqs){
        if(err) return next(err);
        if(!eqs) return next();
       //logger.info('eqs'+eqs);
        Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus modifiedOn',function(err, sys){
        
        if(err) return next(err);
        if(!sys) return next();
        //logger.info('SYS >>>>>>>>>>>'+sys);
        Rack.findOne({rackUnique: { $regex: re }},'rackUnique rackDescription rackHeight rackWidth rackDepth rackLat rackLon rackRow rackStatus rUs',function(err,rk){
        //logger.info('rk >>>>>>>>>>>'+rk);
        //logger.info('rk.rackUnique>'+rk.rackUnique);
            var context = {
                access : accConfig.accessCheck(req.user),
                user : req.user,
                requrl : req.url,
                rackView: req.params.datacenter,
                rackUnique: rk.rackUnique,
                rackDescription: rk.rackDescription,
                rackHeight: rk.rackHeight,
                rackWidth: rk.rackWidth,
                rackDepth: rk.rackDepth,
                rackLat: rk.rackLat,
                rackLon: rk.rackLon,
                rackRow: rk.rackRow,
                rackStatus: rk.rackStatus,
                rUs: rk.rUs,
                menu1: rk.rackUnique,
                menuLink1: '/location/rack/'+rk.rackUnique,
                titleNow: rk.rackUnique,

                eqs: eqs.map(function(eq){
                tempSys = strTgs.findThisInThatMulti(eq.equipSN,sys,'systemEquipSN');
                var test = strTgs.ruElevation(eq.equipLocation);
                if(isNaN(test)===true){
                eq.equipLocation = 1;
                }
                var fullRack;
                if(eq.equipType === 'Full Rack'){
                    fullRack = 0.8;
                    logger.info('fullRack 1 '+ fullRack);
                 }
                  return {
                            fullRack : fullRack,
                            equipLocation: eq.equipLocation,
                            equipLocationRack: strTgs.ruToLocation(eq.equipLocation),
                            equipLocationRu: strTgs.ruElevation(eq.equipLocation),
                            equipSN: eq.equipSN,
                            equipRUHieght: strTgs.checkNull(eq.equipRUHieght),
                            equipTicketNumber: eq.equipticketNumber,
                            equipInventoryStatus: strTgs.trueFalseIcon(eq.equipInventoryStatus,eq.equipticketNumber),
                            equipStatus: eq.equipStatus,
                            equipStatusLight: strTgs.trueFalseD3(eq.equipStatus,eq.equipStatus),
                            equipIsVirtual: eq.equipIsVirtual,
                            equipType: eq.equipType,
                            equipTypeColor: strTgs.equipTypeColor(eq.equipType),
                            equipMake: eq.equipMake,
                            equipModel: eq.equipModel,
                            equipSubModel: eq.equipSubModel,
                            equipReceived: strTgs.dateMod(eq.equipReceived),
                            equipPONum: eq.equipPONum,
                            equipProjectNum: eq.equipProjectNum,
                            createdOn: strTgs.dateMod(eq.createdOn),
                            modifiedOn: strTgs.dateMod(eq.modifiedOn),
                            equipPorts: eq.equipPorts.map(function(ep){
                           return {
                                equipPortsId: ep.id,
                                equipPortType: ep.equipPortType,
                                equipPortsAddr: ep.equipPortsAddr,
                                equipPortName: ep.equipPortName,
                                equipPortsOpt: ep.equipPortsOpt,
                                createdBy: ep.createdBy,
                                createdOn: strTgs.dateMod(ep.createdOn),
                                modifiedby: ep.modifiedbBy,
                                modifiedOn: strTgs.dateMod(ep.modifiedOn),
                            };
                            }),
                            systemName: tempSys.systemName,
                            systemEnviron: tempSys.systemEnviron,
                            systemRole: tempSys.systemRole,
                            systemStatus: strTgs.trueFalseIcon(tempSys.systemStatus,tempSys.systemStatus),
                            sysmodifiedOn: strTgs.dateMod(tempSys.modifiedOn),
                    };
                })
            };
           //logger.info('context Rack >>>>>> '+context.rackUnique);
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/elevation', context);
        });});});
    }
}
};

/*---------------------------------------------------------------------
---------------------------- Equipment SN Change ----------------------
-----------------------------------------------------------------------
*/

exports.dcEquipSNChange =  function(req,res){
    if (accConfig.accessCheck(req.user).delete !== 1){
      req.session.flash = strTgs.notAuth;
        return res.redirect(303, '/');
    }else{
//    logger.info('req.params.datacenter >>>>>> '+req.params.datacenter);
    Equipment.findOne({equipSN: req.params.datacenter},function(err,eq){
        if(err) return next(err);
        if(!eq) return next(err);
    Systemdb.find({}, 'systemEquipSN systemName',function(err, sys){
        tempSys = strTgs.findThisInThatMulti(eq.equipSN,sys,'systemEquipSN');

             context = {
                access : accConfig.accessCheck(req.user),
                user : req.user,
                requrl : req.url, 
                    menu1: eq.equipSN,
                    menuLink1: '#',
                    titleNow:eq.equipSN,
                    equipId: eq._id,
                    oldEquipSN: eq.equipSN,
                    systemName: tempSys.systemName,
                    }; 
        res.render('asset/equipmentsnchange', context);
});});
}
};



exports.dcEquipSNChangePost =  function(req,res){

//logger.info('got this far');
    if (accConfig.accessCheck(req.user).delete !== 1){
      req.session.flash = strTgs.notAuth;
        return res.redirect(303, '/');
    }else{
        res.oldEquipSN = req.body.oldEquipSN;
        res.equipSN = req.body.equipSN;
//logger.info('res. stuff'+res.oldEquipSN+' and '+res.equipSN+' for '+req.body.equipId);
        if (req.body.oldEquipSN){

        async.waterfall([
            function (callback) {
                Equipment.findOne({equipSN: res.oldEquipSN},function(err,equipSNtoChange){
                if(err){ 
                    //logger.info(err);
                    callback(null);
                }else{
                    equipSNtoChange.equipSN = strTgs.cTrim(res.equipSN);
                    equipSNtoChange.save(function(err){
                    if (err){
                        //logger.log('validation error');
                        //logger.error(err.stack);
                        return callback(err, 'validation error');
                    }else{
                        //logger.info('SN Updated');
                        callback(null,'EquipSN Updated');
                    }});}});},
            function (arg1,callback) {
                Systemdb.update ({systemEquipSN: res.oldEquipSN}, {systemEquipSN: res.equipSN}, {multi: true}, function(err){
                        if (err){
                        //logger.error(err.stack);
                        callback(null,arg1,'sysEquipSN Failed');
                    }
                        //logger.info('Some sysEquipSN Updated');
                        callback(null,'EquipSN Updated');
                    });
                }
            ], function (err,result){
                if(err) {
                logger.error(err.stack);
                req.session.flash = {
                    type: 'danger',
                    intro: 'Ooops!',
                    message: 'There was an error processing your request.',
                };
                return res.redirect(303, '/equipment/edit-'+ strTgs.cTrim(res.oldEquipSN));
            }
            req.session.flash = {
                type: 'success',
                intro: 'Thank you!',
                message: 'The SN has been changed.',
            };
            return res.redirect(303, '/equipment/edit-'+ strTgs.cTrim(res.equipSN));
});
}
}};




/*---------------------------------------------------------------------
---------------------------- Equipment Delete ------------------------------
------------------------------------------------------------------------
*/
exports.dcEquipDelete = function(req,res){
    if (accConfig.accessCheck(req.user).delete !== 1){
      req.session.flash = strTgs.notAuth;
        return res.redirect(303, '/');
    }else{ 
    
    res.abbreviation = req.body.equipSN;
    res.newpage = req.body.equipLocationRack;
if (req.body.equipSN){
        //logger.info('delete got this far');
        Equipment.findOne({equipSN: req.body.equipSN},function(err,equipSNtodelete){
        if(err){
        //logger.info(err);
        //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        }else{
            equipSNtodelete.remove(function(err){
                if(err){
                logger.info(err);
                req.session.flash = {
                        type: 'danger',
                        intro: 'Ooops!',
                        message: 'Something went wrong, '+ req.body.equipSNtodelete +' was not deleted.',
                    };
                    return res.redirect(303, '/location/equipment/'+ res.abbreviation);
                } else {
                    req.session.flash = {
                    type: 'success',
                    intro: 'Done!',
                    message: 'Equipment '+ res.abbreviation +' has been deleted. Good luck with that one',
                };
                return (res.newpage ==='')? res.redirect(303,'/') :  res.redirect(303, '/equipment-systems/'+res.newpage);
                }
            });
        }
    });
}
}
};

/* ---------------------------------------------------------------------
-------------------    equipPorts Delete   --------------------------------
------------------------------------------------------------------------
*/

exports.equipSubDelete = function(req,res){
if (accConfig.accessCheck(req.user).delete !== 1){
    req.session.flash = strTgs.notAuth;
        return res.redirect(303, '/');
    }else{ 

    res.abbreviation = req.body.abbreviation;
if (req.body.id && req.body.subId){
    Equipment.findById(req.body.id,req.body.subDoc,function (err, eq){
        if(err){
        logger.info(err);
        //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        }else{
            eq.equipPorts.id(req.body.subId).remove();
            eq.save(function(err){
                if(err){
                logger.info(err);
                req.session.flash = {
                        type: 'danger',
                        intro: 'Ooops!',
                        message: 'Something went wrong',
                    };
                    return res.redirect(303, '/equipment/edit-'+ res.abbreviation);
                } else {
                    req.session.flash = {
                    type: 'success',
                    intro: 'Done!',
                    message: 'The port has been deleted.',
                };
                return res.redirect(303, '/equipment/edit-'+ res.abbreviation);
                }
            });
        }
    });
}
}
};