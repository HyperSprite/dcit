var Datacenter = require('../models/datacenter.js'),
    Rack = require('../models/rack.js'),
    Optionsdb = require('../models/options.js'),
    strTgs = require('../lib/stringThings.js'),
    ObjectId = require('mongoose').Types.ObjectId;

var start  = "",
    editLoad =0,
    dcabbr = "",
    dcInfo = "",
    dcInfoSplit = "",
    dcSubId = "",
    dcId ="";



//---------------------------------------------------------------------   
//----------------------   Rack List  ---------------------------------
//--------------------------------------------------------------------- 
/*
this is the Rack List block. Looks for "List" in the URL and returns list of datacenters with city and country from Main contact.
*/
exports.dcRackPages = function(req,res,next){
    console.log('***********exports.dcRackPages First >' +req.params.datacenter);
    if (!req.params.datacenter){
    console.log("in List");
    // this looks for "list" as the / url. if it exists, it prints the datacenter list
        Rack.find({}).sort('rackUnique').exec(function(err, racks){
        if(err){
        console.log(err);
        }else{
        Datacenter.find({},'_id fullName abbreviation foundingCompany cages._id cages.cageNickname cages.cageAbbreviation cages.cageName',function(err,datacenter){
        if(err){
        console.log(err);
        }else{
            var context = {
                racks: racks.map(function(rack){
                var uber = strTgs.findCGParent(rack.rackParentCage,datacenter);
                       // rack.populate('rackParentDC', 'abbreviation cageNickname')
                    //console.log(rack);
                    return {
                            titleNow: "Rack List",
                            rackParentDC: rack.rackParentDC,
                            abbreviation: uber.abbreviation,
                            foundingCompany: uber.foundingCompany,
                            cageAbbreviation: uber.cageAbbreviation,
                            cageNickname: uber.cageNickname,
                            cageName: uber.cageName,
                            rackNickname: rack.rackNickname,
                            rackName: rack.rackName,
                            rackUnique: rack.rackUnique,
                            rackParentCage: rack.rackParentCage,
                            rackDescription: rack.rackDescription,
                            rackSN: rack.rackSN,
                            rackHeight: rack.rackHeight,
                            rackWidth: rack.rackWidth,
                            rackDepth: rack.rackDepth,
                            rackLat: rack.rackLat,
                            rackLon: rack.rackLon,
                            rackStatus: strTgs.trueFalseIcon(rack.rackStatus,rack.rackStatus),
                            rackMake: rack.rackMake,
                            rackModel: rack.rackModel,
                            rUs: rack.rUs,
                            createdBy: rack.createdBy,
                            createdOn: strTgs.dateMod(rack.createdOn),
                            modifiedOn: strTgs.dateMod(rack.modifiedOn),
                    };
                })
            };
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('location/rack-list', context);
        }});}});
        
/*------------------------------------------------------------------
----------------------- Create New Rack Power   --------------------   
------------------------------------------------------------------------
*/
    } else if (req.params.datacenter.indexOf ("circuit") !=-1){
        console.log('else if (req.params.datacenter.indexOf ("circuit")');
        console.log("rack "+req.params.datacenter);
        start = req.params.datacenter.indexOf ("~")+1;
            console.log("|start   >"+start);
        dcInfo = req.params.datacenter.substring (start);
            console.log("|dcInfo  >"+dcInfo);
        dcSplit = dcInfo.indexOf (">");
            console.log("|dcSplit >"+dcSplit);
        dcSubId = dcInfo.substring (dcSplit+1);
            console.log("|dcSubId >"+dcSubId);
        dcId = dcInfo.substring (0,dcSplit);
            console.log("|dcId    >"+dcId);
        
        
        
        Rack.findOne({rackUnique: dcId},function(err,rk){
        if(err)return next(err);
        Optionsdb.findOne({optListKey: "optEquipStatus"},function(err,opt){
        if(err)return next(err);
        console.log(opt);
        Datacenter.find({},'_id fullName abbreviation foundingCompany powerNames cages._id cages.cageNickname cages.cageAbbreviation cages.cageName',function(err,datacenter){
        if(err) return next(err);
        
        // New Rack Power (no existing)
        var uber = strTgs.findCGParent(rk.rackParentCage,datacenter);
        var context;
        if (dcSubId === 'new'){
            context ={
                titleNow: rk.rackUnique,
                optEquipStatus: opt.optListArray,
                rackParentDC: rk.rackParentDC,
                fullName: uber.fullName,
                abbreviation: uber.abbreviation,
                foundingCompany: uber.foundingCompany,
                powerNames: uber.powerNames,
                cageAbbreviation: uber.cageAbbreviation,
                cageNickname: uber.cageNickname,
                cageName: uber.cageName,
                rackId: rk._id,
                rackNickname: rk.rackNickname,
                rackName: rk.rackName,
                rackUnique: rk.rackUnique,
                rackParentCage: rk.rackParentCage,
                };
            res.render('location/rackpower', context);
        
        } else {
       
        var thisSubDoc = rk.powers.id(dcSubId);

        if(err) return next(err);
        if(!rk) return next();
        // New Rack Power from Copy
        if (req.params.datacenter.indexOf ("copy") !=-1){
            //console.log(rk);
                context ={
                    titleNow: "Copy "+rk.rackUnique,
                    optEquipStatus: opt.optListArray,
                    rackParentDC: rk.rackParentDC,
                    fullName: uber.fullName,
                    abbreviation: uber.abbreviation,
                    foundingCompany: uber.foundingCompany,
                    powerNames: uber.powerNames,
                    cageAbbreviation: uber.cageAbbreviation,
                    cageNickname: uber.cageNickname,
                    cageName: uber.cageName,
                    rackId: rk._id,
                    rackNickname: rk.rackNickname,
                    rackName: rk.rackName,
                    rackUnique: rk.rackUnique,
                    rackParentCage: rk.rackParentCage,
                    rackPowStatus: thisSubDoc.rackPowStatus,
                    rackPowVolts: thisSubDoc.rackPowVolts,
                    rackPowPhase: thisSubDoc.rackPowPhase,
                    rackPowAmps: thisSubDoc.rackPowAmps,
                    rackPowReceptacle: thisSubDoc.rackPowReceptacle,
                    };        
        
        } else {
        // Edit Rack Power 
        console.log(rk);
            context ={
                titleNow: thisSubDoc.rackPowUnique,
                optEquipStatus: opt.optListArray,
                rackParentDC: rk.rackParentDC,
                fullName: uber.fullName,
                abbreviation: uber.abbreviation,
                foundingCompany: uber.foundingCompany,
                powerNames: uber.powerNames,
                cageAbbreviation: uber.cageAbbreviation,
                cageNickname: uber.cageNickname,
                cageName: uber.cageName,
                rackId: rk._id,
                rackNickname: rk.rackNickname,
                rackName: rk.rackName,
                rackUnique: rk.rackUnique,
                rackParentCage: rk.rackParentCage,
                rackPowId: thisSubDoc.id,
                rackPowMain: thisSubDoc.rackPowMain,
                rackPowCircuit: thisSubDoc.rackPowCircuit,
                rackPowUnique: thisSubDoc.rackPowUnique,
                rackPowStatus: thisSubDoc.rackPowStatus,
                rackPowVolts: thisSubDoc.rackPowVolts,
                rackPowPhase: thisSubDoc.rackPowPhase,
                rackPowAmps: thisSubDoc.rackPowAmps,
                rackPowReceptacle: thisSubDoc.rackPowReceptacle,
                };
            }    
        //console.log(context);
        res.render('location/rackpower', context); 
        }});});});
/*----------------------------------------------------------------------
---------------------  Create New Rack   -------------------------------
------------------------------------------------------------------------
link to this looks
 /location/rack/newrack~{{dcId}}-{{cageId}}
 /location/rack/newrack~5459a1b4310bed5b0c039b7a-5459a1b4310bed5b0c039b7b
 ------------------------------------------------------------------------
*/


    } else if (req.params.datacenter.indexOf ("newrack") !=-1){
        console.log('else if (req.params.datacenter.indexOf ("newrack")');
        console.log("datacenter "+req.params.datacenter);
        start = req.params.datacenter.indexOf ("~")+1;
            console.log("|start   >"+start);
        dcInfo = req.params.datacenter.substring (start);
            console.log("|dcInfo  >"+dcInfo);
        dcSplit = dcInfo.indexOf ("-");
            console.log("|dcSplit >"+dcSplit);
        dcSubId = dcInfo.substring (dcSplit+1);
            console.log("|dcSubId >"+dcSubId);
        dcId = dcInfo.substring (0,dcSplit);
            console.log("|dcId    >"+dcId);

        Datacenter.findById(dcId,function(err,datacenter){
        var dc = datacenter;
        var context;
        Optionsdb.findOne({optListKey: "optRackStatus"},function(err,opt){
        if(err)return next(err);
        console.log(opt);
        if(!datacenter){
            console.log("Rack !datacenter");
        } else {
        console.log("Rack is datacenter");
        var thisSubDoc = datacenter.cages.id(dcSubId);
        if(err) return next(err);
        console.log("datacener= "+datacenter);
            context ={
                optRackStatus: opt.optListArray,
                id:dc._id,
                fullName:dc.fullName,
                abbreviation:dc.abbreviation,
                createdOn: strTgs.dateMod(dc.createdOn),
                foundingCompany:dc.foundingCompany,
                        titleNow: "New Rack",
                        cageId : thisSubDoc.id,
                        cageNickname: thisSubDoc.cageNickname,
                        cageName: thisSubDoc.cageName,
                        cageAbbreviation: thisSubDoc.cageAbbreviation,
                };
        console.log(context);
        res.render('location/rackedit', context);  
        }});});

    }  else {
/*---------------------------------------------------------------------
-------------------------Rack Edit ------------------------------------
                   /location/rack/edit~copy-
------------------------------------------------------------------------
*/

    if (req.params.datacenter.indexOf ("edit") !=-1){
        console.log('else if (req.params.datacenter.indexOf ("edit")');

        start = req.params.datacenter.indexOf ("-");
        dcabbr = req.params.datacenter.substring (start+1);
            if (req.params.datacenter.indexOf ("copy") !=-1){
            editLoad = 5;
            console.log("copy rack "+dcabbr);
        } else {
            editLoad = 3;
            console.log("edit rack "+dcabbr);
        }
        } else {
            editLoad = 1;
            dcabbr = req.params.datacenter;
            console.log("view rack "+dcabbr);
        }
        
  
    Rack.findOne({rackUnique: dcabbr},function(err,rack){
        if(err) return next(err);
        if(!rack) return next();
        //console.log(datacenter);
        
    Optionsdb.findOne({optListKey: "optRackStatus"},function(err,opt){
        if(err)return next(err);
        console.log(opt);    
    Datacenter.findById(rack.rackParentDC, '_id fullName abbreviation foundingCompany cages._id cages.cageNickname cages.cageAbbreviation cages.cageName',function(err, datacenter){ 
        if(err){
        console.log(err);
        }else{
        console.log ('Rack.findOne takes the id and displays the matching rack');
            var uber = strTgs.findCGParent(rack.rackParentCage,datacenter);            
        if(editLoad < 4){
             context = {    
                            optRackStatus: opt.optListArray,
                            titleNow: rack.rackUnique,
                            rackParentDC: rack.rackParentDC,
                            fullName: uber.fullName,
                            abbreviation: uber.abbreviation,
                            rackParentCage: rack.rackParentCage,
                            foundingCompany: uber.foundingCompany,
                            cageAbbreviation: uber.cageAbbreviation,
                            cageNickname: uber.cageNickname,
                            cageName: uber.cageName,
                            rackDescription: rack.rackDescription,
                            rackHeight: rack.rackHeight,
                            rackWidth: rack.rackWidth,
                            rackDepth: rack.rackDepth,
                            rackMake: rack.rackMake,
                            rackModel: rack.rackModel,
                            rUs: rack.rUs,            
                            rackNickname: rack.rackNickname,
                            rackName: rack.rackName,
                            rackUnique: rack.rackUnique,
                            rackSN: rack.rackSN,
                            rackLat: rack.rackLat,
                            rackLon: rack.rackLon,
                            rackStatus: rack.rackStatus,
                            rackNotes: rack.rackNotes,
                            createdBy: rack.createdBy,
                            createdOn: strTgs.dateMod(rack.createdOn),
                            modifiedBy: rack.modifiedBy,
                            modifiedOn: strTgs.dateMod(rack.modifiedOn),
                            powers: rack.powers.map(function(rp){
                            return {
                                rackPowId: rp.id,
                                rackPowUnique: rp.rackPowUnique,
                                rackPowMain: rp.rackPowMain,
                                rackPowCircuit: rp.rackPowCircuit,
                                rackPowStatus: rp.rackPowStatus,
                                rackPowVolts: rp.rackPowVolts,
                                rackPowPhase: rp.rackPowPhase,
                                rackPowAmps: rp.rackPowAmps,
                                rackPowReceptacle: rp.rackPowReceptacle,
                                rackPowNotes: rp.rackPowNotes,
                                rackPowCreatedBy: rp.rackPowCreatedBy,
                                rackPowCreatedOn: rp.rackPowCreatedOn,
                                createdBy: rp.createdBy,
                                createdOn: strTgs.dateMod(rp.createdOn),
                                modifiedby: rp.modifiedbBy,
                                modifiedOn: strTgs.dateMod(rp.modifiedOn),
                            };
                            }),
                        }; 
        } else {   
           context = {
                            titleNow: "Copy "+rack.rackUnique,
                            optRackStatus: opt.optListArray,
                            wasCopy:rack.rackUnique,
                            rackParentDC: rack.rackParentDC,
                            fullName: uber.fullName,
                            abbreviation: uber.abbreviation,
                            rackParentCage: rack.rackParentCage,
                            foundingCompany: uber.foundingCompany,
                            cageAbbreviation: uber.cageAbbreviation,
                            cageNickname: uber.cageNickname,
                            cageName: uber.cageName,
                            rackDescription: rack.rackDescription,
                            rackHeight: rack.rackHeight,
                            rackWidth: rack.rackWidth,
                            rackDepth: rack.rackDepth,
                            rackMake: rack.rackMake,
                            rackModel: rack.rackModel,
                            rUs: rack.rUs,
                            rackStatus: rack.rackStatus,
                        };    
        }                    
 
        //console.log(context);
        if (editLoad > 2){
            console.log("rackedit");
            res.render('location/rackedit', context); 
        }else{
        res.render('location/rack', context);  
        }
        }});
        });
        });
    }
};
/* ---------------------------------------------------------------------
-----------------------   New Rack working   ---------------------------
------------------------------------------------------------------------
*/
exports.dcRackPost = function(req,res){
    // this makes the abbreviation available for the URL
    res.abbreviation = req.body.abbreviation;
    console.log("dcRackPost abbreviation>"+res.abbreviation);
    console.log("rUs >"+req.body.rUs);
    //console.log("rUs expanded >"+ strTgs.compUs(req.body.rUs));
    // rackUniqe is created when making a new rack so it does not exist on new 
    // or copied racks
    if (!req.body.rackUnique){
    if (req.body.wasCopy){
    res.abbreviation = req.body.wasCopy;
    }
    console.log("new rack in DC "+req.body.id);
    Rack.create({
                    	rackParentDC:req.body.id,
                        rackParentCage:req.body.cageId,
                        rackNickname: strTgs.cTrim(req.body.rackNickname),
                        rackName:strTgs.cTrim(req.body.rackName),
                        rackUnique:(req.body.abbreviation+"_"+req.body.cageAbbreviation+"_"+strTgs.cTrim(req.body.rackNickname)),
                        rackDescription:strTgs.uTrim(req.body.rackDescription),
                        rackSN: strTgs.cTrim(req.body.rackSN),
                        rackHeight:strTgs.sTrim(req.body.rackHeight),
                        rackWidth:strTgs.uTrim(req.body.rackWidth),
                        rackDepth:strTgs.uTrim(req.body.rackDepth),
                        rackLat:strTgs.cTrim(req.body.rackLat),
                        rackLon:strTgs.cTrim(req.body.rackLon),
                        rackStatus:req.body.rackStatus,
                        rackMake:strTgs.uTrim(req.body.rackMake),
                        rackModel:strTgs.uTrim(req.body.rackModel),
                        rUs: strTgs.sTrim(req.body.rUs),
                        rackNotes: strTgs.uTrim(req.body.rackNotes),
                        createdOn: Date.now(),
                        createdBy:'Admin',                        

                    },function(err){
	        if(err) {
	        	console.error(err.stack);
                if(err.stack.indexOf ('matching')!=-1){
                req.session.flash = {
	                type: 'danger',
	                intro: 'Duplicate!',
	                message: 'Looks like there is already a rack by that name.',
	            };
                
                } else { 
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };}
                return res.redirect(303, '/location/rack');
	        }
            if (!req.body.wasCopy){
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
                };
	        return res.redirect(303, '/location/datacenter/'+ res.abbreviation);
            } else { 
            req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
                };
	        return res.redirect(303, '/location/rack/copy~edit-'+ res.abbreviation);

            }
	    }
        );
        
	} else {
    Rack.findOne({rackUnique: req.body.rackUnique},function(err,rack){
    res.abbreviation = req.body.rackUnique;
    var thisDoc = rack;
    console.log("existing id>"+thisDoc);
        if (err) {
            console.log(err);
            res.redirect('location/datacenter/'+res.abbreviation);
        } else {

                        thisDoc.rackName = strTgs.uCleanUp(thisDoc.rackName,req.body.rackName);
                        thisDoc.rackDescription = strTgs.uCleanUp(thisDoc.rackDescription,req.body.rackDescription);
                        thisDoc.rackSN = strTgs.uCleanUp(thisDoc.rackSN,req.body.rackSN);
                        thisDoc.rackHeight = strTgs.uCleanUp(thisDoc.rackHeight,req.body.rackHeight);
                        thisDoc.rackWidth = strTgs.uCleanUp(thisDoc.rackWidth,req.body.rackWidth);
                        thisDoc.rackDepth = strTgs.uCleanUp(thisDoc.rackDepth,req.body.rackDepth);
                        thisDoc.rackLat = strTgs.uCleanUp(thisDoc.rackLat,req.body.rackLat);
                        thisDoc.rackLon = strTgs.uCleanUp(thisDoc.rackLon,req.body.rackLon);
                        thisDoc.rackStatus = strTgs.uCleanUp(thisDoc.rackStatus,req.body.rackStatus);
                        thisDoc.rackMake = strTgs.uCleanUp(thisDoc.rackMake,req.body.rackMake);
                        thisDoc.rackModel = strTgs.uCleanUp(thisDoc.rackModel,req.body.rackModel);
                        thisDoc.rackNotes = strTgs.uCleanUp(thisDoc.rackNotes,req.body.rackNotes);
                        thisDoc.modifiedOn = Date.now();
                        thisDoc.modifiedBy ='Admin';
                    }
	    rack.save(function(err){
	        if(err) {
	        	console.error(err.stack);
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };
	            return res.redirect(303, 'location/rack/'+ res.abbreviation);
	        }
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
	        };
	        return res.redirect(303, '/location/rack/'+ res.abbreviation);
	    });
	});
}
};
  
