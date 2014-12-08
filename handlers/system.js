
var     logger = require("morgan"),
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
//----------------------   System List  ----------------------------
//--------------------------------------------------------------------- 
/*
this is the Equip List block. Looks for "List" in the URL and returns list of Equipment.
*/
exports.dcSystemPages = function(req,res,next){
    console.log('***********exports.dcSystemPages First >' +req.params.datacenter);
    if (!req.params.datacenter ){
    console.log("in List");
    // this looks for "list" as the / url. if it exists, it prints the datacenter list
        Systemdb.find({}).sort({'modifiedOn': 'desc'}).exec(function(err, sys){
        if(err){
        console.log(err);
        }else{
        //console.log("system-list"+sys);
            var context = {
                sys: sys.map(function(sy){
                       // rack.populate('rackParentDC', 'abbreviation cageNickname')
                    //console.log("sy Map>"+sy);
                    return {
                            systemName: sy.systemName,
                            systemEquipSN: sy.systemEquipSN,
                            systemEnviron: sy.systemEnviron,
                            systemRole: sy.systemRole,
                            systemTicket: sy.systemTicket,
                            systemTicketLit: strTgs.trueFalseIcon(sy.systemInventoryStatus,sy.systemTicket),
                            systemStatus: strTgs.trueFalseIcon(sy.systemStatus,sy.systemStatus),
                            createdOn: strTgs.dateMod(sy.createdOn),
                            modifiedOn: strTgs.dateMod(sy.modifiedOn),
                    };
                })
            };
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/system-list', context);
        }});
        

/*-------------------------------------------------------------------
---------------------  Create New System  ---------------------------
---------------------------------------------------------------------
*/


    } else if (req.params.datacenter.indexOf ("new") !=-1){
        console.log('else if (req.params.datacenter.indexOf ("newSys")');
        console.log("datacenter "+req.params.datacenter);
        start = req.params.datacenter.indexOf ("-")+1;
            console.log("|start   >"+start);
        dcId = req.params.datacenter.substring (start);
            console.log("|dcId    >"+dcId);

    Optionsdb.find({}, 'optListKey optListArray',function(err,opt){
        if(err)return next(err);
        
    Systemdb.find({},{'systemName':1,'_id':0},{sort:{systemName:1}},function(err,sysName){
        if(err) return next(err);
        if(!sysName) return next();
        var sysUni=[];
        for(i=0;i<sysName.length;i++){
        sysUni[i] = sysName[i].systemName;
        }

    
    Equipment.find({},{ 'equipSN':1,'_id': 0},{sort:{equipSN:1}},function(err, eq){
        if(err) return next(err);
        if(!eq) return next();
        //console.log("rk"+rk);
        var eqUni=[];
        for(i=0;i<eq.length;i++){
        eqUni[i] = eq[i].equipSN;
        //console.log("rackUni >"+rackUni[i]);
        }
      
            context ={
                sysNameList: sysUni,
                equipSNList: eqUni,
                optSystPortType: strTgs.findThisInThatOpt('optSystPortType',opt),
                optSystStatus: strTgs.findThisInThatOpt('optSystStatus',opt),
                optEnvironment: strTgs.findThisInThatOpt('optEnvironment',opt),
                optImpactLevel: strTgs.findThisInThatOpt('optImpactLevel',opt),
                };
       //console.log(context);
        res.render('asset/systemedit', context);  
        });});});

    }  else {
/*
-----------------------------------------------------------------------
-------------------------System Edit, Copy or View---------------------
                   /asset/system/edit~copy-
------------------------------------------------------------------------
*/
    if (req.params.datacenter.indexOf ("edit") !=-1){
        console.log('else if (req.params.datacenter.indexOf ("edit")');
    // this section decides if it is a Copy, Edit or View
        start = req.params.datacenter.indexOf ("-");
        dcabbr = req.params.datacenter.substring (start+1);
            if (req.params.datacenter.indexOf ("copy") !=-1){
            editLoad = 5;
            console.log("copy system "+dcabbr);
        } else {
            editLoad = 3;
            console.log("edit system "+dcabbr);
        }
        } else {
            editLoad = 1;
            dcabbr = req.params.datacenter;
            console.log("view system "+dcabbr);
        }
        console.log("editLoad >"+editLoad);
    
    
    Systemdb.find({},{'systemName':1,'_id':0},{sort:{systemName:1}},function(err,sysName){
        if(err) return next(err);
        if(!sysName) return next();
        var sysUni=[];
        for(i=0;i<sysName.length;i++){
        sysUni[i] = sysName[i].systemName;
        }

    Systemdb.findOne({systemName: dcabbr.toLowerCase()},function(err,sy){
        if(err) return next(err);
        if(!sy) return next();
        //console.log(datacenter);
    //Optionsdb.findOne({optListKey: "optEquipStatus"},function(err,opt){
    //    if(err)return next(err);
    
    Optionsdb.find({}, 'optListKey optListArray',function(err,opt){
        if(err)return next(err);
        
    Equipment.find({},{ 'equipSN':1,'equipLocation':1,'equipMake':1,'equipModel':1,'equipSubModel':1,'equipStatus':1,'equipType':1,'equipRUHieght':1,'_id':0},{sort:{equipSN:1}},function(err, eq){
        if(err) return next(err);
        if(!eq) return next();
        //console.log("rk"+rk);
        var eqUni=[];
        for(i=0;i<eq.length;i++){
        eqUni[i] = eq[i].equipSN;
        }

        console.log ('System.findOne '+dcabbr);
        if(editLoad < 4){
            tempEquip = strTgs.findThisInThat2(sy.systemEquipSN,eq);
        context = {
            sysNameList: sysUni,
            equipSNList: eqUni,
            optSystPortType: strTgs.findThisInThatOpt('optSystPortType',opt),
            optSystStatus: strTgs.findThisInThatOpt('optSystStatus',opt),
            optEnvironment: strTgs.findThisInThatOpt('optEnvironment',opt),
            optImpactLevel: strTgs.findThisInThatOpt('optImpactLevel',opt),
            systemId: sy._id,
            systemName: sy.systemName,
            systemEquipSN: sy.systemEquipSN,
            systemEnviron: sy.systemEnviron,
            systemRole: sy.systemRole,
            systemInventoryStatus: sy.systemInventoryStatus,
            systemInventoryStatusChecked: strTgs.setCheckBox(sy.systemInventoryStatus),
            systemTicket: sy.systemTicket,
            systemTicketLit: strTgs.trueFalseIcon(sy.systemInventoryStatus,sy.systemTicket),
            systemStatus: sy.systemStatus,
            systemStatusLit: strTgs.trueFalseIcon(sy.systemStatus,sy.systemStatus),
            systemOwner: sy.systemOwner,
            systemImpact: sy.systemImpact,
            systemIsVirtual: sy.systemIsVirtual,
            systemIsVirtualChecked: strTgs.setCheckBox(sy.systmeIsVirtual),
            systemParentId: sy.systemParentId,
            systemOSType: sy.systemOSType,
            systemOSVersion: sy.systemOSVersion,
            systemApplications: sy.systemApplications,
            systemSupLic: sy.systemSupLic,
            systemSupEndDate: strTgs.dateMod(sy.systemSupEndDate),
            systemInstall: strTgs.dateMod(sy.systemInstall),
            systemStart: strTgs.dateMod(sy.systemStart),
            systemEnd: strTgs.dateMod(sy.systemEnd),
            systemNotes: sy.systemNotes,
            createdBy: sy.createdBy,
            createdOn: strTgs.dateMod(sy.createdOn),
            modifiedBy: sy.modifiedBy,
            modifiedOn: strTgs.dateMod(sy.modifiedOn), 
                systemPorts: sy.systemPorts.map(function(sp){
                    return {
                    sysPortId: sp._id,
                    sysPortType: sp.sysPortType,
                    sysPortName: sp.sysPortName,
                    sysPortAddress: sp.sysPortAddress,
                    sysPortCablePath: sp.sysPortCablePath,
                    sysPortEndPoint: sp.sysPortEndPoint,
                    sysPortEndPointPre: sp.sysPortEndPointPre,
                    sysPortEndPointPort: sp.sysPortEndPointPort,
                    sysPortVlan: sp.sysPortVlan,
                    sysPortOptions: sp.sysPortOptions,
                    sysPortURL: sp.sysPortURL,
                    sysPortCrossover: sp.sysPortCrossover,
                    sysPortCrossoverChecked: strTgs.setCheckBox(sp.sysPortCrossover),
                    };
                }),
            equipLocation: tempEquip.equipLocation,
            equipLocationRack: strTgs.ruToLocation(tempEquip.equipLocation),
            equipStatus: tempEquip.equipStatus,
            equipStatusLight: strTgs.trueFalseIcon(tempEquip.equipStatus,tempEquip.equipStatus),
            equipType: tempEquip.equipType,
            equipMake: tempEquip.equipMake,
            equipModel: tempEquip.equipModel,
            equipSubModel: tempEquip.equipSubModel,
            equipRUHieght: tempEquip.equipRUHieght,
            }; 
        } else {
            context = {    
                    equipSNList: eqUni,
                    optSystPortType: strTgs.findThisInThatOpt('optSystPortType',opt),
                    optSystStatus: strTgs.findThisInThatOpt('optSystStatus',opt),
                    optEnvironment: strTgs.findThisInThatOpt('optEnvironment',opt),
                    wasCopy: sy.systemName,
                    systemEnviron: sy.systemEnviron,
                    systemRole: sy.systemRole,
                    systemInventoryStatus: sy.systemInventoryStatus,
                    systemInventoryStatusChecked: strTgs.setCheckBox(sy.systemInventoryStatus),
                    systemTicket: sy.systemTicket,
                    systemStatus: sy.systemStatus,
                    systemOwner: sy.systemOwner,
                    systemImpact: sy.systemImpact,
                    systemIsVirtual: sy.systemIsVirual,
                    systemIsVirtualChecked: strTgs.setCheckBox(sy.systmeIsVirtual),
                    systemParentId: sy.systemParentId,
                    systemOSType: sy.systemOSType,
                    systemOSVersion: sy.systemOSVersion,
                    systemApplications: sy.systemApplications,
                    systemSupLic: sy.systemSupLic,
                    systemSupEndDate: sy.systemSupEndDate,
                    systemInstall: sy.systemInstall,
                    systemStart: sy.systemStart,
            };     
        }                    
 
        //console.log(context);
        if (editLoad > 2){
            console.log("System Edit(end)");
            res.render('asset/systemedit', context); 
        }else{
        res.render('asset/system', context);  
        }
        });});});});
    }
};
    

