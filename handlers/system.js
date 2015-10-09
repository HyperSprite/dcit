
var      async = require('async'),
        logger = require('../lib/logger.js'),
        strTgs = require('../lib/stringThings.js'),
     accConfig = require('../config/access'),
         dates = require('../lib/dates.js'),
        moment = require('moment'),
      ObjectId = require('mongoose').Types.ObjectId;

// Models
var Datacenter = require('../models/datacenter.js'),
          Rack = require('../models/rack.js'),
     Optionsdb = require('../models/options.js'),
     Equipment = require('../models/equipment.js'),
      Systemdb = require('../models/system.js'),
MrSystemEnviron= require('../models/mrsystemenviron.js');
var IpSubnetCalculator = require( 'ip-subnet-calculator' );

var start  = '',
    editLoad =0,
    dcabbr = '',
    dcInfo = '',
    dcInfoSplit = '',
    dcSubId = '',
    dcId ='';

    var query;

//---------------------------------------------------------------------     
//----------------------   System List  ----------------------------
//--------------------------------------------------------------------- 
/*
this is the Equip List block. Looks for 'List' in the URL and returns list of Equipment.
*/
exports.dcSystemPages = function(req,res,next){
    if (accConfig.accessCheck(req.user).read !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{
    //logger.info('***********exports.dcSystemPages First >' +req.params.datacenter);
    if (!req.params.datacenter ){
    logger.info('in List');
    // this looks for 'list' as the / url. if it exists, it prints the datacenter list
        Systemdb.find({}).sort({'modifiedOn': 'desc'}).exec(function(err, sys){
        if(err){
logger.warn('dcSystemPages'+err);
        }else{
        //logger.info('system-list'+sys);
            var context = {
                access : accConfig.accessCheck(req.user),
                user : req.user,
                requrl : req.url,
                sys: sys.map(function(sy){
                       // rack.populate('rackParentDC', 'abbreviation cageNickname')
                    //logger.info('sy Map>'+sy);
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


    } else if (req.params.datacenter.indexOf ('+new+') !=-1){
        //logger.info('else if (req.params.datacenter.indexOf ("newSys")');
        //logger.info('datacenter '+req.params.datacenter);
        start = req.params.datacenter.indexOf ('-')+1;
        //    logger.info('|start   >'+start);
        dcId = req.params.datacenter.substring (start);
        //    logger.info('|dcId    >'+dcId);

    Optionsdb.find({}, 'optListKey optListArray',function(err,opt){
        if(err)return next(err);
        
    Systemdb.find({},{'systemName':1,'_id':0},{sort:{systemName:1}},function(err,sysName){
        if(err) return next(err);
        if(!sysName) return next();
        var sysUni=[];
        var sysNameLen = sysName.length;
        for(i=0;i<sysNameLen;i++){
        sysUni[i] = sysName[i].systemName;
        }

    
    Equipment.find({},{ 'equipSN':1,'_id': 0},{sort:{equipSN:1}},function(err, eq){
        if(err) return next(err);
        if(!eq) return next();
        //logger.info('rk'+rk);
        var eqUni=[];
        var eqLen = eq.length;
        for(i=0;i<eqLen;i++){
        eqUni[i] = eq[i].equipSN;
        //logger.info('rackUni >'+rackUni[i]);
        }
      
            context ={
                access : accConfig.accessCheck(req.user),
                user : req.user,
                requrl : req.url,
                titleNow: 'New System',
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
    if (req.params.datacenter.indexOf ('edit') !=-1){
    //    logger.info('else if (req.params.datacenter.indexOf ("edit")');
    // this section decides if it is a Copy, Edit or View

        start = req.params.datacenter.indexOf ('-');
        syName = req.params.datacenter.substring (start+1);
            if (req.params.datacenter.indexOf ('copy') !=-1){
            editLoad = 5;
        //    logger.info('copy system '+sysName);
        } else {
            editLoad = 3;
        //    logger.info('edit system '+sysName);
        }
        } else {
            editLoad = 1;
            syName = req.params.datacenter;
        //    logger.info('view system '+sysName);
        }
        //logger.info('editLoad >'+editLoad);


// note to self, may need to seperate this out so I can do the DC search which is not needed on the on the copy.
// or
// move datacenter search up, return only network 
// then do two find this in that, find DC from Loc, then Find vlan, down in the port section to get the ports


    
    Systemdb.find({},{'systemName':1,'systemAlias':1,'systemParentId':1,'_id':0},{sort:{systemName:1}},function(err,sysName){
        if(err) return next(err);
        if(!sysName) return next();
        var sysUni=[];
        var sysNameLen = sysName.length;
        for(i=0;i<sysNameLen;i++){
        sysUni[i] = sysName[i].systemName;
        }

    Systemdb.findOne({systemName: syName.toLowerCase()},function(err,sy){
        if(err) return next(err);
        if(!sy) return next();
        //logger.info(datacenter);
    //Optionsdb.findOne({optListKey: 'optEquipStatus'},function(err,opt){
    //    if(err)return next(err);
    
    Optionsdb.find({}, 'optListKey optListArray',function(err,opt){
        if(err)return next(err);
        
    Equipment.find({},{ 'equipSN':1,'equipLocation':1,'equipMake':1,'equipModel':1,'equipSubModel':1,'equipStatus':1,'equipType':1,'equipRUHieght':1,'equipPorts':1,'equipAddOns':1,'_id':0},{sort:{equipSN:1}},function(err, eq){
    var dcabbr,thisEquip;
    if(editLoad < 4){
        thisEquip = strTgs.findThisInThat2(sy.systemEquipSN,eq);
        dcabbr = strTgs.getDCfromLoc(thisEquip.equipLocation);
    }
    Datacenter.findOne({abbreviation: dcabbr},{'networks':1,'_id':0},function(err,oneDC){
        


//logger.info('Date: '+sy.systemInstall);

        if(err) return next(err);
        if(!eq) return next();
        //logger.info('rk'+rk);
        var eqUni=[];
        var eqLen = eq.length;
        for(i=0;i<eqLen;i++){
        eqUni[i] = eq[i].equipSN;
        }

        //logger.info ('System.findOne '+dcabbr);
        if(editLoad < 4){ // Edit or View
            //thisEquip = strTgs.findThisInThat2(sy.systemEquipSN,eq);
            
            var dcNet,findThis;
            
            //dcabbr = strTgs.getDCfromLoc(thisEquip.equipLocation);
            //logger.info('dc > '+dc);
            //thisDC = strTgs.findThisInThatDC(dcabbr,dc);
            //logger.info('thisDC > '+thisDC);


            var hasIlom,makeMod,isACS6000,isServTechPDU,sTHostName,sTHostAB;
            if(thisEquip.equipMake && thisEquip.equipModel !== false){
            makeMod = thisEquip.equipMake.toLowerCase()+thisEquip.equipModel.toLowerCase();
            //logger.info('makeMod >'+makeMod);
                if(makeMod.indexOf ('oracle') !=-1 || makeMod.indexOf ('sun') !=-1){
                    hasIlom = 1;
                    //logger.info('hasIlom >'+hasIlom);
                } else if(makeMod.indexOf ('avocent') !=-1 && makeMod.indexOf ('60') !=-1){
                    isACS6000 = 1;
                    //logger.info('isACS6k >'+isACS6000);
                } else if(makeMod.indexOf ('server technology') !=-1){
                    // removes the A and B from the end of the PDU name
                    sTHostName = sy.systemName.substring(0,sy.systemName.length -1);
                    // A or B from end of PDU name
                    sTHostAB = sy.systemName.substring(sy.systemName.length -1);
                    if (sTHostAB === 'a'){
                        isServTechPDU = 1;
                    }
                }
            thisEquipPortsMapped = thisEquip.equipPorts.map(function(tep){
                return {
                    equipPortType: tep.equipPortType,
                    equipPortsAddr: tep.equipPortsAddr,
                    equipPortName: tep.equipPortName,
                    equipPortsOpt: tep.equipPortsOpt,
                };
                });
            }else{
                thisEquipPortsMapped = '';
            }
        context = {
            access : accConfig.accessCheck(req.user),
            user : req.user,
            requrl : req.url,
            titleNow: sy.systemName,
            menu1: 'Show connected ports',
            menuLink1: '/endpoint/'+sy.systemName,
            ilom: hasIlom,
            isACS6000: isACS6000,
            isServTechPDU: isServTechPDU,
            sTHostName: sTHostName,
            sTHostAB: sTHostAB,
            sysNameList: sysUni,
            equipSNList: eqUni,
            optSystPortType: strTgs.findThisInThatOpt('optSystPortType',opt),
            optSystStatus: strTgs.findThisInThatOpt('optSystStatus',opt),
            optEnvironment: strTgs.findThisInThatOpt('optEnvironment',opt),
            optImpactLevel: strTgs.findThisInThatOpt('optImpactLevel',opt),
            systemId: sy._id,
            systemName: sy.systemName,
            systemEquipSN: sy.systemEquipSN,
            systemAlias: sy.systemAlias,
            systemEnviron: sy.systemEnviron,
            systemRole: sy.systemRole,
            systemInventoryStatus: sy.systemInventoryStatus,
            systemInventoryStatusChecked: strTgs.setCheckBox(sy.systemInventoryStatus),
            systemTicket: sy.systemTicket,
            systemTicketLit: strTgs.trueFalseIcon(sy.systemInventoryStatus,sy.systemTicket),
            systemStatus: sy.systemStatus,
            systemStatusLit: strTgs.trueFalseIcon(sy.systemStatus,sy.systemStatus),
            systemOwner: sy.systemOwner,
        //    systemImpact: sy.systemImpact,
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
                    var isConsole,
                        isEthernet,
                        isInfiniband,
                        isInterconnect,
                        isNetMgmt,
                        isPower,
                        isSAN,
                        dcNet,
                        netMask,
                        endPointAlias;
                    switch(sp.sysPortType){
                        case 'Console':
                        isConsole = 'isConsole';
                        break;
                        case 'Ethernet':
                        isEthernet = 'isEthernet';

                            endPointAlias = strTgs.findThisInThat3(sp.sysPortEndPoint,sysName);
                            
                        break;
                        case 'Infiniband':
                        isInfiniband = 'isInfiniband';
                        break;
                        case 'Interconnect':
                        isInterconnect = 'isInterconnect';
                        break;
                        case 'NetMgmt':
                        isNetMgmt ='isNetMgmt';
                        
                        if(!sp.sysPortVlan  || thisEquip === false){
                            //logger.info('findThisInThat.findThis is null');
                            dcNet = false;
                            netMask = false;
                        }else{
                            //logger.info('dc > '+oneDC);
                            dcNet=strTgs.findThisInThatNetwork(sp.sysPortVlan,oneDC.networks);
                            if(dcNet !== false){
                            netMask = IpSubnetCalculator.calculateSubnetMask( dcNet.dcNetNetwork, dcNet.dcNetMask );
                            netMask = netMask.prefixMaskStr;
                            }
                        }
                            endPointAlias = strTgs.findThisInThat3(sp.sysPortEndPoint,sysName);

                        //dcNet = strTgs.findThisInThatNetwork(sp.sysPortVlan,dc);
                        //logger.info('system.dcNetwork >>>'+ dcNet);
                        break;
                        case 'Power':
                        isPower = 'isPower';
                        break;
                        case 'SAN':
                        isSAN = 'isSAN';
                        break;
                        default:
                        break;
                    }

                    return {
                    sysPortisConsole: isConsole,
                    sysPortisEthernet: isEthernet,
                    sysPortisInfiniband: isInfiniband,
                    sysPortisInterconnect: isInterconnect, 
                    sysPortisNetMgmt: isNetMgmt, 
                    sysPortisPower: isPower, 
                    sysPortisSAN: isSAN, 

                    dcNet: dcNet,
                    netMask: netMask,
                    endPointAlias: endPointAlias,

                    sysPortId: sp._id,
                    systemName: sy.systemName,
                    systemAlias: sy.systemAlias,
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
            equipLocation: thisEquip.equipLocation,
            equipLocationRack: strTgs.ruToLocation(thisEquip.equipLocation),
            equipStatus: thisEquip.equipStatus,
            equipStatusLight: strTgs.trueFalseIcon(thisEquip.equipStatus,thisEquip.equipStatus),
            equipType: thisEquip.equipType,
            equipMake: thisEquip.equipMake,
            equipModel: thisEquip.equipModel,
            equipSubModel: thisEquip.equipSubModel,
            equipRUHieght: thisEquip.equipRUHieght,
            equipAddOns: thisEquip.equipAddOns,        
            equipPorts: thisEquipPortsMapped,
            
            }; 
        } else { // Copy
            context = {
                    access : accConfig.accessCheck(req.user),
                    user : req.user,
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
               //     systemImpact: sy.systemImpact,
                    systemIsVirtual: sy.systemIsVirual,
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
                        systemPorts: sy.systemPorts.map(function(sp){
                            return {
                            sysPortType: sp.sysPortType,
                            sysPortName: sp.sysPortName,
                            sysPortVlan: sp.sysPortVlan,
                            sysPortOptions: sp.sysPortOptions,
                        };
                    }),
            };     
        }                    
 
        //logger.info(context);
        if (editLoad > 2){
        //    logger.info('System Edit(end)');
            res.render('asset/systemedit', context); 
        }else{
        res.render('asset/system', context);  
        }
        });});});});});
    }
}
};

//  /////////////////////////////////////////////////////////////////////////
//  _______ System Ports Report  __________________________________________________
//  ////////////////////////////////////////////////////////////////////////

exports.dcSystemPortPages = function(req,res,next){
    if (accConfig.accessCheck(req.user).read !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{ 
    //logger.info('--------------------exports.dcSystemPortPages First >');
    if (!req.params.datacenter ){
        Systemdb.find({}).sort({'modifiedOn': 'desc'}).exec(function(err, sys){
        if(err){
    //    logger.info(err);
        }else{
        //logger.info('system-list'+sys);
            var context = {
                access : accConfig.accessCheck(req.user),
                user : req.user,
                requrl : req.url,
                sys: sys.map(function(sy){
                       // rack.populate('rackParentDC', 'abbreviation cageNickname')
                    //logger.info('sy Map>'+sy);
                    return {
                            systemPorts: sy.systemPorts.map(function(sp){
                        return {
                                systemName: sy.systemName,
                                equipSN: sy.systemEquipSN,
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
                       }         
                    )};
                })
            };
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/systemports-list', context);
        }});
    }

    } 
};


//  /////////////////////////////////////////////////////////////////////////
//  _______ EquipSys Report Switch __________________________________________________
//  ////////////////////////////////////////////////////////////////////////

    function queryString(findThis,opt,searchIn){   
    //    logger.info('searchIn '+searchIn);
        switch (opt){
        case 2: // by Environment
            query = Systemdb.find({systemEnviron : findThis});
    //        logger.info('query2'+query);
            break;
        case 3: //by Role
            query = Systemdb.find({systemRole : findThis});
    //        logger.info('query3'+query);
            break;
        case 4: // by System Name (no longer used, now uses Multi)
            query = Systemdb.find({ 'systemName': { '$regex': findThis, '$options': 'i' } });
            break;
        case 8: // multi SystemDB
            switch (searchIn){
                case 'systemName':
                    findThis = strTgs.csTrim(findThis);
                    query = Systemdb.find({ 'systemName': { '$regex': findThis, '$options': 'i' } });
                break;
                case 'systemAlias':
                    findThis = strTgs.cTrim(findThis);
                    query = Systemdb.find({ 'systemAlias': { '$regex': findThis, '$options': 'i' } });
                break;
                case 'systemTicket':
                    findThis = strTgs.cTrim(findThis);
                    query = Systemdb.find({ 'systemTicket': { '$regex': findThis, '$options': 'i' } });
                break;
                case 'modifiedBy':
                    findThis = findThis;
                    query = Systemdb.find({ 'modifiedBy': { '$regex': findThis, '$options': 'i' } });
                break;   
                case 'sysPortCablePath':
                    findThis = strTgs.stTrim(findThis);
                    query = Systemdb.find({ 'systemPorts.sysPortCablePath': { '$regex': findThis, '$options': 'i' } });
                break;
                case 'sysPortEndPoint':
                    findThis = strTgs.stTrim(findThis);
                    query = Systemdb.find({ 'systemPorts.sysPortEndPoint': { '$regex': findThis, '$options': 'i' } });
                break;
                case 'sysPortAddress':
                    findThis = strTgs.stTrim(findThis);
                    query = Systemdb.find({ 'systemPorts.sysPortAddress': { '$regex': findThis, '$options': 'i' } });
                break; 
                default:
    //                logger.info('no opt for queryString');
                break;
                }
            break;
        case 10: // Equipment SN (no longer used, now uses Multi)
            query = Equipment.find({ 'equipSN': { '$regex': findThis, '$options': 'i' } });
            break;
        case 11: // by Make
            query = Equipment.find({equipMake : findThis});
    //        logger.info('query11'+query);
            break;
        case 12: // Homeless equipment
            query = Equipment.find({equipLocation : ''});
    //        logger.info('query12'+query);
            break;
        case 13: // Not In Service
            query = Equipment.find({'equipStatus':{$nin:['In Service','In Service with issues','End of Life','End of Life - Recycled','End of Life - RMA']}});
    //        logger.info('query13'+query);
            break;
        case 14: // End of life    
            query = Equipment.find({'equipStatus':{$in:['End of Life','Missing','End of Life - Recycled','End of Life - RMA']}});
    //        logger.info('query13'+query);
            break;
        case 15: // Spares
            query = Equipment.find({'equipStatus':{$in:['Spare']}});
    //        logger.info('query13'+query);
            break;
        case 18: // multi Equipment
            switch (searchIn){
                case 'equipSN':
                    findThis = strTgs.cTrim(findThis);
                    query = Equipment.find({ 'equipSN': { '$regex': findThis, '$options': 'i' } });
                break;   
                case 'equipAssetTag':
                    findThis = strTgs.sTrim(findThis);
                    query = Equipment.find({ 'equipAssetTag': { '$regex': findThis, '$options': 'i' } });
                break;
                case 'equipTicketNumber':
                    findThis = strTgs.cTrim(findThis);
                    query = Equipment.find({ 'equipTicketNumber': { '$regex': findThis, '$options': 'i' } });
                break;   
                case 'equipPONum':
                    findThis = strTgs.uTrim(findThis);
                    query = Equipment.find({ 'equipPONum': { '$regex': findThis, '$options': 'i' } });
                break;   
                case 'equipInvoice':
                    findThis = strTgs.uTrim(findThis);
                    query = Equipment.find({ 'equipInvoice': { '$regex': findThis, '$options': 'i' } });
                break;   
                case 'equipProjectNum':
                    findThis = strTgs.uTrim(findThis);
                    query = Equipment.find({ 'equipProjectNum': { '$regex': findThis, '$options': 'i' } });
                break;   
                case 'modifiedBy':
                    query = Equipment.find({ 'modifiedBy': { '$regex': findThis, '$options': 'i' } });
                break;
                case 'equipPortsAddr':
                    findThis = strTgs.mTrim(findThis);
                    query = Equipment.find({ 'equipPorts.equipPortsAddr': { '$regex': findThis, '$options': 'i' } });
                break;
                case 'equipLocation':
                    findThis = strTgs.sTrim(findThis);
                    query = Equipment.find({ 'equipLocation': { '$regex': findThis, '$options': 'i' } });
                break;

                
                default:
                    //logger.info('no opt for queryString');
                break;
            }
            break;
            default:
    //        logger.info('no opt for queryString');
        break;
        }
        return query;
    }


// -------------------------------------------------------------
//           list by Env and Role env-role-reports
// -------------------------------------------------------------
        
exports.dcSystembyEnvRole = function(req,res,next){
    if (accConfig.accessCheck(req.user).read !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{ 
//    logger.info('***********exports.dcSystembyEnv First >' +req.params.datacenter);

    var lastSearch,
        editLoad,
        searchDb,
        searchIn,
        searchFor;
    
    if(!req.params.datacenter){
            editLoad = 1;
//            logger.info('none slected');
        }else{
        lastSearch = searchIn; //.substring (req.params.datacenter.indexOf('~')+1);
        start = req.params.datacenter.indexOf ('-');
        searchFor = req.params.datacenter.substring (start+1);
            if (req.params.datacenter.indexOf ('env') !=-1){
            editLoad = 2;
            
        } else if(req.params.datacenter.indexOf ('role') !=-1){
            editLoad = 3;
            
        } else if(req.params.datacenter.indexOf ('system') !=-1){
            editLoad = 4;        
                searchFor = strTgs.csTrim(req.query.systemName);

        }else if(req.params.datacenter.indexOf ('equipment') !=-1){
            editLoad = 10;
                searchFor = strTgs.cTrim(req.query.equipSN);

        }else if(req.params.datacenter.indexOf ('make') !=-1){
            editLoad = 11;

        }else if(req.params.datacenter.indexOf ('homeless') !=-1){
            editLoad = 12;

        }else if(req.params.datacenter.indexOf ('eqnis') !=-1){
            editLoad = 13;

        }else if(req.params.datacenter.indexOf ('eol') !=-1){
            editLoad = 14;

        }else if(req.params.datacenter.indexOf ('spares') !=-1){
            editLoad = 15;    

        }else if(req.params.datacenter.indexOf ('multi') !=-1){
            lastSearch = req.query.searchIn;
            searchIn = req.query.searchIn.substring (req.query.searchIn.indexOf('~')+1);
            
//            logger.info('searchIn '+searchIn);
            searchFor = req.query.searchFor;
//            logger.info('searchFor '+searchFor);
            if (req.query.searchIn.indexOf ('system') !=-1){
                editLoad = 8;
            }else if (req.query.searchIn.indexOf ('equipment') !=-1){
                editLoad = 18;
            }    
        }else {
            editLoad = 1;
//            logger.info('none slected');
        }}
//        logger.info('page type selected >'+editLoad);
    
        Systemdb.distinct('systemEnviron').exec(function(err,env){
        //logger.info(env);
        Systemdb.distinct('systemRole').exec(function(err,role){
        //logger.info(role);
        Equipment.distinct('equipMake').exec(function(err,make){
        
    if(editLoad>1 && editLoad<9){

    // this looks for 'list' as the / url. if it exists, it prints the datacenter list
        query = queryString(searchFor,editLoad,searchIn);
        query.sort({'systemName': 'asc'}).exec(function(err, sys){
        if(err){
logger.warn(asc+' '+err);
        }else{
//        logger.info('2-9 >'+searchFor);
        Equipment.find({},'equipLocation equipSN equipStatus equipType equipMake equipModel equipSubModel equipAddOns modifiedOn equipAcquisition equipEndOfLife equipWarrantyMo equipPONum equipInvoice equipProjectNum equipNotes',function(err,eqs){
         
        //logger.info('system-list'+sys);
            var context = {
                access : accConfig.accessCheck(req.user),
                user : req.user,
                requrl : req.url,
                titleNow: '.. '+searchFor,
                equipsys: 'true',
                reportType: req.body.systemEnviron,
                drop1:'Environment',
                drop1url:'/env-role-report/env-',
                drop1each: env.sort(),
                drop2:'Roles',
                drop2url:'/env-role-report/role-',
                drop2each: role.sort(),
                drop3:'Make',
                drop3url:'/env-role-report/make-',
                drop3each: make.sort(),
                lastSearch: lastSearch,

            
                eqs: sys.map(function(sy){
                tempSys = strTgs.findThisInThat2(sy.systemEquipSN,eqs);
                       // rack.populate('rackParentDC', 'abbreviation cageNickname')
                    //logger.info('sy Map>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+sy);
                    return {
                            systemName: sy.systemName,
                            systemEquipSN: sy.systemEquipSN,
                            systemEnviron: sy.systemEnviron,
                            systemRole: sy.systemRole,
                            systemTicketLit: strTgs.trueFalseIcon(sy.systemInventoryStatus,sy.systemTicket),
                            systemStatus: strTgs.trueFalseIcon(sy.systemStatus,sy.systemStatus),
                            sysmodifiedOn: strTgs.dateMod(sy.modifiedOn),
                            systemTicket: sy.systemTicket,
                            systemNotes: sy.systemNotes,
                            equipLocation: tempSys.equipLocation,
                            equipLocationRack: strTgs.ruToLocation(tempSys.equipLocation),
                            equipSN: tempSys.equipSN,
                            equipStatus: tempSys.equipStatus,
                            equipStatusLight: strTgs.trueFalseIcon(tempSys.equipStatus,tempSys.equipStatus),
                            equipType: tempSys.equipType,
                            equipMake: tempSys.equipMake,
                            equipModel: tempSys.equipModel,
                            equipSubModel: tempSys.equipSubModel,
                            equipAddOns: tempSys.equipAddOns,
                            equipAcquisition: strTgs.dateMod(tempSys.equipAcquisition),
                            equipWarrantyMo: strTgs.addAndCompDates(tempSys.equipAcquisition, tempSys.equipWarrantyMo),
                            equipPONum: tempSys.equipPONum,
                            equipInvoice: tempSys.equipInvoice,
                            equipProjectNum: tempSys.equipProjectNum,
                            equipNotes: tempSys.equipNotes,
                            equipmodifiedOn: strTgs.dateMod(tempSys.modifiedOn),
                    };
                }),
            };
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/env-role-report', context);
        });}});
    }else if (editLoad>9){

    // this looks for 'list' as the / url. if it exists, it prints the datacenter list
        query = queryString(searchFor,editLoad,searchIn);
        query.sort({'equipSN': 'asc'}).exec(function(err, eqs){
        if(err){
logger.warn(asc+' '+err);
        }else{
        //logger.info('>9 >'+searchFor);
        Systemdb.find({},'systemName systemEquipSN systemEnviron systemRole systemInventoryStatus systemTicket systemNotes systemStatus modifiedOn',function(err,sys){
         
        //logger.info('system-list'+sys);
            var context = {
                access : accConfig.accessCheck(req.user),
                user : req.user,
                requrl : req.url,
                titleNow: '.. '+searchFor,
                equipsys: 'true',
                reportType: req.body.systemEnviron,
                drop1:'Environment',
                drop1url:'/env-role-report/env-',
                drop1each: env.sort(),
                drop2:'Roles',
                drop2url:'/env-role-report/role-',
                drop2each: role.sort(),
                drop3:'Make',
                drop3url:'/env-role-report/make-',
                drop3each: make.sort(),
                lastSearch: lastSearch,

                eqs: eqs.map(function(eq){
                tempSys = strTgs.findThisInThat(eq.equipSN,sys);
                       // rack.populate('rackParentDC', 'abbreviation cageNickname')
                    //logger.info('sy Map>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+sy);
                    return {
                            systemName: tempSys.systemName,
                            systemEquipSN: tempSys.systemEquipSN,
                            systemEnviron: tempSys.systemEnviron,
                            systemRole: tempSys.systemRole,
                            systemTicketLit: strTgs.trueFalseIcon(tempSys.systemInventoryStatus,tempSys.systemTicket),
                            systemStatus: strTgs.trueFalseIcon(tempSys.systemStatus,tempSys.systemStatus),
                            sysmodifiedOn: strTgs.dateMod(tempSys.modifiedOn),
                            systemTicket: tempSys.systemTicket,
                            systemNotes: tempSys.systemNotes,
                            equipLocation: eq.equipLocation,
                            equipLocationRack: strTgs.ruToLocation(eq.equipLocation),
                            equipSN: eq.equipSN,
                            equipStatus: eq.equipStatus,
                            equipStatusLight: strTgs.trueFalseIcon(eq.equipStatus,eq.equipStatus),
                            equipType: eq.equipType,
                            equipMake: eq.equipMake,
                            equipModel: eq.equipModel,
                            equipSubModel: eq.equipSubModel,
                            equipAddOns: eq.equipAddOns,
                            equipAcquisition: strTgs.dateMod(eq.equipAcquisition),
                            equipWarrantyMo: strTgs.addAndCompDates(eq.equipAcquisition, eq.equipWarrantyMo),
                            equipPONum: eq.equipPONum,
                            equipInvoice: eq.equipInvoice,
                            equipProjectNum: eq.equipProjectNum,
                            equipNotes: eq.equipNotes,
                            equipmodifiedOn: strTgs.dateMod(eq.modifiedOn),
                    };
                }),
            };
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('asset/env-role-report', context);
        });}});

    }else{
        var context = {
                access : accConfig.accessCheck(req.user),
                user : req.user,
                requrl : req.url,
                titleNow: searchFor,
                reportType: req.body.systemEnviron,
                drop1:'Environment',
                drop1url:'/env-role-report/env-',
                drop1each: env.sort(),
                drop2:'Roles',
                drop2url:'/env-role-report/role-',
                drop2each: role.sort(),
                drop3:'Make',
                drop3url:'/env-role-report/make-',
                drop3each: make.sort(),     
        };
        res.render('asset/env-role-report', context);
        }});});});
}
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

exports.findEndpoints = function(req,res,next){
    if (accConfig.accessCheck(req.user).read !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{ 
    var fEndPoint = req.params.datacenter.toLowerCase();
    if(!fEndPoint){
//    logger.warn('findEndpoints: No endpoint found');
    return;
    }else{
//    logger.info('findEndpoints >'+fEndPoint);

        Systemdb.find({'systemPorts.sysPortEndPoint': fEndPoint},'systemName systemPorts.sysPortName systemPorts.sysPortCablePath systemPorts.sysPortEndPoint systemPorts.sysPortEndPointPre systemPorts.sysPortEndPointPort systemPorts.sysPortVlan systemPorts.sysPortOptions systemPorts.sysPortAddress systemPorts.sysPortType',function(err,sys){
        if(err) return next(err);
        //logger.info('sys > '+sys);
        context = {
            access : accConfig.accessCheck(req.user),
            user : req.user,
            requrl : req.url,
                titleNow:fEndPoint,
                sysPortEndPoint:fEndPoint,
                menu1: 'Show '+fEndPoint+' details',
                menuLink1: '/system/'+fEndPoint,
                sys: sys.map(function(sy){
                    return {
                        systemPorts: sy.systemPorts.map(function(sysPort){
                        if(sysPort.sysPortEndPoint===fEndPoint){
                    var isConsole,
                        isEthernet,
                        isInfiniband,
                        isInterconnect,
                        isNetMgmt,
                        isPower,
                        isSAN;
                        switch(sysPort.sysPortType){
                        case 'Console':
                        isConsole = 'isConsole';
                        break;
                        case 'Ethernet':
                        isEthernet = 'isEthernet';
                        break;
                        case 'Infiniband':
                        isInfiniband = 'isInfiniband';
                        break;
                        case 'Interconnect':
                        isInterconnect = 'isInterconnect';
                        break;
                        case 'NetMgmt':
                        isNetMgmt ='isNetMgmt';
                        break;
                        case 'Power':
                        isPower = 'isPower';
                        break;
                        case 'SAN':
                        isSAN = 'isSAN';
                        break;
                        default:
                        break;
                    }
                        return{
                        sysPortisConsole: isConsole,
                        sysPortisEthernet: isEthernet,
                        sysPortisInfiniband: isInfiniband,
                        sysPortisInterconnect: isInterconnect, 
                        sysPortisNetMgmt: isNetMgmt, 
                        sysPortisPower: isPower, 
                        sysPortisSAN: isSAN,
                        systemName: sy.systemName,
                        sysPortName: sysPort.sysPortName,
                        sysPortCablePath: sysPort.sysPortCablePath,
                        sysPortEndPoint: sysPort.sysPortEndPoint,
                        sysPortEndPointPre: sysPort.sysPortEndPointPre,
                        sysPortEndPointPortPad: strTgs.pad(sysPort.sysPortEndPointPort),
                        sysPortEndPointPort: sysPort.sysPortEndPointPort,
                        sysPortVlan: sysPort.sysPortVlan,
                        sysPortOptions: sysPort.sysPortOptions,
                        sysPortAddress: sysPort.sysPortAddress,
                        sysPortType: sysPort.sysPortType,
                        };}
                    }),
                    };
                }),
        
        };
        res.render('asset/endpointports-list', context);  
    
    });}
}
};


 
//    Systemdb.distinct({systemEnviron}).sort({'systemEnviron':'desc').exec(function(err,env){
//    Systemdb.
    
//    });

/* ---------------------------------------------------------------------
-----------------------   New and copy system POST working   --------
------------------------------------------------------------------------
*/
exports.dcSystemPost = function(req,res){
    if (accConfig.accessCheck(req.user).edit !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{ 
    var bd = req.body;
    var backURL=req.header('Referer') || '/';
    // this makes the abbreviation available for the URL
    res.abbreviation = strTgs.csTrim(bd.systemName);
    res.equipLocation = bd.equipLocation;
 //   logger.info('dcRackPost abbreviation>'+strTgs.clTrim(bd.systemName));

    //logger.info('rUs expanded >'+ strTgs.compUs(req.body.rUs));
    if (!bd.isEdit){

    //logger.info('new System in DC');
    varPortsNew = function(bd){
    if(!bd.sysPortName[i] !== ''){
    var Ports = [];
    var bdSysPortNameLen = bd.sysPortName.length;
    for(i=0;i<bdSysPortNameLen;i++){
    //    logger.info('sysPortName.length '+bd.sysPortName.length);
        Ports[i]=({
            sysPortType: strTgs.sTrim(bd.sysPortType[i]),
            sysPortName: strTgs.clTrim(bd.sysPortName[i]),
            sysPortAddress: strTgs.sTrim(bd.sysPortAddress[i]),
            sysPortCablePath: strTgs.clTrim(bd.sysPortCablePath[i]),
            sysPortEndPoint: strTgs.clTrim(bd.sysPortEndPoint[i]),
            sysPortEndPointPre: strTgs.clTrim(bd.sysPortEndPointPre[i]),
            sysPortEndPointPort: strTgs.clTrim(bd.sysPortEndPointPort[i]),
            sysPortVlan: strTgs.sTrim(bd.sysPortVlan[i]),
            sysPortOptions: strTgs.clTrim(bd.sysPortOptions[i]),
            sysPortURL: strTgs.clTrim(bd.sysPortURL[i]),
            //sysPortCrossover: bd.sysPortCrossover[i],
            });
        }
        return Ports;
    }};
    
    Systemdb.create({
        systemPorts: varPortsNew(bd),
        systemName: strTgs.csTrim(bd.systemName),
        systemEquipSN: strTgs.cTrim(bd.systemEquipSN),
        systemAlias: strTgs.clTrim(bd.systemAlias),
        systemEnviron: strTgs.clTrim(bd.systemEnviron),
        systemRole: strTgs.uTrim(bd.systemRole),
        systemInventoryStatus: bd.systemInventoryStatus,
        systemTicket: strTgs.clTrim(bd.systemTicket),
        systemStatus: bd.systemStatus,
        systemOwner: strTgs.uTrim(bd.systemOwner),
    //    systemImpact: bd.systemImpact,
        systemIsVirtual: bd.systemIsVirtual,
        systemParentId: strTgs.csTrim(bd.systemParentId),
        systemOSType: strTgs.uTrim(bd.systemOSType),
        systemOSVersion: strTgs.uTrim(bd.systemOSVersion),
        systemApplications: strTgs.uTrim(bd.systemApplications),
        systemSupLic: strTgs.uTrim(bd.systemSupLic),
        systemSupEndDate: strTgs.dateAddTZ(bd.systemSupEndDate,req.session.ses.timezone),
        systemInstall: strTgs.dateAddTZ(bd.systemInstall,req.session.ses.timezone),
        systemStart: strTgs.dateAddTZ(bd.systemStart,req.session.ses.timezone),
        systemEnd: strTgs.dateAddTZ(bd.systemEnd,req.session.ses.timezone),
        systemNotes: strTgs.uTrim(bd.systemNotes),
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
	                message: 'Looks like there is already a System by that name.',
	            };
                
                } else { 
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request. \n '+err.message,
	            };}
                return res.redirect(303, backURL);
	        }
            if (!req.body.wasCopy){
	        req.session.flash = {
	            type: 'success',
	            intro: 'Saved!',
	            message: '<a href="/system/'+res.abbreviation+'">'+res.abbreviation+'</a> has been created.',
                };
	        return res.redirect(303, '/system/'+ res.abbreviation);
            } else { 
            req.session.flash = {
	            type: 'success',
	            intro: 'Saved!',
	            message: '<a href="/system/'+res.abbreviation+'">'+res.abbreviation+'</a> has been created.',
                };
	        return res.redirect(303, '/system/copy~edit-'+ res.abbreviation);

            }
	    }
        );
        
	} else {
    Systemdb.findOne({systemName: req.body.isEdit},function(err,sys){
    res.abbreviation = req.body.systemName;

    var thisDoc = sys;
       //logger.info('existing id>'+thisDoc);
        if (err) {
            logger.warn(err);
            res.redirect('location/datacenter/'+res.abbreviation);
        } else {
    var bdSysPortTypeLen = bd.sysPortType.length;
    for(i=0;i<bdSysPortTypeLen;i++){
    //    logger.info('equip \n Portname >'+bd.sysPortName[i] +' - path >'+ bd.sysPortCablePath[i] +' - endpoint >'+ bd.sysPortEndPoint[i] +' - Opt >'+ bd.sysPortOptions[i]/*+'crossover'+strTgs.doCheckbox(bd.sysPortCrossover[i]  future*/);
        if(!bd.sysPortType[i]){
    //        logger.info('No new port');
            }else if(bd.sysPortId[i] === 'new'){
    //        logger.info('new port >'+bd.sysPortId[i]);
            sys.systemPorts.push({
                sysPortType: strTgs.sTrim(bd.sysPortType[i]),
                sysPortName: strTgs.clTrim(bd.sysPortName[i]),
                sysPortAddress: strTgs.sTrim(bd.sysPortAddress[i]),
                sysPortCablePath: strTgs.clTrim(bd.sysPortCablePath[i]),
                sysPortEndPoint: strTgs.clTrim(bd.sysPortEndPoint[i]),
                sysPortEndPointPre: strTgs.clTrim(bd.sysPortEndPointPre[i]),
                sysPortEndPointPort: strTgs.clTrim(bd.sysPortEndPointPort[i]),
                sysPortVlan: strTgs.sTrim(bd.sysPortVlan[i]),
                sysPortOptions: strTgs.stcTrim(bd.sysPortOptions[i]),
                sysPortURL: strTgs.clTrim(bd.sysPortURL[i]),
    /*            sysPortCrossover: strTgs.doCheckbox(bd.sysPortCrossover[i]),  future*/
            });
            }else{
    //        logger.info('existing port');
        var thisSubDoc = sys.systemPorts.id(bd.sysPortId[i]);
                thisSubDoc.sysPortType= strTgs.stcCleanup(thisSubDoc.sysPortType,bd.sysPortType[i]);
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
            thisDoc.systemName= strTgs.csTrim(bd.systemName);
            thisDoc.systemEquipSN= strTgs.cTrim(bd.systemEquipSN);
            thisDoc.systemAlias= strTgs.clTrim(bd.systemAlias),
            thisDoc.systemEnviron= strTgs.clTrim(bd.systemEnviron);
            thisDoc.systemRole= strTgs.uTrim(bd.systemRole);
            thisDoc.systemInventoryStatus= bd.systemInventoryStatus;
            thisDoc.systemTicket= strTgs.clTrim(bd.systemTicket);
            thisDoc.systemStatus= bd.systemStatus;
            thisDoc.systemOwner= strTgs.uTrim(bd.systemOwner);
        //    thisDoc.systemImpact= bd.systemImpact;
            thisDoc.systemIsVirtual= bd.systemIsVirtual;
            thisDoc.systemParentId= strTgs.csTrim(bd.systemParentId);
            thisDoc.systemOSType= strTgs.uTrim(bd.systemOSType);
            thisDoc.systemOSVersion= strTgs.uTrim(bd.systemOSVersion);
            thisDoc.systemApplications= strTgs.uTrim(bd.systemApplications);
            thisDoc.systemSupLic= strTgs.uTrim(bd.systemSupLic);

            thisDoc.systemSupEndDate= strTgs.dCleanup(thisDoc.systemSupEndDate,bd.systemSupEndDate,req.session.ses.timezone);
            thisDoc.systemInstall= strTgs.dCleanup(thisDoc.systemInstall,bd.systemInstall,req.session.ses.timezone);
            thisDoc.systemStart= strTgs.dCleanup(thisDoc.systemStart,bd.systemStart,req.session.ses.timezone);
            thisDoc.systemEnd= strTgs.dCleanup(thisDoc.systemEnd,bd.systemEnd,req.session.ses.timezone);
            
            thisDoc.systemNotes= strTgs.uTrim(bd.systemNotes);
            thisDoc.modifiedOn = moment();
            thisDoc.modifiedBy = req.user.local.email;
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
//          this updates EndPoints when the system name changes
            if (thisDoc.systemName !== strTgs.clTrim(bd.systemName)){
                Systemdb.find({'systemPorts.sysPortEndPoint': thisDoc.systemName},'systemName systemPorts.sysPortName systemPorts.sysPortEndPoint',function(err,sys){
                    sys.map(function(sy){
                        sy.systemPorts.map(function(sysPort){
                            if (thisDoc.systemName === sysPort.systemPorts.sysPortEndPoint){
                                systemdbCrud.systemdbPortsCreate(sysPort,req);
                            }else{
                                logger.warn('EndPoint error'+ sysPort.systemPorts.sysPortEndPoint);
                            }});});
                  
            });}
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
	        };
	        return res.redirect(303, '/system/'+ res.abbreviation);
	    });
	});
}
}
};


/*---------------------------------------------------------------------
---------------------------- System Name Change ----------------------
-----------------------------------------------------------------------
*/

exports.dcSystemNameChange =  function(req,res){
    if (accConfig.accessCheck(req.user).delete !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{
//    logger.info('req.params.datacenter >>>>>> '+req.params.datacenter);
    Systemdb.findOne({systemName: req.params.datacenter},function(err,sys){
        if(err){
            logger.info(err.stack); 
            return res.redirect(303, '/');
        }else if(!sys){
            logger.info('dcSystemNameChange = no sys');
            return res.redirect(303, '/');
        }else{
 
              context = {
                access : accConfig.accessCheck(req.user),
                user : req.user, 
                requrl : req.url,
                    menu1: sys.systemName,
                    menuLink1: '#',
                    titleNow:sys.systemName,
                    systemId: sys._id,
                    oldSystemName: sys.systemName,
                    }; 
        res.render('asset/systemnamechange', context);
        }
});
}
};

function updateEndPoints(oldSystemName,systemName,callback){
    logger.info('updateEndPoints start '+oldSystemName+' '+systemName);
        Systemdb.findOne({systemName: sysList.systemName[i]},function(err,sys){
            if (err) {
                logger.warn('sysPortEndPoint change,'+sysList.index+','+sysList.systemName+err);
                return (err);
            }else if(!sys){
                logger.warn('sysPortCreate Failed lookup,'+sysList.index+','+sysList.systemName);
                return true;
            } else {
                var portArray = [];
                var sysSystemPortsLen = sys.systemPorts.length;
                for(var j = sysSystemPortsLen - 1; j >= 0; j--) {
                    logger.info('sys.systemPorts['+j+'] ='+sys.systemPorts[j].sysPortEndPoint);
                    logger.info('sys.systemPorts['+j+'] ='+sys.systemPorts[j].sysPortEndPoint);
                    if(sys.systemPorts[j].sysPortEndPoint === oldSystemName){
                        sys.systemPorts[j].sysPortEndPoint = systemName;}
                } 
                sys.modifiedBy= req.user.local.email;
                sys.modifiedOn= strTgs.compareDates(data.modifiedOn,req.session.ses.timezone); 
                sys.save(function(err){
                    if(err){
                        logger.warn('sysPortUpdate Failed,'+data.index+','+strTgs.csTrim(data.systemName)+','+err);
                        return (err);
                    }else{
                        logger.info('sysPortUpdate Sucessful Update write,'+data.index+','+data.systemName+','+data.sysPortName);
                        return true;
                    }
                });
            }   
        });
}



function countPortEndPoint(oldSystemName,systemName){
    logger.log('oldSystemName:'+oldSystemName+'  systemName:'+systemName);
    Systemdb.find({'systemPorts.sysPortEndPoint': oldSystemName},function(err,sysList){
        if (err) { logger.info (err.stack);
            return (err);
        }else if (!sysList) { logger.info('model not found');
            return;
        }else{
        logger.info('Found Ports 0'+sysList.length /*+ sysList*/);
        return sysList;
        }
    });     
}


exports.dcSystemNameChangePost =  function(req,res){
    if (accConfig.accessCheck(req.user).delete !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{
        var oldSystemName = strTgs.csTrim(req.body.oldSystemName);
        var systemName = strTgs.csTrim(req.body.systemName);
        var numAffected;
        if (oldSystemName){
            Systemdb.findOne({systemName: oldSystemName},function(err,sysNametoChange){
            if(err){
                logger.info(err.stack);
                callback(null);
            }else{
                sysNametoChange.systemName = systemName;
                sysNametoChange.save(function(err){
                if (err){
                    logger.log('validation error');
                    logger.error(err.stack);
            req.session.flash = {
                type: 'danger',
                intro: 'Ooops!',
                message: 'There was an error processing your request.',
            };
            return res.redirect(303, '/system/edit-'+ oldSystemName);
            }else{
            var sysCount = 1;
            async.whilst(
                function() {return sysCount > 0;},
                function(wcallback){
                    Systemdb.find({'systemPorts.sysPortEndPoint': oldSystemName},function(err,sys){
                        if (err) { 
                            logger.error(err.stack);
                            return wcallback(err);
                        } else if (!sys) {
                            sysCount = 0;
                            return wcallback(null);
                        } else {
                        //logger.info('Found Ports '+sys.length);
                        sysCount = sys.length;
                        }
                        Systemdb.update({'systemPorts.sysPortEndPoint': oldSystemName},{'systemPorts.$.sysPortEndPoint': systemName}, {multi: true},function(err, numAffected){
                        if (err){
                                logger.log('validation error');
                                logger.error(err.stack);
                        req.session.flash = {
                            type: 'danger',
                            intro: 'Ooops!',
                            message: 'There was an error updating EndPoints.',
                        };
                        return res.redirect(303, '/system/edit-'+ oldSystemName);
                            }
                            //logger.info(numAffected+ ' sysPortEndPoint Updated');
                            wcallback(null,numAffected);
                        });
                    });
                });
            logger.info(oldSystemName+' System Name Updated to '+systemName);
            req.session.flash = {
                type: 'success',
                intro: 'Thank you!',
                message: oldSystemName+' system name changed to '+systemName+' and related EndPoints updated.',
            };
            return res.redirect(303, '/system/edit-'+ systemName);
            }
        });
    }
    });
        }
    }
};


/*---------------------------------------------------------------------
---------------------------- System Delete ------------------------------
------------------------------------------------------------------------
*/
exports.dcsystemDelete = function(req,res){
    if (accConfig.accessCheck(req.user).delete !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{ 
    res.abbreviation = req.body.systemName;
    res.newpage = req.body.equipLocationRack;
if (req.body.systemName){
    //    logger.info('delete got this far');
        Systemdb.findOne({systemName: req.body.systemName},function(err,systemNametodelete){
        if(err){
        logger.warn(err);
        //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        }else{
            systemNametodelete.remove(function(err){
                if(err){
                logger.warn(err);
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
                return (res.newpage ==='')? res.redirect(303,'/') : res.redirect(303, '/equipment-systems/'+res.newpage);
                }
            });
        }
    });
}
}
};

/* ---------------------------------------------------------------------
-------------------    systemPorts Delete   --------------------------------
------------------------------------------------------------------------
*/

exports.dcsystemSubDelete = function(req,res){
    logger.info('portSubDelete');
        if (accConfig.accessCheck(req.user).delete !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{ 
    res.abbreviation = req.body.abbreviation;
if (req.body.id && req.body.subId){
    Systemdb.findById(req.body.id,req.body.subDoc,function (err, sys){
        if(err){
logger.warn('dcsystemSubDelete'+err);
        //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        }else{
            sys.systemPorts.id(req.body.subId).remove();
            sys.save(function(err){
                if(err){
logger.warn('dcsystemSubDelete2'+err);
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
}
};

// eof