/*---------------------------------------------------------------------
---------------------------- Rack Delete ------------------------------
------------------------------------------------------------------------
*/
exports.rackDelete = function(req,res){
    res.abbreviation = req.body.rackUnique;
if (req.body.rackUnique){
        console.log("delete got this far");
        Rack.findOne({rackUnique: req.body.rackUnique},function(err,racktodelete){
        if(err){
        console.log(err);
        //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        }else{
            racktodelete.remove(function(err){
                if(err){
                console.log(err);
                req.session.flash = {
                        type: 'danger',
                        intro: 'Ooops!',
                        message: 'Something went wrong, '+ req.body.subName +' was not deleted.',
                    };
                    return res.redirect(303, '/location/rack/'+ res.abbreviation);
                } else {
                    req.session.flash = {
                    type: 'success',
                    intro: 'Done!',
                    message: 'Contact '+ req.body.rackUnique +' has been deleted. Good luck with that one',
                };
                return res.redirect(303, '/location/rack');
                }
            });
        }
    });
}
};
/* ---------------------------------------------------------------------
------------------------   Rack Power Post   ---------------------------
------------------------------------------------------------------------
*/

exports.dcRackPowPost = function(req,res){
    // this makes the abbreviation available for the URL
    //res.abbreviation = req.body.rackUnique;

    //console.log("rUs expanded >"+ strTgs.compUs(req.body.rUs));
    //if (!req.body.rackPowUnique){
    //if (req.body.wasCopy){
    //res.abbreviation = req.body.wasCopy;
    //}
    console.log("Rack Power abbreviation "+req.body.abbreviation);
    console.log("Rack Power rackUnique "+req.body.rackUnique);
    console.log("Rack Power rackPowUnique "+req.body.rackPowUnique);
    console.log("Rack Power rackPowMain "+req.body.rackPowMain);
    console.log("Rack Power rackPowVolts "+req.body.rackPowVolts);
    console.log("Rack Power rackPowPhase "+req.body.rackPowPhase);
    
    
    
    Rack.findOne({rackUnique: req.body.rackUnique},function(err,rk){
    res.abbreviation = req.body.rackUnique;
    console.log("Rack Power findOne "+rk);
        //console.log("dcRackPowPost abbreviation>"+res.abbreviation);
    var thisSubDoc;
    if(req.body.rackPowUnique === "new"){
    thisSubDoc = "new";
    }else{
    thisSubDoc = rk.powers.id(req.body.rackPowId);
    }
    console.log("existing id>"+thisSubDoc);
        if (err) {
            console.log(err);
            res.redirect('location/rack/'+res.abbreviation);
        } else if(thisSubDoc === "new"){
                rk.powers.push({
                    rackPowMain: req.body.rackPowMain,
                    rackPowCircuit: strTgs.cTrim(req.body.rackPowCircuit.trim),
                    rackPowUnique: req.body.abbreviation+"_"+req.body.rackPowMain+"_"+strTgs.cTrim(req.body.rackPowCircuit),
                    rackPowStatus: req.body.rackPowStatus,
                    rackPowVolts: strTgs.sTrim(req.body.rackPowVolts),
                    rackPowPhase: strTgs.sTrim(req.body.rackPowPhase),
                    rackPowAmps: strTgs.sTrim(req.body.rackPowAmps),
                    rackPowReceptacle: strTgs.cTrim(req.body.rackPowReceptacle),
                    rackPowCreatedBy: 'Admin',
                    rackPowCreatedOn: modifiedOn = Date.now(),
                    rackPowModifiedby: 'Admin',
                    rackPowModifiedOn: modifiedOn = Date.now(),
                });
        } else {
                thisSubDoc.rackPowStatus = strTgs.uCleanUp(thisSubDoc.rackPowStatus,req.body.rackPowStatus);
                thisSubDoc.rackPowVolts = strTgs.uCleanUp(thisSubDoc.rackPowVolts,req.body.rackPowVolts);
                thisSubDoc.rackPowPhase = strTgs.uCleanUp(thisSubDoc.rackPowPhase,req.body.rackPowPhase);
                thisSubDoc.rackPowAmps = strTgs.uCleanUp(thisSubDoc.rackPowAmps,req.body.rackPowAmps);
                thisSubDoc.rackPowReceptacle = strTgs.uCleanUp(thisSubDoc.rackPowReceptacle,req.body.rackPowReceptacle);
                thisSubDoc.modifiedOn = Date.now();
                thisSubDoc.modifiedBy ='Admin';
                    }
	    rk.save(function(err){
	        if(err) {
	        	console.error(err.stack);
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };
	            return res.redirect(303, 'location/rack/'+ res.abbreviation);
	        }
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
	        };
	        return res.redirect(303, '/location/rack/'+ res.abbreviation);
	    });
	});

};
/* ---------------------------------------------------------------------
-------------------    rackPow Delete   --------------------------------
------------------------------------------------------------------------
*/

exports.rackSubDelete = function(req,res){
    res.abbreviation = req.body.abbreviation;
if (req.body.id && req.body.subId){
    Rack.findById(req.body.id,req.body.subDoc,function (err, rk){
        if(err){
        console.log(err);
        //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        }else{
            rk.powers.id(req.body.subId).remove();
            rk.save(function(err){
                if(err){
                console.log(err);
                req.session.flash = {
                        type: 'danger',
                        intro: 'Ooops!',
                        message: 'Something went wrong, '+ req.body.subName +' was not deleted.',
                    };
                    return res.redirect(303, '/location/rack/'+ res.abbreviation);
                } else {
                    req.session.flash = {
                    type: 'success',
                    intro: 'Done!',
                    message: 'Contact '+ req.body.subName +' has been deleted.',
                };
                return res.redirect(303, '/location/rack/'+ res.abbreviation);
                }
            });
        }
    });
}
};