
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
    if (!req.user || req.user.access < 2){
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

exports.allEquipSN = function(req,res){
//    logger.info('req.query '+req.query.query);
    if (!req.user || req.user.access < 2){
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

exports.allLocationRack = function(req,res){
//    logger.info('req.query '+req.query.query);
    if (!req.user || req.user.access < 2){
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

/*

exports.allSystemNames = function(req,res){



    Systemdb.find({},{'systemName':1,'_id':0},{sort:{systemName:1}},function(err,sysName){
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
        
        logger.info('allSystemNames');
       res.json(context);
    });
};



exports.allSystemNames = function(req,res){
    Systemdb.find({},{'systemName':1,'_id':0},{sort:{systemName:1}},function(err,sysName){
        if(err) return next(err);
        if(!sysName) return next();
        var context = {
            "query": "Unit",
            "suggestions": sysName,
        }
       res.json(context);
    });
};*/
/*
exports.allSystemNames = function(req,res){
    Systemdb.find({},{'systemName':1,'_id':0},{sort:{systemName:1}},function(err,sysName){
        if(err) return next(err);
        if(!sysName) return next();
        var aSN=[];
        for(i=0;i<sysName.length;i++){
        aSN[i] = sysName[i].systemName;
        }
        var context = {
            "query": "Unit",
            "suggestions": '['+aSN+']',
        }
       res.json(context);
    });
};
*/
    
exports.options = function(req, res){
    console.log('called admin.options');     
        Optionsdb.find(function(err,opts){
        console.log(opts);
        if (!opts){
        	context = {
                optEquipStatus: ['____________________________', 'Seed Optionsdb to populate','____________________________'],
            };
         
            res.render('admin/options', context );
        }else{   
        if (err) return next (err);
        context ={
            optList: opts.map(function(opt){
            return{
                optListName: opt.optListName,
                optListKey: opt.optListKey,
                optListArray: opt.optListArray,
                };
                }),
        };

	res.render('admin/options', context );
    }});
};

exports.optionsEdit = function(req, res, next){
    console.log("starting optionsedit");
    if (req.params.datacenter.indexOf("edit")!=-1){
        start = req.params.datacenter.indexOf ("-")+1;
        dcInfo = req.params.datacenter.substring (start);
            console.log("|dcInfo  >"+dcInfo);
        
        if (dcInfo ==="new"){
            context={
                stat: "isNew",
            };
        
            res.render('admin/optionsedit', context);
            } else {
            Optionsdb.findOne({optListKey: dcInfo},function(err,opt){
            if(err)return next(err);
                context={
                    id: opt._id,
                    optListName: opt.optListName,
                    optListKey: opt.optListKey,
                    optListArray: opt.optListArray,
                };
            res.render('admin/optionsedit', context);
            });

    }
}

};

exports.optionsEditPost = function(req,res,err){
    console.log("optionsEditPost >"+ req.body.id);
    var thisDoc;
     if (!req.body.id){
        Optionsdb.create({
                    optListName: strTgs.csvCleanup(req.body.optListName),
                    optListKey: strTgs.csvCleanup(req.body.optListKey),
                    optListArray: strTgs.csvCleanup(req.body.optListArray),
                    createdOn: Date.now(),
                    createdBy:'Admin',
                    },function(err){
                     	    
	        if(err) {
	        	console.error(err.stack);
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };
	            return res.redirect(303, '/admin/options');
	        }
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
	        };
	        return res.redirect(303, '/admin/options');
	    });            
                    
    } else {
        Optionsdb.findById(req.body.id,function(err,opt){
        if (err) {
            console.log(err);
            }else{
                    console.log(opt);
                    opt.optListArray = strTgs.csvCleanup(req.body.optListArray);
                    }
        
	    opt.save(function(err){
	        if(err) {
	        	console.error(err.stack);
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };
	            return res.redirect(303, '/admin/options');
	        }
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
	        };
	        return res.redirect(303, '/admin/options');
	    });
    });    
}
};


