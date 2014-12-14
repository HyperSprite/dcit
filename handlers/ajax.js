
var     winston = require('winston'),
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


// These drop the whole DB, not just one
exports.dropDatacenterGet = function(req,res){
    dcit.dropDatacenter(Datacenter);
	console.log("dropDatacenterGet");
    return res.redirect(303, '/location/datacenter/list');    
};

exports.dropRackGet = function(req,res){
    dcit.dropRack(Rack);
    console.log('dropRackGet');
	return res.redirect(303, '/location/datacenter/list'); 
};

exports.dropOptionsdbGet = function(req,res){
    dcit.dropOptionsdb(Optionsdb);
    console.log('dropOptionsdbGet');
	return res.redirect(303, '/admin/options'); 
};

exports.dropEquipmentGet = function(req,res){
    dcit.dropEquipment(Equipment);
    console.log('dropEquipmentGet');
	return res.redirect(303, '/admin/options'); 
};

exports.dropSystemGet = function(req,res){
    dcit.dropSystem(Systemdb);
    console.log('dropSystemGet');
	return res.redirect(303, '/admin/options'); 
};


exports.seedDatacetnerGet = function(req,res){
    seedDataLoad.seedDatacenter(Datacenter);
    console.log('seedDatacetnerGet');
	return res.redirect(303, '/location/datacenter/list');   
};

exports.seedOptionsdbGet = function(req,res){
    seedDataLoad.seedOptionsDataBase(Optionsdb);
    console.log('seedOptionsdbGet');
	return res.redirect(303, '/admin/options');   
};

exports.seedEquipmentGet = function(req,res){
    seedDataLoad.seedEquipmentDataBase(Equipment);
    console.log('seedEquipmentGet');
    return res.redirect(303, '/admin/options');
};
exports.seedSystemGet = function(req,res){
    seedDataLoad.seedSystemDataBase(Systemdb);
    console.log('seedSystemGet');
    return res.redirect(303, '/admin/options');   	
};