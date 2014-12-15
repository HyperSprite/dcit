
var     logger = require("winston"),
        strTgs = require('../lib/stringThings.js'),
      ObjectId = require('mongoose').Types.ObjectId;

// Models
var Datacenter = require('../models/datacenter.js'),
          Rack = require('../models/rack.js'),
     Optionsdb = require('../models/options.js'),
     Equipment = require('../models/equipment.js'),
      Systemdb = require('../models/system.js');


var start  = "",
    editLoad =0,
    dcabbr = "",
    dcInfo = "",
    dcInfoSplit = "",
    dcSubId = "",
    dcId ="";


//---------------------------------------------------------------------     
//----------------------   Equipment List  ----------------------------
//--------------------------------------------------------------------- 
/*
this is the Equip List block. Looks for "List" in the URL and returns list of Equipment.
*/
exports.dcEquipPages = function(req,res,next){
    logger.info('***********exports.dcEquipPages First >' +req.params.datacenter);
    if (!req.params.datacenter ){
    logger.info("in List");
    // this looks for "list" as the / url. if it exists, it prints the datacenter list
        Equipment.find({}).sort({'modifiedOn': 'desc'}).exec(function(err, eqs){
        if(err){
        logger.info(err);
        }else{
            var context = {
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
                            equipRecieved: strTgs.dateMod(eq.equipRecieved),
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
    } else if (req.params.datacenter.indexOf ("circuit") !=-1){
        logger.info('else if (req.params.datacenter.indexOf ("circuit")');
        logger.info("rack "+req.params.datacenter);
        start = req.params.datacenter.indexOf ("~")+1;
            logger.info("|start   >"+start);
        dcInfo = req.params.datacenter.substring (start);
            logger.info("|dcInfo  >"+dcInfo);
        dcSplit = dcInfo.indexOf (">");
            logger.info("|dcSplit >"+dcSplit);
        dcSubId = dcInfo.substring (dcSplit+1);
            logger.info("|dcSubId >"+dcSubId);
        dcId = dcInfo.substring (0,dcSplit);
            logger.info("|dcId    >"+dcId);
        
        
        
        Rack.findOne({rackUnique: dcId},function(err,rk){
        if(err)return next(err);
        Datacenter.find({},'_id fullName abbreviation foundingCompany powerNames cages._id cages.cageNickname cages.cageAbbreviation cages.cageName',function(err,datacenter){
        if(err) return next(err);
        
        
        var uber = strTgs.findCGParent(rk.rackParentCage,datacenter);
        var context;
        if (dcSubId === 'new'){
            context ={
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
        
        if (req.params.datacenter.indexOf ("copy") !=-1){
           //logger.info(rk);
                context ={
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


    } else if (req.params.datacenter.indexOf ("new") !=-1){
        logger.info('else if (req.params.datacenter.indexOf ("newequip")');
        logger.info("datacenter "+req.params.datacenter);
        start = req.params.datacenter.indexOf ("-")+1;
            logger.info("|start   >"+start);
        dcId = req.params.datacenter.substring (start);
        
            logger.info("|dcId    >"+dcId);

    Optionsdb.find({}, 'optListKey optListArray',function(err,opt){
        if(err)return next(err);
        

    Rack.find({},{ 'rUs':1,'rackUnique':1,'_id': 0},{sort:{rackUnique:1}},function(err, rk){
        if(err) return next(err);
        if(!rk) return next();
        //logger.info("rk"+rk);
        var rackUni=[];
        for(i=0;i<rk.length;i++){
        rackUni[i] = rk[i].rackUnique;
        //logger.info("rackUni >"+rackUni[i]);
        }
        
        //var RuTemp = 52;
        var getRackrUs = function(RuTemp){
           //logger.info("getRackrUs"+RuTemp);
            var tempRu=[];
            for(i=0;i<RuTemp;i++){
            tempRu[i]=strTgs.pad([i]);
        }
            //logger.info("getRackrUs>> "+tempRu);
        return tempRu; 
        };
            context ={
                optSystPortType: strTgs.findThisInThatOpt('optSystPortType',opt),
                optEquipStatus: strTgs.findThisInThatOpt('optEquipStatus',opt),
                optEquipType: strTgs.findThisInThatOpt('optEquipType',opt),
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

    if (req.params.datacenter.indexOf ("edit") !=-1){
        logger.info('else if (req.params.datacenter.indexOf ("edit")');
    // this section decides if it is a Copy, Edit or View
        start = req.params.datacenter.indexOf ("-");
        dcabbr = req.params.datacenter.substring (start+1);
            if (req.params.datacenter.indexOf ("copy") !=-1){
            editLoad = 5;
            logger.info("copy equip "+dcabbr);
        } else {
            editLoad = 3;
            logger.info("edit equip "+dcabbr);
        }
        } else {
            editLoad = 1;
            dcabbr = req.params.datacenter;
            logger.info("view equip "+dcabbr);
        }
        
  
    Equipment.findOne({equipSN: dcabbr},function(err,eq){
        if(err) return next(err);
        if(!eq) return next();
        //logger.info(datacenter);
    //Optionsdb.findOne({optListKey: "optEquipStatus"},function(err,opt){
    //    if(err)return next(err);
    
    Optionsdb.find({}, 'optListKey optListArray',function(err,opt){
        if(err)return next(err);
        

    Rack.find({},{ 'rUs':1,'rackUnique':1,'_id': 0},{sort:{rackUnique:1}},function(err, rk){
        if(err) return next(err);
        if(!rk) return next();
        //logger.info("rk"+rk);
        var rackUni=[];
        for(i=0;i<rk.length;i++){
        rackUni[i] = rk[i].rackUnique;
        //logger.info("rackUni >"+rackUni[i]);
        }
        
        //var RuTemp = 52;
        var getRackrUs = function(RuTemp){
           //logger.info("getRackrUs"+RuTemp);
            var tempRu=[];
            for(i=0;i<RuTemp;i++){
            tempRu[i]=strTgs.pad([i]);
        }
            //logger.info("getRackrUs>> "+tempRu);
        return tempRu; 
        };
        //logger.info("rackUni >"+rackUni);

       //logger.info ('Equipment.findOne '+dcabbr);
        
        if(editLoad < 4){


             context = {    
                                menu1: eq.equipSN,
                                menuLink1: "#",
                                titleNow:eq.equipSN,
                                optSystPortType: strTgs.findThisInThatOpt('optSystPortType',opt),
                                optEquipStatus: strTgs.findThisInThatOpt('optEquipStatus',opt),
                                optEquipType: strTgs.findThisInThatOpt('optEquipType',opt),
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
                                equipPSUCount: eq.equipPSUCount,
                                equipPSUDraw: eq.equipPSUDraw,
                                equipAddOns: eq.equipAddOns,
                                equipRecieved: strTgs.dateMod(eq.equipRecieved),
                                equipAcquisition: strTgs.dateMod(eq.equipAcquisition),
                                equipInService: strTgs.dateMod(eq.equipInService),
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
                        }; 
        
        } else {
           context = {    
                                optSystPortType: strTgs.findThisInThatOpt('optSystPortType',opt),
                                optEquipStatus: strTgs.findThisInThatOpt('optEquipStatus',opt),
                                optEquipType: strTgs.findThisInThatOpt('optEquipType',opt),
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
                                equipPSUCount: eq.equipPSUCount,
                                equipPSUDraw: eq.equipPSUDraw,
                                equipAddOns: eq.equipAddOns,
                                equipRecieved: strTgs.dateMod(eq.equipRecieved),
                                equipAcquisition: strTgs.dateMod(eq.equipAcquisition),
                                equipInService: strTgs.dateMod(eq.equipInService),
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
            logger.info("equipment Edit");
            res.render('asset/equipmentedit', context); 
        }else{
        res.render('asset/equipment', context);  
        }
        });});});
    }
};
    

/* ---------------------------------------------------------------------
-----------------------   New and copy equipment POST working   --------
------------------------------------------------------------------------
*/
exports.dcEquipmentPost = function(req,res){
    // this makes the abbreviation available for the URL
    res.abbreviation = strTgs.cTrim(req.body.equipSN);
    if(req.body.isEdit){
    res.abbreviation = strTgs.cTrim(req.body.isEdit);
    }
    logger.info("dcRackPost abbreviation>"+res.abbreviation);
    // isEdit and wasCopy = equipment name using #if from handlebars
    if (!req.body.isEdit){
    if (req.body.wasCopy){
    res.abbreviation = strTgs.cTrim(req.body.equipSN);
    }
    logger.info("new Equipment in DC");
    varPortsNew = function(body){
    if(typeof req.body.equipPortsAddr[i] !== 'undefined'){
    var Ports = [];
    for(i=0;i<body.equipPortType.length;i++){
        logger.info("equipPortType.length "+body.equipPortType.length);
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
                                equipPorts: varPortsNew(req.body),
                                equipLocation: strTgs.locComb(req.body.equipLocationRack,req.body.equipLocationRu),
                                equipSN: strTgs.cTrim(req.body.equipSN),
                                equipAssetTag: strTgs.sTrim(req.body.equipAssetTag),
                                equipTicketNumber: strTgs.sTrim(req.body.equipTicketNumber),
                                equipInventoryStatus: req.body.equipInventoryStatus,
                                equipStatus: strTgs.uTrim(req.body.equipStatus),
                                equipIsVirtual: req.body.equipIsVirtual,
                                equipType: strTgs.uTrim(req.body.equipType),
                                equipMake: strTgs.uTrim(req.body.equipMake),
                                equipModel: strTgs.uTrim(req.body.equipModel),
                                equipSubModel: strTgs.uTrim(req.body.equipSubModel),
                                equipRUHieght: strTgs.uTrim(req.body.equipRUHieght),
                                equipImgFront: strTgs.uTrim(req.body.equipImgFront),
                                equipImgRear: strTgs.uTrim(req.body.equipImgRear),
                                equipImgInternal: strTgs.uTrim(req.body.equipImgInternal),
                                equipFirmware: strTgs.uTrim(req.body.equipFirmware),
                                equipMobo: strTgs.uTrim(req.body.equipMobo),
                                equipCPUCount: strTgs.uTrim(req.body.equipCPUCount),
                                equipCPUCores: strTgs.uTrim(req.body.equipCPUCores),
                                equipCPUType: strTgs.uTrim(req.body.equipCPUType),
                                equipMemType: strTgs.uTrim(req.body.equipMemType),
                                equipMemTotal: strTgs.uTrim(req.body.equipMemTotal),
                                equipRaidType: strTgs.uTrim(req.body.equipRaidType),
                                equipRaidLayout: strTgs.uTrim(req.body.equipRaidLayout),
                                equipHDDCount: strTgs.uTrim(req.body.equipHDDCount),
                                equipHDDType: strTgs.uTrim(req.body.equipHDDType),
                                equipPSUCount: strTgs.uTrim(req.body.equipPSUCount),
                                equipPSUDraw: strTgs.uTrim(req.body.equipPSUDraw),
                                equipAddOns: strTgs.uTrim(req.body.equipAddOns),
                                equipRecieved: strTgs.uTrim(req.body.equipRecieved),
                                equipAcquisition: strTgs.uTrim(req.body.equipAcquisition),
                                equipInService: strTgs.uTrim(req.body.equipInService),
                                equipPONum: strTgs.uTrim(req.body.equipPONum),
                                equipInvoice: strTgs.uTrim(req.body.equipInvoice),
                                equipProjectNum: strTgs.uTrim(req.body.equipProjectNum),
                                equipLicense: strTgs.uTrim(req.body.equipLicense),
                                equipMaintAgree: strTgs.uTrim(req.body.equipMaintAgree),
                                equipPurchaseType: strTgs.uTrim(req.body.equipPurchaseType),
                                equipPurchaser: strTgs.uTrim(req.body.equipPurchaser),
                                equipPurchaseTerms: strTgs.uTrim(req.body.equipPurchaseTerms),
                                equipPurchaseEnd: strTgs.uTrim(req.body.equipPurchaseEnd),
                                equipNotes: strTgs.uTrim(req.body.equipNotes),
                                createdBy:'Admin',
                                createdOn: Date.now(),
                                modifiedBy: req.body.modifiedBy,
                                modifiedOn: Date.now(),
                    },function(err){
	        if(err) {
	        	console.error(err.stack);
                if(err.stack.indexOf ('matching')!=-1){
                req.session.flash = {
	                type: 'danger',
	                intro: 'Duplicate!',
	                message: 'Looks like there is already a Equipment SN like that.',
	            };
                
                } else { 
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };}
                return res.redirect(303, '/equipment');
	        }
            if (!req.body.wasCopy){
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
                };
	        return res.redirect(303, '/equipment/'+ res.abbreviation);
            } else { 
            req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
                };
	        return res.redirect(303, '/equipment/copy~edit-'+ res.abbreviation);

            }
	    }
        );
        
	} else {
    Equipment.findOne({equipSN: req.body.equipSN.toUpperCase()},function(err,eq){
    res.abbreviation = strTgs.cTrim(req.body.equipSN);
    var thisDoc = eq;
       //logger.info("existing id>"+thisDoc);
        if (err) {
            logger.info(err);
            res.redirect('location/datacenter/'+res.abbreviation);
        } else {
    
    for(i=0;i<req.body.equipPortType.length;i++){
        logger.info("equip \n PortType >"+req.body.equipPortType[i] +" - addr >"+ req.body.equipPortsAddr[i] +" - name >"+ req.body.equipPortName[i] +" - Opt >"+ req.body.equipPortsOpt[i]);
        
        if(req.body.equipPortType[i] === ''){
        logger.info("equipPortType nonw");
            } else if(req.body.equipPortId[i] === "new"){
            logger.info("new port >"+req.body.equipPortId[i]);
            eq.equipPorts.push({
            equipPortType: strTgs.sTrim(req.body.equipPortType[i]),
            equipPortsAddr: strTgs.mTrim(req.body.equipPortsAddr[i]),
            equipPortName: strTgs.sTrim(req.body.equipPortName[i]),
            equipPortsOpt: strTgs.sTrim(req.body.equipPortsOpt[i]),
            });
            }else{
            logger.info("existing port");
        var thisSubDoc = eq.equipPorts.id(req.body.equipPortId[i]);
            thisSubDoc.equipPortType = strTgs.uCleanUp(thisSubDoc.equipPortType,req.body.equipPortType[i]);
            thisSubDoc.equipPortsAddr = strTgs.mCleanUp(thisSubDoc.equipPortsAddr,req.body.equipPortsAddr[i]);
            thisSubDoc.equipPortName = strTgs.uCleanUp(thisSubDoc.equipPortName,req.body.equipPortName[i]);
            thisSubDoc.equipPortsOpt = strTgs.uCleanUp(thisSubDoc.equipPortsOpt,req.body.equipPortsOpt[i]);
        }
    }
    

                        thisDoc.equipLocation = strTgs.locComb(req.body.equipLocationRack,req.body.equipLocationRu);
                        thisDoc.equipAssetTag = strTgs.uCleanUp(thisDoc.equipAssetTag,req.body.equipAssetTag);
                        thisDoc.equipTicketNumber = strTgs.uCleanUp(thisDoc.equipTicketNumber,req.body.equipTicketNumber);
                        thisDoc.equipInventoryStatus = strTgs.uCleanUp(thisDoc.equipInventoryStatus,req.body.equipInventoryStatus);
                        thisDoc.equipStatus = strTgs.uCleanUp(thisDoc.equipStatus,req.body.equipStatus);
                        thisDoc.equipIsVirtual = strTgs.uCleanUp(thisDoc.equipIsVirtual,req.body.equipIsVirtual);
                        thisDoc.equipType = strTgs.uCleanUp(thisDoc.equipType,req.body.equipType);
                        thisDoc.equipMake = strTgs.uCleanUp(thisDoc.equipMake,req.body.equipMake);
                        thisDoc.equipModel = strTgs.uCleanUp(thisDoc.equipModel,req.body.equipModel);
                        thisDoc.equipSubModel = strTgs.uCleanUp(thisDoc.equipSubModel,req.body.equipSubModel);
                        thisDoc.equipRUHieght = strTgs.uCleanUp(thisDoc.equipRUHieght,req.body.equipRUHieght);
                        thisDoc.equipImgFront = strTgs.uCleanUp(thisDoc.equipImgFront,req.body.equipImgFront);
                        thisDoc.equipImgRear = strTgs.uCleanUp(thisDoc.equipImgRear,req.body.equipImgRear);
                        thisDoc.equipImgInternal = strTgs.uCleanUp(thisDoc.equipImgInternal,req.body.equipImgInternal);
                        thisDoc.equipFirmware = strTgs.uCleanUp(thisDoc.equipFirmware,req.body.equipFirmware);
                        thisDoc.equipMobo = strTgs.uCleanUp(thisDoc.equipMobo,req.body.equipMobo);
                        thisDoc.equipCPUCount = strTgs.uCleanUp(thisDoc.equipCPUCount,req.body.equipCPUCount);
                        thisDoc.equipCPUCores = strTgs.uCleanUp(thisDoc.equipCPUCores,req.body.equipCPUCores);
                        thisDoc.equipCPUType = strTgs.uCleanUp(thisDoc.equipCPUType,req.body.equipCPUType);
                        thisDoc.equipMemType = strTgs.uCleanUp(thisDoc.equipMemType,req.body.equipMemType);
                        thisDoc.equipMemTotal = strTgs.uCleanUp(thisDoc.equipMemTotal,req.body.equipMemTotal);
                        thisDoc.equipRaidType = strTgs.uCleanUp(thisDoc.equipRaidType,req.body.equipRaidType);
                        thisDoc.equipRaidLayout = strTgs.uCleanUp(thisDoc.equipRaidLayout,req.body.equipRaidLayout);
                        thisDoc.equipHDDCount = strTgs.uCleanUp(thisDoc.equipHDDCount,req.body.equipHDDCount);
                        thisDoc.equipHDDType = strTgs.uCleanUp(thisDoc.equipHDDType,req.body.equipHDDType);
                        thisDoc.equipPSUCount = strTgs.uCleanUp(thisDoc.equipPSUCount,req.body.equipPSUCount);
                        thisDoc.equipPSUDraw = strTgs.uCleanUp(thisDoc.equipPSUDraw,req.body.equipPSUDraw);
                        thisDoc.equipAddOns = strTgs.uCleanUp(thisDoc.equipAddOns,req.body.equipAddOns);
                        thisDoc.equipRecieved = strTgs.uCleanUp(thisDoc.equipRecieved,req.body.equipRecieved);
                        thisDoc.equipAcquisition = strTgs.uCleanUp(thisDoc.equipAcquisition,req.body.equipAcquisition);
                        thisDoc.equipInService = strTgs.uCleanUp(thisDoc.equipInService,req.body.equipInService);
                        thisDoc.equipPONum = strTgs.uCleanUp(thisDoc.equipPONum,req.body.equipPONum);
                        thisDoc.equipInvoice = strTgs.uCleanUp(thisDoc.equipInvoice,req.body.equipInvoice);
                        thisDoc.equipProjectNum = strTgs.uCleanUp(thisDoc.equipProjectNum,req.body.equipProjectNum);
                        thisDoc.equipLicense = strTgs.uCleanUp(thisDoc.equipLicense,req.body.equipLicense);
                        thisDoc.equipMaintAgree = strTgs.uCleanUp(thisDoc.equipMaintAgree,req.body.equipMaintAgree);
                        thisDoc.equipPurchaseType = strTgs.uCleanUp(thisDoc.equipPurchaseType,req.body.equipPurchaseType);
                        thisDoc.equipPurchaser = strTgs.uCleanUp(thisDoc.equipPurchaser,req.body.equipPurchaser);
                        thisDoc.equipPurchaseTerms = strTgs.uCleanUp(thisDoc.equipPurchaseTerms,req.body.equipPurchaseTerms);
                        thisDoc.equipPurchaseEnd = strTgs.uCleanUp(thisDoc.equipPurchaseEnd,req.body.equipPurchaseEnd);
                        thisDoc.equipNotes = strTgs.uCleanUp(thisDoc.equipNotes,req.body.equipNotes);
                        thisDoc.modifiedOn = Date.now();
                        thisDoc.modifiedBy ='Admin';
                    }
	    eq.save(function(err){
	        if(err) {
	        	console.error(err.stack);
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
};
  



exports.dcEquipPortPostAJAX = function(req,res){

};

// --------------------------------------------------------------------
//                   working to display list of Equipment w/ systems
//          will not show systems without equipment
// ---------------------------------------------------------------------

exports.dcEquipSysPages = function(req,res,next){
    logger.info('***********exports.dcEquipSysPages First >' +req.params.datacenter);
    if (!req.params.datacenter){
    logger.info("in EquipSysPages - List");
    // this looks for "list" as the / url. if it exists, it prints the datacenter list
        Equipment.find({}).exec(function(err, eqs){
        if(err) return next(err);
        if(!eqs) return next();
        //logger.info(eqs);
        Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus modifiedOn',function(err, sys){
        
        if(err) return next(err);
        if(!sys) return next();
        //logger.info("SYS >>>>>>>>>>>"+sys);

            var context = { 
               eqs: eqs.map(function(eq){
                 tempSys = strTgs.findThisInThat(eq.equipSN,sys);
                  return {
                            titleNow:dc.abbreviation,
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
                            equipRecieved: strTgs.dateMod(eq.equipRecieved),
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
            res.render('asset/equipsys-list', context);
        });});
    } else { 
    // little regex to get the contains rack location
    var re = new RegExp(req.params.datacenter, "i");
    Equipment.find({equipLocation:  { $regex: re }}).sort({equipLocation:-1}).exec(function(err, eqs){
        if(err) return next(err);
        if(!eqs) return next();
       //logger.info("eqs"+eqs);
        Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus modifiedOn',function(err, sys){
        
        if(err) return next(err);
        if(!sys) return next();
        //logger.info("SYS >>>>>>>>>>>"+sys);

            var context = { 
                        rackView: req.params.datacenter,
                        menu1: req.params.datacenter,
                        menuLink1: "/location/rack/"+req.params.datacenter,
                        titleNow: req.params.datacenter,
               eqs: eqs.map(function(eq){
                 tempSys = strTgs.findThisInThat(eq.equipSN,sys);
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
                            equipRecieved: strTgs.dateMod(eq.equipRecieved),
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
           //logger.info('context Rack >>>>>> '+context.toString());
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/equipsys-list', context);
        });});
    }
};


// --------------------------------------------------------------------
//                   working to display list of Equipment w/ systems
//          will not show systems without equipment
//            first half does table version, second half does SVG version
// ---------------------------------------------------------------------

exports.dcRackElevationPage = function(req,res,next){
    logger.info('***********exports.dcRackElevationPage First >' +req.params.datacenter);
    if (!req.params.datacenter){
    logger.info("in EquipSysPages - List");
    // this looks for "list" as the / url. if it exists, it prints the datacenter list
        Equipment.find({}).exec(function(err, eqs){
        if(err) return next(err);
        if(!eqs) return next();
        //logger.info(eqs);
        Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus modifiedOn',function(err, sys){
        
        if(err) return next(err);
        if(!sys) return next();
        //logger.info("SYS >>>>>>>>>>>"+sys);

            var context = { 
               eqs: eqs.map(function(eq){
                 tempSys = strTgs.findThisInThat(eq.equipSN,sys);
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
                            equipRecieved: strTgs.dateMod(eq.equipRecieved),
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
    var re = new RegExp(req.params.datacenter, "i");
    Equipment.find({equipLocation:  { $regex: re }}).sort({equipLocation:-1}).exec(function(err, eqs){
        if(err) return next(err);
        if(!eqs) return next();
       //logger.info("eqs"+eqs);
        Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus modifiedOn',function(err, sys){
        
        if(err) return next(err);
        if(!sys) return next();
        //logger.info("SYS >>>>>>>>>>>"+sys);
        Rack.findOne({rackUnique: { $regex: re }},'rackUnique rackDescription rackHeight rackWidth rackDepth rackLat rackLon rackRow rackStatus rUs',function(err,rk){
        //logger.info("rk >>>>>>>>>>>"+rk);
        //logger.info("rk.rackUnique>"+rk.rackUnique);
            var context = {
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
                menuLink1: "/location/rack/"+rk.rackUnique,
                titleNow: rk.rackUnique,

                eqs: eqs.map(function(eq){
                tempSys = strTgs.findThisInThat(eq.equipSN,sys);
                  
                  return {
                            
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
                            equipRecieved: strTgs.dateMod(eq.equipRecieved),
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
};


/*---------------------------------------------------------------------
---------------------------- Equipment Delete ------------------------------
------------------------------------------------------------------------
*/
exports.dcEquipDelete = function(req,res){
    res.abbreviation = req.body.equipSN;
    res.newpage = req.body.equipLocationRack;
if (req.body.equipSN){
        logger.info("delete got this far");
        Equipment.findOne({equipSN: req.body.equipSN},function(err,equipSNtodelete){
        if(err){
        logger.info(err);
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
                return res.redirect(303, '/equipment-systems/'+res.newpage);
                }
            });
        }
    });
}
};

/* ---------------------------------------------------------------------
-------------------    equipPorts Delete   --------------------------------
------------------------------------------------------------------------
*/

exports.equipSubDelete = function(req,res){
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
};