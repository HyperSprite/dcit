
var     logger = require('../lib/logger.js'),
        strTgs = require('../lib/stringThings.js'),
          dcit = require('../dcit.js'),
            fs = require('fs'),
          path = require('path'),
    formidable = require('formidable'),
           csv = require('fast-csv'), 
  seedDataLoad = require('../seedDataLoad.js'),
 equipmentCrud = require('../crud/equipment.js'),
  systemdbCrud = require('../crud/system.js'),
     accConfig = require('../config/access'),
      ObjectId = require('mongoose').Types.ObjectId;

// Models
var Datacenter = require('../models/datacenter.js'),
          Rack = require('../models/rack.js'),
     Optionsdb = require('../models/options.js'),
     Equipment = require('../models/equipment.js'),
      Systemdb = require('../models/system.js'),
      Fileinfo = require('../models/fileinfo.js');

exports.get = function(req, res, next){
    console.log("ajax.get +++++++++++++");
};
exports.allSystemNames = function(req,res){
//    logger.info('req.query '+req.query.query);
    if (accConfig.accessCheck(req.user).read !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{
    var query = Systemdb.find({ 'systemName': { '$regex': req.query.query, '$options': 'i' } },{'systemName':1,'_id':0});
        query.sort({'systemName': 'asc'}).exec(function(err, sysName){
        if(err) return next(err);
        if(!sysName) return next();
        var aSN=[];
        for(i=0;i<sysName.length;i++){
        aSN[i] = sysName[i].systemName;
        }
        var context = {
            "query": "Unit",
            "suggestions": aSN,
        };
        
//        logger.info('allSystemNames');
       res.json(context);
    });
    }
};

exports.allSystemRole = function(req,res){
        if (accConfig.accessCheck(req.user).read !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{
    var query = Systemdb.find({ 'systemRole': { '$regex': req.query.query, '$options': 'i' } },{'systemRole':1,'_id':0});
        query.sort({'systemRole': 'asc'}).exec(function(err, result){
        if(err) return next(err);
        if(!result) return next();
        var a=[];
        for(i=0;i<result.length;i++){
        a[i] = result[i].systemRole;
        }
        var context = {
            "query": "Unit",
            "suggestions" : strTgs.arrayUnique(a),
        };
        res.json(context);
    });
    }
};

exports.allSystemEnviron = function(req,res){
        if (accConfig.accessCheck(req.user).read !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{
    var query = Systemdb.find({ 'systemEnviron': { '$regex': req.query.query, '$options': 'i' } },{'systemEnviron':1,'_id':0});
        query.sort({'systemEnviron': 'asc'}).exec(function(err, result){
        if(err) return next(err);
        if(!result) return next();
        var a=[];
        for(i=0;i<result.length;i++){
        a[i] = result[i].systemEnviron;
        }
        var context = {
            "query": "Unit",
            "suggestions" : strTgs.arrayUnique(a),
        };
        res.json(context);
    });
    }
};

exports.allEquipSN = function(req,res){
//    logger.info('req.query '+req.query.query);
    if (accConfig.accessCheck(req.user).read !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{
    var query = Equipment.find({ 'equipSN': { '$regex': req.query.query, '$options': 'i' } },{'equipSN':1,'_id':0});
        query.sort({'equipSN': 'asc'}).exec(function(err, result){
        if(err) return next(err);
        if(!result) return next();
        var aSN=[];
        for(i=0;i<result.length;i++){
        aSN[i] = result[i].equipSN;
        }
        var context = {
            "query": "Unit",
            "suggestions": aSN,
        };
//        logger.info('allEquipSN');
       res.json(context);
    });
    }
};



exports.allEquipMake = function(req,res){
        if (accConfig.accessCheck(req.user).read !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{
    var query = Equipment.find({ 'equipMake': { '$regex': req.query.query, '$options': 'i' } },{'equipMake':1,'_id':0});
        query.sort({'equipMake': 'asc'}).exec(function(err, result){
        if(err) return next(err);
        if(!result) return next();
        var aMake=[];
        for(i=0;i<result.length;i++){
        aMake[i] = result[i].equipMake;
        }
        var context = {
            "query": "Unit",
            "suggestions" : strTgs.arrayUnique(aMake),
        };
        res.json(context);
    });
    }
};

exports.allEquipModel = function(req,res){
        if (accConfig.accessCheck(req.user).read !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{
    var query = Equipment.find({ 'equipModel': { '$regex': req.query.query, '$options': 'i' } },{'equipModel':1,'_id':0});
        query.sort({'equipModel': 'asc'}).exec(function(err, result){
        if(err) return next(err);
        if(!result) return next();
        var aEquipModel=[];
        for(i=0;i<result.length;i++){
        aEquipModel[i] = result[i].equipModel;
        }
        var context = {
            "query": "Unit",
            "suggestions" : strTgs.arrayUnique(aEquipModel),
        };
        res.json(context);
    });
    }
};

exports.allLocationRack = function(req,res){
//    logger.info('req.query '+req.query.query);
    if (accConfig.accessCheck(req.user).read !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{
    var query = Rack.find({ 'rackUnique': { '$regex': req.query.query, '$options': 'i' } },{'rackUnique':1,'_id':0});
        query.sort({'rackName': 'asc'}).exec(function(err, result){
        if(err) return next(err);
        if(!result) return next();
        var aSN=[];
        for(i=0;i<result.length;i++){
        aSN[i] = result[i].rackUnique;
        }
        var context = {
            "query": "Unit",
            "suggestions": aSN,
        };
        
//        logger.info('allEquipSN');
       res.json(context);
    });
    }
};

///////////////////////////////////////////////////////
//
//   singlePortDelete
//
///////////////////////////////////////////////////////

exports.singlePortDelete = function(req,res){
    logger.info('singlePortDelete');
    logger.info('>>'+req.body.id +' '+req.body.subId);
        if (accConfig.accessCheck(req.user).delete !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{
        if (req.body.id && req.body.subId){
            if(req.body.collectionName === 'Systemdb'){
                Systemdb.findById(req.body.id,req.body.subDoc,function (err, sys){
                    if(err){
                    logger.warn('singlePortDelete'+err);
                    //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
                    }else{
                        sys.systemPorts.id(req.body.subId).remove();
                        sys.save(function(err){
                            if(err){
                            logger.warn('singlePortDelete'+err);
                            req.session.flash = {
                                    type: 'danger',
                                    intro: 'Ooops!',
                                    message: 'Something went wrong',
                                };
                                return res.redirect(303, '/system/edit-'+ res.abbreviation);
                            } else {
                            res.send({success : true});
                            }
                        });
                    }
                });
            } else if(req.body.collectionName === 'equipment'){
                Equipment.findById(req.body.id,req.body.subDoc,function (err, eq){
                    if(err){
                    logger.warn('singlePortDelete'+err);
                    //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
                    }else{
                        eq.equipPorts.id(req.body.subId).remove();
                        eq.save(function(err){
                            if(err){
                            logger.warn('singlePortDelete'+err);
                            req.session.flash = {
                                    type: 'danger',
                                    intro: 'Ooops!',
                                    message: 'Something went wrong',
                                };
                                return res.redirect(303, '/equipment/edit-'+ res.abbreviation);
                            } else {
                            res.send({success : true});
                            }
                        });
                    }
                });
            }
            } else {
                logger.warn('singlePortDelete could not find matching IDs');
                req.session.flash = {
                        type: 'danger',
                        intro: 'Ooops!',
                        message: 'Systems and Ports dont match',
                    };
                    return res.redirect(303, '/equipment/edit-'+ res.abbreviation);
            } 
        }
}
};

///////////////////////////////////////////////////////
//
//   
//
///////////////////////////////////////////////////////

exports.singlePortDeleteWorking = function(req,res){
    logger.info('singlePortDelete');
    logger.info('>>'+req.body.id +' '+req.body.subId);
        if (accConfig.accessCheck(req.user).delete !== 1){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{
        if(req.body.collectionName === 'Systemdb'){
            if (req.body.id && req.body.subId){
                Systemdb.findById(req.body.id,req.body.subDoc,function (err, sys){
                    if(err){
            logger.warn('singlePortDelete'+err);
                    //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
                    }else{
                        sys.systemPorts.id(req.body.subId).remove();
                        sys.save(function(err){
                            if(err){
            logger.warn('singlePortDelete'+err);
                            req.session.flash = {
                                    type: 'danger',
                                    intro: 'Ooops!',
                                    message: 'Something went wrong',
                                };
                                return res.redirect(303, '/system/edit-'+ res.abbreviation);
                            } else {
                            res.send({success : true});
                            }
                        });
                    }
                });
            } else {
                logger.warn('singlePortDelete could not find body.id && body.subId');
                req.session.flash = {
                                    type: 'danger',
                                    intro: 'Ooops!',
                                    message: 'Systems and Ports dont match',
                                };
                                return res.redirect(303, '/system/edit-'+ res.abbreviation);
            }
        } else if(req.body.collectionName === 'equipment'){
            if (req.body.id && req.body.subId){
                Equipment.findById(req.body.id,req.body.subDoc,function (err, eq){
                    if(err){
            logger.warn('singlePortDelete'+err);
                    //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
                    }else{
                        eq.equipPorts.id(req.body.subId).remove();
                        eq.save(function(err){
                            if(err){
            logger.warn('singlePortDelete'+err);
                            req.session.flash = {
                                    type: 'danger',
                                    intro: 'Ooops!',
                                    message: 'Something went wrong',
                                };
                                return res.redirect(303, '/equipment/edit-'+ res.abbreviation);
                            } else {
                            res.send({success : true});
                            }
                        });
                    }
                });
            } else {
                logger.warn('singlePortDelete could not find body.id && body.subId');
                req.session.flash = {
                                    type: 'danger',
                                    intro: 'Ooops!',
                                    message: 'Systems and Ports dont match',
                                };
                                return res.redirect(303, '/equipment/edit-'+ res.abbreviation);
            } 
        }
}
};