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

//
// "reportEqSys" div id
//

function distinctSwitch(find){
    var query;
    switch(find){
        case env: 
            query = Systemdb.distinct('systemEnviron');
            break;
        case role:
            query = Systemdb.distinct('systemRole');
            break;
        case  make:
            query = Equipment.distinct('equipMake');
            break;
    }
    return query;
} 
// to get env, role and make (to start with)
// not working yet
// should use switch above for choice

exports.distinctList = function(req,res){
//    logger.info('req.query '+req.query.query);
    if (accConfig.accessCheck(req.user).read !== 1){
        return res.redirect(404);
    }else{
    var query = distinctSwitch(req.query.find);  // this will be url/find=env or find=role or find=make
        query.exec(function(err, result){
        if(err) return next(err);
        if(!result) return next();
    var context = JSON.stringify(result);
//        logger.info('allEquipSN');
    res.json(context);
    });
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

