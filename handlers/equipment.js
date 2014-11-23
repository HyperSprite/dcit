var Datacenter = require('../models/datacenter.js'),
    Rack = require('../models/rack.js'),
    Optionsdb = require('../models/options.js'),
    Equipment = require('../models/equipment.js'),
    Systemdb = require('../models/system.js'),
    strTgs = require('../lib/stringThings.js'),
    ObjectId = require('mongoose').Types.ObjectId;

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
    console.log('***********exports.dcEquipPages First >' +req.params.datacenter);
    if (req.params.datacenter === 'list'){
    console.log("in List");
    // this looks for "list" as the / url. if it exists, it prints the datacenter list
        Equipment.find({}).sort({'modifiedOn': 'desc'}).exec(function(err, eqs){
        if(err){
        console.log(err);
        }else{
            var context = {
                eqs: eqs.map(function(eq){
                       // rack.populate('rackParentDC', 'abbreviation cageNickname')
                    console.log(eq);
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
        console.log('else if (req.params.datacenter.indexOf ("circuit")');
        console.log("rack "+req.params.datacenter);
        start = req.params.datacenter.indexOf ("~")+1;
            console.log("|start   >"+start);
        dcInfo = req.params.datacenter.substring (start);
            console.log("|dcInfo  >"+dcInfo);
        dcSplit = dcInfo.indexOf (">");
            console.log("|dcSplit >"+dcSplit);
        dcSubId = dcInfo.substring (dcSplit+1);
            console.log("|dcSubId >"+dcSubId);
        dcId = dcInfo.substring (0,dcSplit);
            console.log("|dcId    >"+dcId);
        
        
        
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
            console.log(rk);
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
        
        console.log(rk);
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
        //console.log(context);
        res.render('location/rackpower', context); 
        }});});
/*------------------------------------------------------------------
---------------------  Create New Equipment   ---------------------------
------------------------------------------------------------------------
*/


    } else if (req.params.datacenter.indexOf ("newequip") !=-1){
        console.log('else if (req.params.datacenter.indexOf ("newequip")');
        console.log("datacenter "+req.params.datacenter);
        start = req.params.datacenter.indexOf ("~")+1;
            console.log("|start   >"+start);
        dcInfo = req.params.datacenter.substring (start);
            console.log("|dcInfo  >"+dcInfo);
        dcSplit = dcInfo.indexOf ("-");
            console.log("|dcSplit >"+dcSplit);
        dcSubId = dcInfo.substring (dcSplit+1);
            console.log("|dcSubId >"+dcSubId);
        dcId = dcInfo.substring (0,dcSplit);
            console.log("|dcId    >"+dcId);

        Datacenter.findById(dcId,function(err,datacenter){
        var dc = datacenter;
        var context;
        if(!datacenter){
            console.log("Rack !datacenter");
        } else {
        console.log("Rack is datacenter");
        var thisSubDoc = datacenter.cages.id(dcSubId);
        if(err) return next(err);
        console.log("datacener= "+datacenter);
            context ={
                id:dc._id,
                fullName:dc.fullName,
                abbreviation:dc.abbreviation,
                createdOn: strTgs.dateMod(dc.createdOn),
                foundingCompany:dc.foundingCompany,
                        cageId : thisSubDoc.id,
                        cageNickname: thisSubDoc.cageNickname,
                        cageName: thisSubDoc.cageName,
                        cageAbbreviation: thisSubDoc.cageAbbreviation,
                };
        console.log(context);
        res.render('location/rackedit', context);  
        }});

    }  else {
/*---------------------------------------------------------------------
-------------------------Equipment Edit, Copy or View------------------
                   /asset/equipment/edit~copy-
------------------------------------------------------------------------
*/

    if (req.params.datacenter.indexOf ("edit") !=-1){
        console.log('else if (req.params.datacenter.indexOf ("edit")');
    // this section decides if it is a Copy, Edit or View
        start = req.params.datacenter.indexOf ("-");
        dcabbr = req.params.datacenter.substring (start+1);
            if (req.params.datacenter.indexOf ("copy") !=-1){
            editLoad = 5;
            console.log("copy equip "+dcabbr);
        } else {
            editLoad = 3;
            console.log("edit equip "+dcabbr);
        }
        } else {
            editLoad = 1;
            dcabbr = req.params.datacenter;
            console.log("view equip "+dcabbr);
        }
        
  
    Equipment.findOne({equipSN: dcabbr},function(err,eq){
        if(err) return next(err);
        if(!eq) return next();
        //console.log(datacenter);
    //Optionsdb.findOne({optListKey: "optEquipStatus"},function(err,opt){
    //    if(err)return next(err);
    
    Optionsdb.find({}, 'optListKey optListArray',function(err,opt){
        if(err)return next(err);
        

    Rack.find({},{ 'rUs':1,'rackUnique':1,'_id': 0},{sort:{rackUnique:1}},function(err, rk){
        if(err) return next(err);
        if(!rk) return next();
        //console.log("rk"+rk);
        var rackUni=[];
        for(i=0;i<rk.length;i++){
        rackUni[i] = rk[i].rackUnique;
        //console.log("rackUni >"+rackUni[i]);
        }
        
        //var RuTemp = 52;
        var getRackrUs = function(RuTemp){
            console.log("getRackrUs"+RuTemp);
            var tempRu=[];
            for(i=0;i<RuTemp;i++){
            tempRu[i]=strTgs.pad([i]);
        }
            //console.log("getRackrUs>> "+tempRu);
        return tempRu; 
        };
        //console.log("rackUni >"+rackUni);

        console.log ('Equipment.findOne '+dcabbr);
        
        if(editLoad < 4){


             context = {    
                                
                                optEquipStatus: strTgs.findThisInThatOpt('optEquipStatus',opt),
                                optEquipType: strTgs.findThisInThatOpt('optEquipType',opt),
                                rackUnique: rackUni,
                                rackrUs: getRackrUs(52),
                                equipLocationRack: strTgs.ruToLocation(eq.equipLocation),
                                equipLocationRu: strTgs.ruElevation(eq.equipLocation),
                                equipSN: eq.equipSN,
                                equipAssetTag: eq.equipAssetTag,
                                equipTicketNumber: eq.equipTicketNumber,
                                equipTicketNumberlit: strTgs.trueFalseIcon(eq.equipInventoryStatus,eq.equipTicketNumber),
                                equipStatuslit: strTgs.trueFalseIcon(eq.equipStatus,eq.equipStatus),
                                equipStatus: eq.equipStatus,
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
                                equipPortsId: ep.id,
                                equipPortsType: ep.equipPortsType,
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
                                equipRMA: er.id,
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
                                optEquipStatus: strTgs.findThisInThatOpt('optEquipStatus',opt),
                                optEquipType: strTgs.findThisInThatOpt('optEquipType',opt),
                                rackUnique: rk.rackUnique,
                                rUs: rk.rUs,
                                copyOfEquipSN: eq.equipSN,
                                equipTicketNumber: eq.equipTicketNumber,
                                equipTicketNumberlit: strTgs.trueFalseIcon(eq.equipInventoryStatus,eq.equipTicketNumber),
                                equipStatuslit: strTgs.trueFalseIcon(eq.equipStatus,eq.equipStatus),
                                equipStatus: eq.equipStatus,
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
 
        //console.log(context);
        if (editLoad > 2){
            console.log("equipment Edit");
            res.render('asset/equipmentedit', context); 
        }else{
        res.render('asset/equipment', context);  
        }
        });});});
    }
};
    

/* ---------------------------------------------------------------------
-----------------------   New Rack working   ---------------------------
------------------------------------------------------------------------
*/
exports.dcRackPost = function(req,res){
    // this makes the abbreviation available for the URL
    res.abbreviation = req.body.abbreviation;
    console.log("dcRackPost abbreviation>"+res.abbreviation);
    console.log("rUs >"+req.body.rUs);
    //console.log("rUs expanded >"+ strTgs.compUs(req.body.rUs));
    if (!req.body.rackUnique){
    if (req.body.wasCopy){
    res.abbreviation = req.body.wasCopy;
    }
    console.log("new rack in DC "+req.body.id);
    Rack.create({
                    	rackParentDC:req.body.id,
                        rackParentCage:req.body.cageId,
                        rackNickname:req.body.rackNickname.trim().toUpperCase(),
                        rackName:req.body.rackName.trim().toUpperCase(),
                        rackUnique:(req.body.abbreviation+"_"+req.body.cageAbbreviation+"_"+req.body.rackNickname.trim().toUpperCase()),
                        rackDescription:req.body.rackDescription.trim(),
                        rackSN:req.body.rackSN.trim().toUpperCase(),
                        rackHeight:req.body.rackHeight,
                        rackWidth:req.body.rackWidth,
                        rackDepth:req.body.rackDepth,
                        rackLat:req.body.rackLat.toUpperCase(),
                        rackLon:req.body.rackLon.toUpperCase(),
                        rackStatus:req.body.rackStatus,
                        rackMake:req.body.rackMake.trim(),
                        rackModel:req.body.rackModel.trim(),
                        rUs:strTgs.compUs(req.body.rUs,req.body.abbreviation,req.body.cageAbbreviation,req.body.rackNickname.trim().toUpperCase()),
                        rackNotes:req.body.rackNotes.trim(),
                        createdOn: Date.now(),
                        createdBy:'Admin',                        

                    },function(err){
	        if(err) {
	        	console.error(err.stack);
                if(err.stack.indexOf ('matching')!=-1){
                req.session.flash = {
	                type: 'danger',
	                intro: 'Duplicate!',
	                message: 'Looks like there is already a rack by that name.',
	            };
                
                } else { 
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };}
                return res.redirect(303, '/location/rack/list');
	        }
            if (!req.body.wasCopy){
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
                };
	        return res.redirect(303, '/location/datacenter/'+ res.abbreviation);
            } else { 
            req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
                };
	        return res.redirect(303, '/location/rack/copy~edit-'+ res.abbreviation);

            }
	    }
        );
        
	} else {
    Rack.findOne({rackUnique: req.body.rackUnique},function(err,rack){
    res.abbreviation = req.body.rackUnique;
    var thisDoc = rack;
    console.log("existing id>"+thisDoc);
        if (err) {
            console.log(err);
            res.redirect('location/datacenter/'+res.abbreviation);
        } else {

                        thisDoc.rackName = strTgs.uCleanUp(thisDoc.rackName,req.body.rackName);
                        thisDoc.rackDescription = strTgs.uCleanUp(thisDoc.rackDescription,req.body.rackDescription);
                        thisDoc.rackSN = strTgs.uCleanUp(thisDoc.rackSN,req.body.rackSN);
                        thisDoc.rackHeight = strTgs.uCleanUp(thisDoc.rackHeight,req.body.rackHeight);
                        thisDoc.rackWidth = strTgs.uCleanUp(thisDoc.rackWidth,req.body.rackWidth);
                        thisDoc.rackDepth = strTgs.uCleanUp(thisDoc.rackDepth,req.body.rackDepth);
                        thisDoc.rackLat = strTgs.uCleanUp(thisDoc.rackLat,req.body.rackLat);
                        thisDoc.rackLon = strTgs.uCleanUp(thisDoc.rackLon,req.body.rackLon);
                        thisDoc.rackStatus = strTgs.uCleanUp(thisDoc.rackStatus,req.body.rackStatus);
                        thisDoc.rackMake = strTgs.uCleanUp(thisDoc.rackMake,req.body.rackMake);
                        thisDoc.rackModel = strTgs.uCleanUp(thisDoc.rackModel,req.body.rackModel);
                        thisDoc.rackNotes = strTgs.uCleanUp(thisDoc.rackNotes,req.body.rackNotes);
                        thisDoc.modifiedOn = Date.now();
                        thisDoc.modifiedBy ='Admin';
                    }
	    rack.save(function(err){
	        if(err) {
	        	console.error(err.stack);
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };
	            return res.redirect(303, 'location/rack/'+ res.abbreviation);
	        }
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
	        };
	        return res.redirect(303, '/location/rack/'+ res.abbreviation);
	    });
	});
}
};
  