/* ---------------------------------------------------------------------
-----------------------   New and copy system POST working   --------
------------------------------------------------------------------------
*/
exports.dcSystemPost = function(req,res){
    var bd = req.body;
    // this makes the abbreviation available for the URL
    res.abbreviation = strTgs.clTrim(bd.systemName);
    console.log("dcRackPost abbreviation>"+strTgs.clTrim(bd.systemName));

    //console.log("rUs expanded >"+ strTgs.compUs(req.body.rUs));
    if (!bd.isEdit){

    console.log("new System in DC");
    varPortsNew = function(bd){
    if(typeof bd.sysPortName[i] !== 'undefined'){
    var Ports = [];
    for(i=0;i<bd.sysPortName.length;i++){
        console.log("sysPortName.length "+bd.sysPortName.length);
        Ports[i]=({
            sysPortType: strTgs.sTrim(bd.sysPortType[i]),
            sysPortName: strTgs.sTrim(bd.sysPortName[i]),
            sysPortAddress: strTgs.sTrim(bd.sysPortAddress[i]),
            sysPortCablePath: strTgs.stTrim(bd.sysPortCablePath[i]),
            sysPortEndPoint: strTgs.clTrim(bd.sysPortEndPoint[i]),
            sysPortEndPointPre: strTgs.clTrim(bd.sysPortEndPointPre[i]),
            sysPortEndPointPort: strTgs.clTrim(bd.sysPortEndPointPort[i]),
            sysPortVlan: strTgs.sTrim(bd.sysPortVlan[i]),
            sysPortOptions: strTgs.clTrim(bd.sysPortOptions[i]),
            sysPortURL: strTgs.clTrim(bd.sysPortURL[i]),
            sysPortCrossover: bd.sysPortCrossover[i],
            });
        }
        return Ports;
    }};
    
    Systemdb.create({
                                systemPorts: varPortsNew(bd),
                                systemName: strTgs.clTrim(bd.systemName),
                                systemEquipSN: strTgs.sTrim(bd.systemEquipSN),
                                systemEnviron: strTgs.sTrim(bd.systemEnviron),
                                systemRole: strTgs.uTrim(bd.systemRole),
                                systemInventoryStatus: bd.systemInventoryStatus,
                                systemTicket: strTgs.sTrim(bd.systemTicket),
                                systemStatus: bd.systemStatus,
                                systemOwner: strTgs.uTrim(bd.systemOwner),
                                systemImpact: bd.systemImpact,
                                systemIsVirtual: bd.systemIsVirtual,
                                systemParentId: strTgs.sTrim(bd.systemParentId),
                                systemOSType: strTgs.uTrim(bd.systemOSType),
                                systemOSVersion: strTgs.uTrim(bd.systemOSVersion),
                                systemApplications: strTgs.uTrim(bd.systemApplications),
                                systemSupLic: strTgs.uTrim(bd.systemSupLic),
                                systemSupEndDate: bd.systemSupEndDate,
                                systemInstall: bd.systemInstall,
                                systemStart: bd.systemStart,
                                systemEnd: bd.systemEnd,
                                systemNotes: strTgs.uTrim(bd.systemNotes),
                                createdBy:'Admin',
                                createdOn: Date.now(),
                                modifiedBy: bd.modifiedBy,
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
                return res.redirect(303, '/systems');
	        }
            if (!req.body.wasCopy){
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
                };
	        return res.redirect(303, '/system/'+ res.abbreviation);
            } else { 
            req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
                };
	        return res.redirect(303, '/system/copy~edit-'+ res.abbreviation);

            }
	    }
        );
        
	} else {
    Systemdb.findOne({systemName: req.body.isEdit},function(err,sys){
    res.abbreviation = req.body.systemName;

    var thisDoc = sys;
       //console.log("existing id>"+thisDoc);
        if (err) {
            console.log(err);
            res.redirect('location/datacenter/'+res.abbreviation);
        } else {
    
    for(i=0;i<bd.sysPortType.length;i++){
        console.log("equip \n Portname >"+bd.sysPortName[i] +" - path >"+ bd.sysPortCablePath[i] +" - endpoint >"+ bd.sysPortEndPoint[i] +" - Opt >"+ bd.sysPortOptions[i]/*+"crossover"+strTgs.doCheckbox(bd.sysPortCrossover[i]  future*/);
        if(!bd.sysPortType[i]){
            console.log("No new port");
            }else if(bd.sysPortId[i] === "new"){
            console.log("new port >"+bd.sysPortId[i]);
            sys.systemPorts.push({
                sysPortType: strTgs.sTrim(bd.sysPortType[i]),
                sysPortName: strTgs.sTrim(bd.sysPortName[i]),
                sysPortAddress: strTgs.sTrim(bd.sysPortAddress[i]),
                sysPortCablePath: strTgs.stTrim(bd.sysPortCablePath[i]),
                sysPortEndPoint: strTgs.clTrim(bd.sysPortEndPoint[i]),
                sysPortEndPointPre: strTgs.clTrim(bd.sysPortEndPointPre[i]),
                sysPortEndPointPort: strTgs.clTrim(bd.sysPortEndPointPort[i]),
                sysPortVlan: strTgs.sTrim(bd.sysPortVlan[i]),
                sysPortOptions: strTgs.stcTrim(bd.sysPortOptions[i]),
                sysPortURL: strTgs.clTrim(bd.sysPortURL[i]),
    /*            sysPortCrossover: strTgs.doCheckbox(bd.sysPortCrossover[i]),  future*/
            });
            }else{
            console.log("existing port");
        var thisSubDoc = sys.systemPorts.id(bd.sysPortId[i]);
                thisSubDoc.sysPortType= strTgs.clCleanUp(thisSubDoc.sysPortType,bd.sysPortType[i]);
                thisSubDoc.sysPortName= strTgs.clCleanUp(thisSubDoc.sysPortName,bd.sysPortName[i]);
                thisSubDoc.sysPortAddress= strTgs.clCleanUp(thisSubDoc.sysPortAddress,bd.sysPortAddress[i]);
                thisSubDoc.sysPortCablePath= strTgs.clCleanUp(thisSubDoc.sysPortCablePath,bd.sysPortCablePath[i]);
                thisSubDoc.sysPortEndPoint= strTgs.clCleanUp(thisSubDoc.sysPortEndPoint,bd.sysPortEndPoint[i]);
                thisSubDoc.sysPortEndPointPre= strTgs.clCleanUp(thisSubDoc.sysPortEndPointPre,bd.sysPortEndPointPre[i]);
                thisSubDoc.sysPortEndPointPort= strTgs.clCleanUp(thisSubDoc.sysPortEndPointPort,bd.sysPortEndPointPort[i]);
                thisSubDoc.sysPortVlan= strTgs.clCleanUp(thisSubDoc.sysPortVlan,bd.sysPortVlan[i]);
                thisSubDoc.sysPortOptions= strTgs.stcCleanup(thisSubDoc.sysPortOptions,bd.sysPortOptions[i]);
                thisSubDoc.sysPortURL= strTgs.clCleanUp(thisSubDoc.sysPortURL,bd.sysPortURL[i]);
    /*            thisSubDoc.sysPortCrossover= strTgs.doCheckbox(bd.sysPortCrossover[i]);  future*/
        }
    }
            thisDoc.systemName= strTgs.clTrim(bd.systemName);
            thisDoc.systemEquipSN= strTgs.sTrim(bd.systemEquipSN);
            thisDoc.systemEnviron= strTgs.sTrim(bd.systemEnviron);
            thisDoc.systemRole= strTgs.uTrim(bd.systemRole);
            thisDoc.systemInventoryStatus= bd.systemInventoryStatus;
            thisDoc.systemTicket= strTgs.sTrim(bd.systemTicket);
            thisDoc.systemStatus= bd.systemStatus;
            thisDoc.systemOwner= strTgs.uTrim(bd.systemOwner);
            thisDoc.systemImpact= bd.systemImpact;
            thisDoc.systemIsVirtual= bd.systemIsVirtual;
            thisDoc.systemParentId= strTgs.sTrim(bd.systemParentId);
            thisDoc.systemOSType= strTgs.uTrim(bd.systemOSType);
            thisDoc.systemOSVersion= strTgs.uTrim(bd.systemOSVersion);
            thisDoc.systemApplications= strTgs.uTrim(bd.systemApplications);
            thisDoc.systemSupLic= strTgs.uTrim(bd.systemSupLic);
            thisDoc.systemSupEndDate= bd.systemSupEndDate;
            thisDoc.systemInstall= bd.systemInstall;
            thisDoc.systemStart= bd.systemStart;
            thisDoc.systemEnd= bd.systemEnd;
            thisDoc.systemNotes= strTgs.uTrim(bd.systemNotes);
            thisDoc.modifiedOn = Date.now();
            thisDoc.modifiedBy ='Admin';
                    }
	    sys.save(function(err){
	        if(err) {
	        	console.error(err.stack);
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };
	            return res.redirect(303, '/system/'+ res.abbreviation);
	        }
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
	        };
	        return res.redirect(303, '/system/'+ res.abbreviation);
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
    console.log('***********exports.dcEquipSysPages First >' +req.params.datacenter);
    if (!req.params.datacenter){
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
       //console.log("eqs"+eqs);
        Systemdb.find({}, 'systemEquipSN systemName systemEnviron systemRole systemStatus modifiedOn',function(err, sys){
        
        if(err) return next(err);
        if(!sys) return next();
        //console.log("SYS >>>>>>>>>>>"+sys);

            var context = { 
               eqs: eqs.map(function(eq){
                 tempSys = strTgs.findThisInThat(eq.equipSN,sys);
                  
                 
                 
                  return {
                            rackView: req.params.datacenter,
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
           //console.log('context Rack >>>>>> '+context.toString());
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/equipsys-list', context);
        });});
    }
};

/*---------------------------------------------------------------------
---------------------------- System Delete ------------------------------
------------------------------------------------------------------------
*/
exports.dcsystemDelete = function(req,res){
    res.abbreviation = req.body.systemName;
if (req.body.systemName){
        console.log("delete got this far");
        Systemdb.findOne({systemName: req.body.systemName},function(err,systemNametodelete){
        if(err){
        console.log(err);
        //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        }else{
            systemNametodelete.remove(function(err){
                if(err){
                console.log(err);
                req.session.flash = {
                        type: 'danger',
                        intro: 'Ooops!',
                        message: 'Something went wrong, '+ req.body.systemNametodelete +' was not deleted.',
                    };
                    return res.redirect(303, '/location/equipment/'+ res.abbreviation);
                } else {
                    req.session.flash = {
                    type: 'success',
                    intro: 'Done!',
                    message: 'Contact '+ req.body.systemNametodelete +' has been deleted. Good luck with that one',
                };
                return res.redirect(303, '/systems');
                }
            });
        }
    });
}
};

/* ---------------------------------------------------------------------
-------------------    systemPorts Delete   --------------------------------
------------------------------------------------------------------------
*/

exports.dcsystemSubDelete = function(req,res){
    res.abbreviation = req.body.abbreviation;
if (req.body.id && req.body.subId){
    Systemdb.findById(req.body.id,req.body.subDoc,function (err, sys){
        if(err){
        console.log(err);
        //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        }else{
            sys.systemPorts.id(req.body.subId).remove();
            sys.save(function(err){
                if(err){
                console.log(err);
                req.session.flash = {
                        type: 'danger',
                        intro: 'Ooops!',
                        message: 'Something went wrong',
                    };
                    return res.redirect(303, '/system/edit-'+ res.abbreviation);
                } else {
                    req.session.flash = {
                    type: 'success',
                    intro: 'Done!',
                    message: 'The port has been deleted.',
                };
                return res.redirect(303, '/system/edit-'+ res.abbreviation);
                }
            });
        }
    });
}
};