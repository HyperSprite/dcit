var Datacenter = require('../models/datacenter.js'),
    Rack = require('../models/rack.js'),
    Optionsdb = require('../models/options.js'),
    Equipment = require('../models/equipment.js'),
    Systemdb = require('../models/system.js'),
    strTgs = require('../lib/stringThings.js'),
    locationPlus1 = require('../lib/locationPlus1.js'),
    seedDataLoad = require('../seedDataLoad.js'),
    dcit = require('../dcit.js'),
    fs = require('fs'),
    path = require('path'),
    formidable = require('formidable');
    
exports.home = function(req, res){
    if(!req.params.datacenter){
    res.render ('admin/home');
//
//          Options page
//
    }else if (req.params.datacenter  === "options"){
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
//
//              OptionsEdit page
//   
    
//
//      Models page
//
    }else if(req.params.datacenter === "upload"){
        res.render ('admin/upload');
    
    }else if(req.params.datacenter === "models"){
 /*   var dirPath = './models/';
    console.log("dirList typefo"+dirList);

    var dirList = fs.readdir(dirPath, function(err, files){
    var filesOut = [];
    var filesTemp = [];
    if (err) return;
    for(i=0;i<files;i++){
    fs.readFile(dirPath+files[i], function(err, data){
    if(err) throw err;
    filesTemp =  data;
    
    return filesTemp;
    });}
    console.log("fileList > "+f);  
    return f;
    });


    console.log("dirList typefo"+dirList + typeof dirList);
    res.render ('admin/models');
*/
    }else{
    console.log("datacenter >"+req.params.datacenter);
    res.render ('admin/'+req.params.datacenter);
    
}
};

exports.optionsEdit = function(req, res){
        dcInfo = req.params.datacenter;
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

exports.uploadPost = function(req,res){
    fs.unlinkSync('/*.csv');
    var form = new formidable.IncomingForm();
    form.uploadDir = './userdata';
    form.keepExtensions = true;
    form.parse(req, function(err,fields,files){
    var file = files.newCSVfile;
    var dir = './userdata/uploads/';
    var newPath = dir + file.name;
    console.log("conlog> "+file.name);
    console.log("conlog> "+dir);
    console.log("conlog> "+newPath);
    console.log("conlog> "+file.upload);
    fs.writeFile(file.name, file, function (err) {
     if(err) return res.redirect(303, '/error');
        if(err) {
            res.session.flash = {
                type: 'danger',
                intro: 'Oops!',
                message: 'There was an error processing '+file.name+'. ' +
                    'Pelase try again.',
            };
            return res.redirect(303, '/admin');
        }else{
        fs.renameSync(file.path, newPath);
        
        req.session.flash = {
            type: 'success',
            intro: 'Awesome!',
            message: 'File '+file.name+' uploaded.',
        };
        return res.redirect(303, '/admin');
    
    
    
    }});

});
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