/*---------------------------------------------------------------------
---------------------------- Rack Delete ------------------------------
------------------------------------------------------------------------
*/
exports.rackDelete = function(req,res){
    res.abbreviation = req.body.rackUnique;
if (req.body.rackUnique){
        console.log("delete got this far");
        Rack.findOne({rackUnique: req.body.rackUnique},function(err,racktodelete){
        if(err){
        console.log(err);
        //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        }else{
            racktodelete.remove(function(err){
                if(err){
                console.log(err);
                req.session.flash = {
                        type: 'danger',
                        intro: 'Ooops!',
                        message: 'Something went wrong, '+ req.body.subName +' was not deleted.',
                    };
                    return res.redirect(303, '/location/rack/'+ res.abbreviation);
                } else {
                    req.session.flash = {
                    type: 'success',
                    intro: 'Done!',
                    message: 'Contact '+ req.body.rackUnique +' has been deleted. Good luck with that one',
                };
                return res.redirect(303, '/location/rack/list');
                }
            });
        }
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
    console.log('***********exports.dcEquipSysPages First >' +req.params.datacenter);
    if (req.params.datacenter === 'list'){
    console.log("in EquipSysPages - List");
    // this looks for "list" as the / url. if it exists, it prints the datacenter list
        Equipment.find({}).exec(function(err, eqs){
        if(err) return next(err);
        if(!eqs) return next();
        //console.log(eqs);
        Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus modifiedOn',function(err, sys){
        
        if(err) return next(err);
        if(!sys) return next();
        //console.log("SYS >>>>>>>>>>>"+sys);

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
                                equipPortsType: ep.equipPortsType,
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
            console.log('context List >>>>>> '+context.toString());
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
        console.log("eqs"+eqs);
        Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus modifiedOn',function(err, sys){
        
        if(err) return next(err);
        if(!sys) return next();
        //console.log("SYS >>>>>>>>>>>"+sys);

            var context = { 
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
                                equipPortsType: ep.equipPortsType,
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
            console.log('context Rack >>>>>> '+context.toString());
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/equipsys-list', context);
        });});
    }
};

/* ---------------------------------------------------------------------
------------------------   Rack Power Post   ---------------------------
------------------------------------------------------------------------
*/

exports.dcRackPowPost = function(req,res){
    // this makes the abbreviation available for the URL
    //res.abbreviation = req.body.rackUnique;

    //console.log("rUs expanded >"+ strTgs.compUs(req.body.rUs));
    //if (!req.body.rackPowUnique){
    //if (req.body.wasCopy){
    //res.abbreviation = req.body.wasCopy;
    //}
    console.log("Rack Power abbreviation "+req.body.abbreviation);
    console.log("Rack Power rackUnique "+req.body.rackUnique);
    console.log("Rack Power rackPowUnique "+req.body.rackPowUnique);
    console.log("Rack Power rackPowMain "+req.body.rackPowMain);
    console.log("Rack Power rackPowVolts "+req.body.rackPowVolts);
    console.log("Rack Power rackPowPhase "+req.body.rackPowPhase);
    
    
    
    Rack.findOne({rackUnique: req.body.rackUnique},function(err,rk){
    res.abbreviation = req.body.rackUnique;
    console.log("Rack Power findOne "+rk);
        //console.log("dcRackPowPost abbreviation>"+res.abbreviation);
    var thisSubDoc;
    if(req.body.rackPowUnique === "new"){
    thisSubDoc = "new";
    }else{
    thisSubDoc = rk.powers.id(req.body.rackPowId);
    }
    console.log("existing id>"+thisSubDoc);
        if (err) {
            console.log(err);
            res.redirect('location/rack/'+res.abbreviation);
        } else if(thisSubDoc === "new"){
                rk.powers.push({
                    rackPowMain: req.body.rackPowMain,
                    rackPowCircuit: req.body.rackPowCircuit.trim().toUpperCase(),
                    rackPowUnique: req.body.abbreviation+"_"+req.body.rackPowMain+"_"+req.body.rackPowCircuit.trim().toUpperCase(),
                    rackPowStatus: req.body.rackPowStatus,
                    rackPowVolts: req.body.rackPowVolts.trim(),
                    rackPowPhase: req.body.rackPowPhase.trim(),
                    rackPowAmps: req.body.rackPowAmps.trim(),
                    rackPowReceptacle: req.body.rackPowReceptacle.trim().toUpperCase(),
                    rackPowCreatedBy: 'Admin',
                    rackPowCreatedOn: modifiedOn = Date.now(),
                    rackPowModifiedby: 'Admin',
                    rackPowModifiedOn: modifiedOn = Date.now(),
                });
        } else {
                thisSubDoc.rackPowStatus = strTgs.uCleanUp(thisSubDoc.rackPowStatus,req.body.rackPowStatus);
                thisSubDoc.rackPowVolts = strTgs.uCleanUp(thisSubDoc.rackPowVolts,req.body.rackPowVolts);
                thisSubDoc.rackPowPhase = strTgs.uCleanUp(thisSubDoc.rackPowPhase,req.body.rackPowPhase);
                thisSubDoc.rackPowAmps = strTgs.uCleanUp(thisSubDoc.rackPowAmps,req.body.rackPowAmps);
                thisSubDoc.rackPowReceptacle = strTgs.uCleanUp(thisSubDoc.rackPowReceptacle,req.body.rackPowReceptacle);
                thisSubDoc.modifiedOn = Date.now();
                thisSubDoc.modifiedBy ='Admin';
                    }
	    rk.save(function(err){
	        if(err) {
	        	console.error(err.stack);
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };
	            return res.redirect(303, 'location/rack/'+ res.abbreviation);
	        }
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
	        };
	        return res.redirect(303, '/location/rack/'+ res.abbreviation);
	    });
	});

};
/* ---------------------------------------------------------------------
-------------------    rackPow Delete   --------------------------------
------------------------------------------------------------------------
*/

exports.rackSubDelete = function(req,res){
    res.abbreviation = req.body.abbreviation;
if (req.body.id && req.body.subId){
    Rack.findById(req.body.id,req.body.subDoc,function (err, rk){
        if(err){
        console.log(err);
        //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        }else{
            rk.powers.id(req.body.subId).remove();
            rk.save(function(err){
                if(err){
                console.log(err);
                req.session.flash = {
                        type: 'danger',
                        intro: 'Ooops!',
                        message: 'Something went wrong, '+ req.body.subName +' was not deleted.',
                    };
                    return res.redirect(303, '/location/rack/'+ res.abbreviation);
                } else {
                    req.session.flash = {
                    type: 'success',
                    intro: 'Done!',
                    message: 'Contact '+ req.body.subName +' has been deleted.',
                };
                return res.redirect(303, '/location/rack/'+ res.abbreviation);
                }
            });
        }
    });
}
};