
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

    
exports.home = function(req, res){
    if(!req.params.datacenter){
    res.render ('admin/home');
//
//          Options page
//
    }else if (req.params.datacenter  === 'options'){
     logger.info('called admin.options');     
        Optionsdb.find(function(err,opts){
        //logger.info(opts);
        if (!opts){
        	context = {
                optEquipStatus: ['____________________________', 'Seed Optionsdb to populate','____________________________'],
            };
         
            res.render('admin/options', context );
        }else{   
        if (err) return next (err);
        context ={
                menu1: 'Admin',
                menuLink1: '/admin',
                menu2: 'File Manager',
                menuLink2: '/admin/filemanager',
                titleNow:'Options',

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
//
//  OptionsEdit page
//   
    
//
//  Models page
//
    }else if(req.params.datacenter === 'upload'){
        res.render ('admin/upload');
//
//  Database admin
//
    }else if(req.params.datacenter === 'dbinsert'){
    
    
    
    
        res.render ('admin/dbinsert');
//    
//  User Admin
//
    }else if(req.params.datacenter === 'useradmin'){
    
    
    
    
        res.render ('admin/useradmin');
//    
//  File Manager
//
    }else if(req.params.datacenter === 'filemanager'){
    
    Optionsdb.find({}, 'optListKey optListArray',function(err,opt){
        if(err)return next(err);
    
    Fileinfo.find({}).sort({'modifiedOn': 'desc'}).exec(function(err, fil){
        if(err){
        logger.info(err);
        }else{
        //logger.info('file-list'+fil);
            var context = {
                    optModels: strTgs.findThisInThatOpt('optModels',opt),
                fil: fil.map(function(fi){
                       // rack.populate('rackParentDC', 'abbreviation cageNickname')
                    //logger.info('sy Map>'+fi);
                    return {
                            menu1: 'Admin',
                            menuLink1: '/admin',
                            menu2: 'Options',
                            menuLink2: '/admin/options',
                            titleNow:'File Manager',
                            fileId: fi._id,
                            fileName: fi.fileName,
                            filePath: fi.filePath,
                            fileHRName: fi.fileHRName,
                            fileType: fi.fileType,
                            fileDescription: fi.fileDescription,
                            createdBy: fi.createdBy,
                            createdOn: strTgs.dateTimeMod(fi.createdOn),
                            modifiedOn: strTgs.dateTimeMod(fi.modifiedOn),
                    };
                })
            };
            
            res.render('admin/filemanager', context);
        }});});
 
//    
//  Joins
//
    }else if(req.params.datacenter === 'joins'){
    
    
    
    
        res.render ('admin/joins');   
//
//  Models (not working)
// 
    }else if(req.params.datacenter === 'models'){

    res.render ('admin/models');

    }else{
    logger.info('datacenter >'+req.params.datacenter);
    res.render ('admin/'+req.params.datacenter);
    
}
};

exports.optionsEdit = function(req, res){
    var dcInfo = req.params.datacenter;
            logger.info('|dcInfo  >'+dcInfo);
        
        if (dcInfo ==='new'){
            context={
                stat: 'isNew',
            };
        
            res.render('admin/optionsedit', context);
            } else {
            Optionsdb.findOne({optListKey: dcInfo},function(err,opt){
            if(err)return next(err);
                context={
                    menu1: 'Admin',
                    menuLink1: '/admin',
                    titleNow:'Option Edit',
                    id: opt._id,
                    optListName: opt.optListName,
                    optListKey: opt.optListKey,
                    optListArray: opt.optListArray,
                };
            res.render('admin/optionsedit', context);
            });
    }
};

exports.optionsEditPost = function(req,res,err){
    logger.info('optionsEditPost >'+ req.body.id);
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
            logger.info(err);
            }else{
                    //logger.info(opt);
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
//
// Upload POST working
//        
exports.uploadPost = function(req,res){
    logger.info('date >'+Date.now());
    var form = new formidable.IncomingForm();
    form.uploadDir = './userdata/';
    form.keepExtensions = true;
    form.parse(req, function(err,fields,files){
    logger.info('files >'+files);
    var file = files.newCSVfile;
    var fileHRName = strTgs.clTrim(file.name);
    var base = './public/userdata/';
    var dir = './userdata/uploads/';
    var dateStr = Date.now();
    var fileName = dateStr+'-'+fileHRName;
    var newPath = dir + fileName;
    logger.info('dir+filename >'+dir + fileName);

     if(err) return res.redirect(303, '/error');
        if(err) {
            res.session.flash = {
                type: 'danger',
                intro: 'Oops!',
                message: 'There was an error processing your submission. ' +
                    'Pelase try again.',
            };
            return res.redirect(303, '/contest/vacation-photo');
        }


    
        Fileinfo.create({
                    fileName: file.name,
                    filePath: './'+file.path,
                    fileHRName: fileHRName,
                    fileDescription: strTgs.csvCleanup(fields.fileDescription),
                    fileType: fields.fileType,
                    createdOn: Date.now(),
                    createdBy:'Admin',
                    },function(err){
              if(err) return res.redirect(303, '/error');
        if(err) {
            res.session.flash = {
                type: 'danger',
                intro: 'Oops!',
                message: 'There was an error processing '+fileHRName+'. ' +
                    'Pelase try again.',
            };
            return res.redirect(303, '/admin');
        }else{
    
        req.session.flash = {
            type: 'success',
            intro: 'Awesome!',
            message: 'File '+fileHRName+' uploaded.',
        };
        return res.redirect(303, '/admin/filemanager');
        }});
    });
//});
};
//
// Upload Delete File POST
//
exports.uploadDeletePost = function(req,res){
if (req.body.id){
        var bdy = req.body;
        logger.info('delete got this far');
        Fileinfo.findOne({_id: bdy.id},function(err,fileToDelete){
        if(err){
        logger.info(err);
        //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        }else{
            fileToDelete.remove(function(err){
                if(err){
                logger.info(err);
                req.session.flash = {
                        type: 'danger',
                        intro: 'Ooops!',
                        message: 'Something went wrong, '+bdy.fileHRName+' was not deleted.',
                    };
                    return res.redirect(303, '/admin/filemanager');
                } else {
                logger.info('path/file ./'+bdy.filePath);
                fs.unlink(bdy.filePath, function(err){
                    if(err){
                logger.info(err);
                req.session.flash = {
                        type: 'danger',
                        intro: 'Ooops!',
                        message: 'Something went wrong, '+bdy.fileHRName+' was not deleted.',
                    };
                    return res.redirect(303, '/admin/filemanager');
                    } else {
                
                    req.session.flash = {
                    type: 'success',
                    intro: 'Done!',
                    message: 'File '+ bdy.fileHRName+' has been deleted. Good luck with that one',
                };
                return res.redirect(303, '/admin/filemanager');
                }});
                }
            });
        }
    });
}
};
//
//  CSV to DB
// 
exports.csvToDBPost = function(req,res){
    //logger.info('csvToDBPost >'+req.body.file);
    switch(req.body.fileDescription) {
    case 'Equipment':
        var equipmentStream = fs.createReadStream(req.body.file);
        csv
            .fromStream(equipmentStream, {headers : true})
            .on('data', function(data){
            if(!data.equipSN){
            logger.info('No Equipment SN');
        }else{
            equipmentCrud.equipmentCreate(data,req);
         }})
            .on('end', function(){
             logger.info('done');
        });
        break;
    case 'Equipment.equipPorts':
        var equipPortsStream = fs.createReadStream(req.body.file);
        csv
            .fromStream(equipPortsStream, {headers : true})
            .on('data', function(data){
            if(!data.equipSN){
            logger.info('Equipment Port error');
        }else{
            equipmentCrud.equipmentPortCreate(data,req);
         }})
            .on('end', function(){
             logger.info('done');
        });
    
        break;
    case 'Systemdb':
        var systemdbStream = fs.createReadStream(req.body.file);
        csv
            .fromStream(systemdbStream, {headers : true})
            .on('data', function(data){
            if(!data.systemName){
            logger.info('No System Name');
        }else{
            systemdbCrud.systemdbCreate(data,req);
         }})
            .on('end', function(){
             logger.info('done');
        });
    
        break;
    case 'Systemdb.systemPorts':
        var systemPortsStream = fs.createReadStream(req.body.file);
        csv
            .fromStream(systemPortsStream, {headers : true})
            .on('data', function(data){
            if(!strTgs.clTrim(data.systemName)){
            logger.info('systemPortsStream Error on index '+data.index+' systemName not found');
        }else{
            systemdbCrud.systemdbPortsCreate(data,req);
         }})
            .on('end', function(){
             logger.info('done');
        });
    
        break;        

        default:
            req.session.flash = {
                type: 'danger',
                intro: 'Ooops!',
                message: 'Error, no upload for this Database.',
            };
}
    

 return res.redirect(303, '/admin/filemanager');
};


// These drop the whole DB, not just one
exports.dropDatacenterGet = function(req,res){
    dcit.dropDatacenter(Datacenter);
	logger.info('dropDatacenterGet');
    return res.redirect(303, '/location/datacenter/list');    
};

exports.dropRackGet = function(req,res){
    dcit.dropRack(Rack);
    logger.info('dropRackGet');
	return res.redirect(303, '/location/datacenter/list'); 
};

exports.dropOptionsdbGet = function(req,res){
    dcit.dropOptionsdb(Optionsdb);
    logger.info('dropOptionsdbGet');
	return res.redirect(303, '/admin/options'); 
};

exports.dropEquipmentGet = function(req,res){
    dcit.dropEquipment(Equipment);
    logger.info('dropEquipmentGet');
	return res.redirect(303, '/admin/options'); 
};

exports.dropSystemGet = function(req,res){
    dcit.dropSystem(Systemdb);
    logger.info('dropSystemGet');
	return res.redirect(303, '/admin/options'); 
};


exports.seedDatacetnerGet = function(req,res){
    seedDataLoad.seedDatacenter(Datacenter);
    logger.info('seedDatacetnerGet');
	return res.redirect(303, '/location/datacenter/list');   
};

exports.seedOptionsdbGet = function(req,res){
    seedDataLoad.seedOptionsDataBase(Optionsdb);
    logger.info('seedOptionsdbGet');
	return res.redirect(303, '/admin/options');   
};

exports.seedEquipmentGet = function(req,res){
    seedDataLoad.seedEquipmentDataBase(Equipment);
    logger.info('seedEquipmentGet');
    return res.redirect(303, '/admin/options');
};
exports.seedSystemGet = function(req,res){
    seedDataLoad.seedSystemDataBase(Systemdb);
    logger.info('seedSystemGet');
    return res.redirect(303, '/admin/options');   	
};