
var     logger = require('winston'),
        strTgs = require('../lib/stringThings.js'),
      ObjectId = require('mongoose').Types.ObjectId;

// Models
var Datacenter = require('../models/datacenter.js'),
          Rack = require('../models/rack.js'),
     Optionsdb = require('../models/options.js'),
     Equipment = require('../models/equipment.js'),
      Systemdb = require('../models/system.js');
MrSystemEnviron= require('../models/mrsystemenviron.js');

var start  = "",
    editLoad =0,
    dcabbr = "",
    dcInfo = "",
    dcInfoSplit = "",
    dcSubId = "",
    dcId ="";

    var query;

//---------------------------------------------------------------------     
//----------------------   System List  ----------------------------
//--------------------------------------------------------------------- 
/*
this is the Equip List block. Looks for "List" in the URL and returns list of Equipment.
*/
exports.dcSystemPages = function(req,res,next){
    logger.info('***********exports.dcSystemPages First >' +req.params.datacenter);
    if (!req.params.datacenter ){
    logger.info("in List");
    // this looks for "list" as the / url. if it exists, it prints the datacenter list
        Systemdb.find({}).sort({'modifiedOn': 'desc'}).exec(function(err, sys){
        if(err){
        logger.info(err);
        }else{
        //logger.info("system-list"+sys);
            var context = {
                sys: sys.map(function(sy){
                       // rack.populate('rackParentDC', 'abbreviation cageNickname')
                    //logger.info("sy Map>"+sy);
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
        logger.info('else if (req.params.datacenter.indexOf ("newSys")');
        logger.info("datacenter "+req.params.datacenter);
        start = req.params.datacenter.indexOf ("-")+1;
            logger.info("|start   >"+start);
        dcId = req.params.datacenter.substring (start);
            logger.info("|dcId    >"+dcId);

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
        //logger.info("rk"+rk);
        var eqUni=[];
        for(i=0;i<eq.length;i++){
        eqUni[i] = eq[i].equipSN;
        //logger.info("rackUni >"+rackUni[i]);
        }
      
            context ={
                titleNow: "New System",
                sysNameList: sysUni,
                equipSNList: eqUni,
                optSystPortType: strTgs.findThisInThatOpt('optSystPortType',opt),
                optSystStatus: strTgs.findThisInThatOpt('optSystStatus',opt),
                optEnvironment: strTgs.findThisInThatOpt('optEnvironment',opt),
                optImpactLevel: strTgs.findThisInThatOpt('optImpactLevel',opt),
                };
       //logger.info(context);
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
        logger.info('else if (req.params.datacenter.indexOf ("edit")');
    // this section decides if it is a Copy, Edit or View
        start = req.params.datacenter.indexOf ("-");
        dcabbr = req.params.datacenter.substring (start+1);
            if (req.params.datacenter.indexOf ("copy") !=-1){
            editLoad = 5;
            logger.info("copy system "+dcabbr);
        } else {
            editLoad = 3;
            logger.info("edit system "+dcabbr);
        }
        } else {
            editLoad = 1;
            dcabbr = req.params.datacenter;
            logger.info("view system "+dcabbr);
        }
        logger.info("editLoad >"+editLoad);
    
    
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
        //logger.info(datacenter);
    //Optionsdb.findOne({optListKey: "optEquipStatus"},function(err,opt){
    //    if(err)return next(err);
    
    Optionsdb.find({}, 'optListKey optListArray',function(err,opt){
        if(err)return next(err);
        
    Equipment.find({},{ 'equipSN':1,'equipLocation':1,'equipMake':1,'equipModel':1,'equipSubModel':1,'equipStatus':1,'equipType':1,'equipRUHieght':1,'_id':0},{sort:{equipSN:1}},function(err, eq){
        if(err) return next(err);
        if(!eq) return next();
        //logger.info("rk"+rk);
        var eqUni=[];
        for(i=0;i<eq.length;i++){
        eqUni[i] = eq[i].equipSN;
        }

        logger.info ('System.findOne '+dcabbr);
        if(editLoad < 4){
            tempEquip = strTgs.findThisInThat2(sy.systemEquipSN,eq);
        context = {
            titleNow: sy.systemName,
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
 
        //logger.info(context);
        if (editLoad > 2){
            logger.info("System Edit(end)");
            res.render('asset/systemedit', context); 
        }else{
        res.render('asset/system', context);  
        }
        });});});});
    }
};

    function queryString(findThis,opt){   
        switch (opt){
        case 2:
            query = Systemdb.find({systemEnviron : findThis});
            logger.info("query2"+query);
            break;
        case 3:
            query = Systemdb.find({systemRole : findThis});
            logger.info("query3"+query);
            break;      
            default:
            logger.info("no opt for queryString");
        break;
        }
        return query;
    }


// -------------------------------------------------------------
//           list by Env and Role
// -------------------------------------------------------------
        
exports.dcSystembyEnvRole = function(req,res,next){
    logger.info('***********exports.dcSystembyEnv First >' +req.params.datacenter);
    var editLoad;
    
    if(!req.params.datacenter){
            editLoad = 1;
            logger.info("none slected");
        }else{
        
        start = req.params.datacenter.indexOf ("-");
        dcabbr = req.params.datacenter.substring (start+1);
            if (req.params.datacenter.indexOf ("env") !=-1){
            editLoad = 2;
            
        } else if(req.params.datacenter.indexOf ("role") !=-1){
            editLoad = 3;
            
        } else {
            editLoad = 1;
            logger.info("none slected");
        }}
        logger.info("page type selected >"+editLoad);
    
        Systemdb.distinct('systemEnviron').exec(function(err,env){
        //logger.info(env);
        Systemdb.distinct('systemRole').exec(function(err,role){
        //logger.info(role);
        
    if(editLoad>1){
    
    // this looks for "list" as the / url. if it exists, it prints the datacenter list

        query = queryString(dcabbr,editLoad);
        query.sort({'systemName': 'asc'}).exec(function(err, sys){
        if(err){
        logger.info(err);
        }else{
        logger.info("2"+dcabbr);
        Equipment.find({},'equipLocation equipSN equipStatus equipType equipMake equipModel equipSubModel modifiedOn',function(err,eqs){
         
        //logger.info("system-list"+sys);
            var context = {
                titleNow: dcabbr,
                equipsys: "true",
                reportType: req.body.systemEnviron,
                drop1:"Environment",
                drop1url:"/env-role-report/env-",
                drop1each: env.sort(),
                drop2:"Roles",
                drop2url:"/env-role-report/role-",
                drop2each: role.sort(),
            
                eqs: sys.map(function(sy){
                tempSys = strTgs.findThisInThat2(sy.systemEquipSN,eqs);
                       // rack.populate('rackParentDC', 'abbreviation cageNickname')
                    //logger.info("sy Map>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"+sy);
                    return {
                            systemName: sy.systemName,
                            systemEquipSN: sy.systemEquipSN,
                            systemEnviron: sy.systemEnviron,
                            systemRole: sy.systemRole,
                            systemTicket: sy.systemTicket,
                            systemTicketLit: strTgs.trueFalseIcon(sy.systemInventoryStatus,sy.systemTicket),
                            systemStatus: strTgs.trueFalseIcon(sy.systemStatus,sy.systemStatus),
                            sysmodifiedOn: strTgs.dateMod(sy.modifiedOn),
                            equipLocation: tempSys.equipLocation,
                            equipLocationRack: strTgs.ruToLocation(tempSys.equipLocation),
                            equipSN: tempSys.equipSN,
                            equipStatus: tempSys.equipStatus,
                            equipStatusLight: strTgs.trueFalseIcon(tempSys.equipStatus,tempSys.equipStatus),
                            equipMake: tempSys.equipMake,
                            equipModel: tempSys.equipModel,
                            equipSubModel: tempSys.equipSubModel,
                    };
                }),
            };
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/env-role-report', context);
        });}});
    }else{
        var context = {
                titleNow: dcabbr,
                reportType: req.body.systemEnviron,
                drop1:"Environment",
                drop1url:"/env-role-report/env-",
                drop1each: env.sort(),
                drop2:"Roles",
                drop2url:"/env-role-report/role-",
                drop2each: role.sort(),
                
        };
        res.render('asset/env-role-report', context);
        }});});
};

// Map Reduce in use !! for count of systems in env.
exports.dcSystemCountbyEnv  = function(req,res,next){
    
  //  Systemdb.aggregate({ $match: { seller: user, status: 'completed' } }, {
  //  $group: { _id: '$customer', count: {$sum: 1}}}.exec()
    
    /*MrSystemEnviron.find({}).sort({'_id':'desc'}).exec(function(err, sys){
    if(err){
    logger.info(err);
    }else{
            
            var context ={
            envCnt: model.map(function(ec){
                return{
                systemEnviron: ec._id,
                systemCount: ec.value,
                };
            })};
            res.render('asset/reportselect', context);
            }});*/
};
 
//    Systemdb.distinct({systemEnviron}).sort({'systemEnviron':'desc').exec(function(err,env){
//    Systemdb.
    
//    });

/* ---------------------------------------------------------------------
-----------------------   New and copy system POST working   --------
------------------------------------------------------------------------
*/
exports.dcSystemPost = function(req,res){
    var bd = req.body;
    // this makes the abbreviation available for the URL
    res.abbreviation = strTgs.clTrim(bd.systemName);
    logger.info("dcRackPost abbreviation>"+strTgs.clTrim(bd.systemName));

    //logger.info("rUs expanded >"+ strTgs.compUs(req.body.rUs));
    if (!bd.isEdit){

    logger.info("new System in DC");
    varPortsNew = function(bd){
    if(typeof bd.sysPortName[i] !== 'undefined'){
    var Ports = [];
    for(i=0;i<bd.sysPortName.length;i++){
        logger.info("sysPortName.length "+bd.sysPortName.length);
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
       //logger.info("existing id>"+thisDoc);
        if (err) {
            logger.info(err);
            res.redirect('location/datacenter/'+res.abbreviation);
        } else {
    
    for(i=0;i<bd.sysPortType.length;i++){
        logger.info("equip \n Portname >"+bd.sysPortName[i] +" - path >"+ bd.sysPortCablePath[i] +" - endpoint >"+ bd.sysPortEndPoint[i] +" - Opt >"+ bd.sysPortOptions[i]/*+"crossover"+strTgs.doCheckbox(bd.sysPortCrossover[i]  future*/);
        if(!bd.sysPortType[i]){
            logger.info("No new port");
            }else if(bd.sysPortId[i] === "new"){
            logger.info("new port >"+bd.sysPortId[i]);
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
            logger.info("existing port");
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
/*---------------------------------------------------------------------
---------------------------- System Delete ------------------------------
------------------------------------------------------------------------
*/
exports.dcsystemDelete = function(req,res){
    res.abbreviation = req.body.systemName;
    res.newpage = req.body.equipLocationRack;
if (req.body.systemName){
        logger.info("delete got this far");
        Systemdb.findOne({systemName: req.body.systemName},function(err,systemNametodelete){
        if(err){
        logger.info(err);
        //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        }else{
            systemNametodelete.remove(function(err){
                if(err){
                logger.info(err);
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
                    message: 'System '+ res.abbreviation +' has been deleted.',
                };
                return res.redirect(303, '/equipment-systems/'+res.newpage);
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
        logger.info(err);
        //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        }else{
            sys.systemPorts.id(req.body.subId).remove();
            sys.save(function(err){
                if(err){
                logger.info(err);
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