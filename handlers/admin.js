
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
          User = require('../models/user.js'),
      Fileinfo = require('../models/fileinfo.js');

    
exports.home = function(req, res){
    logger.info('exports.home >'+req.params.datacenter);
    if (!req.user || req.user.access < 5){
        req.session.flash = {
                type: 'danger',
                intro: 'Ooops!',
                message: 'Not Authorized!',
                };
            return res.redirect(303, '/');
    }else{         
    if(!req.params.datacenter){
        context = {
            lastPage : '/admin',
            access : strTgs.accessCheck(req.user),
            user : req.user
            };
    res.render ('admin/home', context );
//
//          Options page
//
    }else if (req.params.datacenter  === 'options'){
     logger.info('called admin.options');     
        Optionsdb.find(function(err,opts){
        //logger.info(opts);
        if (!opts){
        	context = {
                lastPage : '/admin/options',
                access : strTgs.accessCheck(req.user),
                user : req.user,
                optEquipStatus: ['____________________________', 'Seed Optionsdb to populate','____________________________'],
            };
         
            res.render('admin/options', context );
        }else{
        if (err) return next (err);
        context ={
                lastPage : '/admin/options',
                access : strTgs.accessCheck(req.user),
                user : req.user,
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
        context = {
            lastPage : '/admin/upload',
            access : strTgs.accessCheck(req.user),
            user : req.user,
            };
        res.render ('admin/upload', context );
//
//  Database admin
//
    }else if(req.params.datacenter === 'dbinsert'){
        context = {
            lastPage : '/admin/dbinsert',
            access : strTgs.accessCheck(req.user),
            user : req.user,
            };
        res.render ('admin/dbinsert', context );
//    
//  User Admin
//
    }else if(req.params.datacenter === 'useradmin'){
        
        User.find({}).sort({'access':'desc'}).exec(function (err, usr) {
            if(err){
                logger.info(err);
            }else{
            context = {
                lastPage : '/admin/useradmin',
                access : strTgs.accessCheck(req.user),
                user : req.user,
                usr: usr.map(function(ur){
                    return {
                        id : ur._id,
                        usrAccess : ur.access,
                        email : ur.local.email,
                        name : ur.local.name,
                        phone : ur.local.phone,
                        createdOn : ur.local.createdOn,
                        lastAccessed : ur.local.lastAccessed,                       
                    };
                })
            };
         res.render ('admin/useradmin', context );  
    }});


    

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
                    lastPage : '/admin/filemanager',
                    access : strTgs.accessCheck(req.user),
                    user : req.user,
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
            context = {
                lastPage : '/admin/joins',
                access : strTgs.accessCheck(req.user),
                user : req.user,
            };
    
    
    
        res.render ('admin/joins', context);   
//
//  Models (not working)
// 
    }else if(req.params.datacenter === 'models'){
            context = {
                lastPage : '/admin/models',
                access : strTgs.accessCheck(req.user),
                user : req.user,
            };
    res.render ('admin/models', context);

    }else{
    logger.info('datacenter >'+req.params.datacenter);
            context = {
                lastPage : '/admin/'+req.params.datacenter,
                access : strTgs.accessCheck(req.user),
                user : req.user,
            };
    res.render ('admin/'+req.params.datacenter, context);
    }
    }
};

exports.userEdit = function (req, res) {
    if (!req.user || req.user.access < 5){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{ 
    User.findOne({'_id':req.body.id}, function(err,ur){
        if(err){
            logger(err);
        }else{
        logger.info('ur '+ur);
        context = {
                lastPage : '/admin/useradmin',
                access : strTgs.accessCheck(req.user),
                user : req.user,
                id : ur._id,
                usrAccess : ur.access,
                locEmail : ur.local.email,
                locName : ur.local.name,
                locPhone : ur.local.phone,
                LocCreatedOn : ur.local.createdOn,
                locLastAccessed : ur.local.lastAccessed,                       
            };
    res.render ('admin/userprofile', context);   
    }});
}
};

var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

exports.userEditPost = function (req, res) {
    if (!req.user || req.user.access < 5){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{ 
        logger.info('userEditPost >'+ req.body.id);
        var data = req.body;
    User.findOne({'_id':req.body.id}, function(err,ur){
        if (err){
            logger.info(err);
            res.redirect ('admin/useradmin');
        }else if(!data.locEmail.match(VALID_EMAIL_REGEX)) {
        req.session.flash = {
            type: 'danger',
            intro: 'Validation error!',
            message: 'The email address you entered was  not valid.',
        };
        return res.redirect(303, '/admin/useradmin');
        } else {
            ur.local.email = strTgs.uCleanUp(ur.local.email,data.locEmail);
            ur.local.name = strTgs.uCleanUp(ur.local.name,data.locName);
            ur.local.phone = strTgs.uCleanUp(ur.local.phone,data.locPhone);
            ur.access = strTgs.uCleanUp(ur.access,data.usrAccess);
        }
        ur.save(function (err) {
            if(err) {
                logger.error(err.stack);
                req.session.flash = {
                    type: 'danger',
                    intro: 'Ooops!',
                    message: 'There was an error processing your request.',
                };
        return res.redirect(303, '/admin/useradmin');
            }
            req.session.flash = {
                type: 'success',
                intro: 'Thank you!',
                message: 'Your update has been made.',
            };
        return res.redirect(303, '/admin/useradmin');
        });
    });
    }   
};

exports.optionsEdit = function(req, res){
    if (!req.user || req.user.access < 5){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{ 
    var dcInfo = req.params.datacenter;
            logger.info('|dcInfo  >'+dcInfo);
        
        if (dcInfo ==='new'){
            context={
                lastPage : '/admin/optionsedit',
                access : strTgs.accessCheck(req.user),
                user : req.user,
                stat: 'isNew',
            };
        
            res.render('admin/optionsedit', context);
            } else {
            Optionsdb.findOne({optListKey: dcInfo},function(err,opt){
            if(err)return next(err);
                context={
                    lastPage : '/admin/optionsedit',
                    access : strTgs.accessCheck(req.user),
                    user : req.user,
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
    }}
};

exports.optionsEditPost = function(req,res,err){
    logger.info('optionsEditPost >'+ req.body.id);
        if (!req.user || req.user.access < 5){
        req.session.flash = {
                type: 'danger',
                intro: 'Ooops!',
                message: 'Not Authorized!',
                };
            return res.redirect(303, '/');
    }else{

    var thisDoc;
     if (!req.body.id){
        Optionsdb.create({
                    optListName: strTgs.csvCleanup(req.body.optListName),
                    optListKey: strTgs.csvCleanup(req.body.optListKey),
                    optListArray: strTgs.csvCleanup(req.body.optListArray),
                    createdOn: Date.now(),
                    createdBy:req.user,
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
}}
};
//
// Upload POST working
//        
exports.uploadPost = function(req,res){
    logger.info('date >'+Date.now());
    var userEmail = req.user.local.email;
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
            //return res.redirect(303, '/contest/vacation-photo');
        }


    
        Fileinfo.create({
                    fileName: file.name,
                    filePath: './'+file.path,
                    fileHRName: fileHRName,
                    fileDescription: strTgs.csvCleanup(fields.fileDescription),
                    fileType: fields.fileType,
                    createdOn: Date.now(),
                    createdBy: userEmail,
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
        if (!req.user || req.user.access < 5){
        req.session.flash = {
                type: 'danger',
                intro: 'Ooops!',
                message: 'Not Authorized!',
                };
            return res.redirect(303, '/');
    }else{ 
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
}}
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

/*---------------------------------------------------------------------
---------------------------- User Delete ------------------------------
------------------------------------------------------------------------
*/
exports.userDelete = function(req,res){
    if (!req.user || req.user.access < 5){
    req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'Not Authorized!',
            };
        return res.redirect(303, '/');
    }else{ 
    res.abbreviation = req.body.email;
   

if (req.body.id){
        logger.info('delete got this far id >'+ req.body.id);
        User.findById(req.body.id,function(err,userToDelete){
        if(err){
        logger.info(err);
        //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        }else{
            userToDelete.remove(function(err){
                if(err){
                logger.info(err);
                req.session.flash = {
                        type: 'danger',
                        intro: 'Ooops!',
                        message: 'Something went wrong, '+ res.abbreviation +' was not deleted.',
                    };
                    return res.redirect(303, '/admin/useradmin');
                } else {
                    req.session.flash = {
                    type: 'success',
                    intro: 'Done!',
                    message: 'User '+ res.abbreviation +' has been deleted.',
                };
                return res.redirect(303, '/admin/useradmin');
                }
            });
        }
    });
}}
};



// These drop the whole DB, not just one
exports.dropDatacenterGet = function(req,res){
    if(!req.user || req.user.access < 5){
        req.session.flash = {
        type: 'danger',
        intro: 'Not Authorized!',
        message: 'You are not authorized for this action.',
    };
        return res.redirect(303, '/home');
    }else{    
    dcit.dropDatacenter(Datacenter);
	logger.info('dropDatacenterGet');
    return res.redirect(303, '/location/datacenter/list');
}
};

exports.dropRackGet = function(req,res){
    if(!req.user || req.user.access < 5){
        req.session.flash = {
        type: 'danger',
        intro: 'Not Authorized!',
        message: 'You are not authorized for this action.',
    };
        return res.redirect(303, '/home');
    }else{      
    dcit.dropRack(Rack);
    logger.info('dropRackGet');
	return res.redirect(303, '/location/datacenter/list');
    } 
};

exports.dropOptionsdbGet = function(req,res){
    if(!req.user || req.user.access < 5){
        req.session.flash = {
        type: 'danger',
        intro: 'Not Authorized!',
        message: 'You are not authorized for this action.',
    };
        return res.redirect(303, '/home');
    }else{  
    dcit.dropOptionsdb(Optionsdb);
    logger.info('dropOptionsdbGet');
	return res.redirect(303, '/admin/options');
    }
};

exports.dropEquipmentGet = function(req,res){
    if(!req.user || req.user.access < 5){
        req.session.flash = {
        type: 'danger',
        intro: 'Not Authorized!',
        message: 'You are not authorized for this action.',
    };
        return res.redirect(303, '/home');
    }else{      
    dcit.dropEquipment(Equipment);
    logger.info('dropEquipmentGet');
	return res.redirect(303, '/admin/options');
    }
};

exports.dropSystemGet = function(req,res){
    if(!req.user || req.user.access < 5){
        req.session.flash = {
        type: 'danger',
        intro: 'Not Authorized!',
        message: 'You are not authorized for this action.',
    };
        return res.redirect(303, '/home');
    }else{  
    dcit.dropSystem(Systemdb);
    logger.info('dropSystemGet');
	return res.redirect(303, '/admin/options');
    }
};


exports.seedDatacetnerGet = function(req,res){
    if(!req.user || req.user.access < 5){
        req.session.flash = {
        type: 'danger',
        intro: 'Not Authorized!',
        message: 'You are not authorized for this action.',
    };
        return res.redirect(303, '/home');
    }else{  
    seedDataLoad.seedDatacenter(Datacenter);
    logger.info('seedDatacetnerGet');
	return res.redirect(303, '/location/datacenter/list');
    } 
};

exports.seedOptionsdbGet = function(req,res){
    if(!req.user || req.user.access < 5){
        req.session.flash = {
        type: 'danger',
        intro: 'Not Authorized!',
        message: 'You are not authorized for this action.',
    };
        return res.redirect(303, '/home');
    }else{  
    seedDataLoad.seedOptionsDataBase(Optionsdb);
    logger.info('seedOptionsdbGet');
	return res.redirect(303, '/admin/options');
    }
};

exports.seedEquipmentGet = function(req,res){
    if(!req.user || req.user.access < 5){
        req.session.flash = {
        type: 'danger',
        intro: 'Not Authorized!',
        message: 'You are not authorized for this action.',
    };
        return res.redirect(303, '/home');
    }else{      
    seedDataLoad.seedEquipmentDataBase(Equipment);
    logger.info('seedEquipmentGet');
    return res.redirect(303, '/admin/options');
    }
};
exports.seedSystemGet = function(req,res){
    if(!req.user || req.user.access < 5){
        req.session.flash = {
        type: 'danger',
        intro: 'Not Authorized!',
        message: 'You are not authorized for this action.',
    };
        return res.redirect(303, '/home');
    }else{  
    seedDataLoad.seedSystemDataBase(Systemdb);
    logger.info('seedSystemGet');
    return res.redirect(303, '/admin/options');
    }	
};