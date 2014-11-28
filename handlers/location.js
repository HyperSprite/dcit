var Datacenter = require('../models/datacenter.js'),
    Rack = require('../models/rack.js'),
    Optionsdb = require('../models/options.js'),
    Equipment = require('../models/equipment.js'),
    Systemdb = require('../models/system.js'),
    strTgs = require('../lib/stringThings.js'),
    locationPlus1 = require('../lib/locationPlus1.js'),
    seedDataLoad = require('../seedDataLoad.js'),
    dcit = require('../dcit.js');

var ObjectId = require('mongoose').Types.ObjectId;

var LIUser = {'account':'admin',
                'name':'Superuser',
                'groups':['admin','base'],
                };


/* moved to dcit.js
var start  = "",
    dcabbr = "",
    dcInfo = "",
    dcInfoSplit = "",
    dcSubId = "",
    dcId ="";
    */
/*
exports.datacenterNew = function(req,res){
    res.render('datacenter-new');
};

exports.datacenterNewPost = function(req,res,next){
    next(new Error("Not yet implemented"));
};
*/
// convenience function for joining fields
function smartJoin(arr, separator){
	if(!separator) separator = ' ';
	return arr.filter(function(elt) {
		return elt!==undefined &&
			elt!==null &&
			elt.toString().trim() !== '';
	}).join(separator);
}

// ***** Datacenter ******************************************
// these are used by the arrayByType function to return a specific value.
var dbqCity = {
    dKey: 'conType',
    dVal: 'Main',
    dRet: 'city'
};
var dbqCountry = {
    dKey: 'conType',
    dVal: 'Main',
    dRet: 'country'
};
/*
    
Datacenter List

this is the DC List block. Looks for "List" in the URL and returns list of datacenters with city and country from Main contact.
*/
exports.datacenterPages = function(req,res,next){
    console.log('***********exports.datacenterPages First ' /*+req.params.datacenter*/);
    if (req.params.datacenter === 'list'){
    // this looks for "list" as the / url. if it exists, it prints the datacenter list
         Datacenter.find(function(err, datacenters){
            var context = {
                datacenters: datacenters.map(function(datacenter){
                    var dc = datacenter;
                    console.log(dc);
                    return {
                        id: dc._id,
                        fullName: dc.fullName,
                        titleNow: "Datacenter List",
                        abbreviation: dc.abbreviation,
                        foundingCompany:dc.foundingCompany,
                        city:strTgs.arrayByType(dc.contacts,dbqCity),
                        country:strTgs.arrayByType(dc.contacts,dbqCountry),
                    };
                })
            };
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('location/datacenter-list', context);
        });

/*
Datacenter Contact Edit for single doc
Create New Contact
Edit Contact
//this is the DC edit block. Looks for "contact" in the URL and redirects to a form to edit the Datacenter.
*/
    } else if (req.params.datacenter.indexOf ("contact") !=-1){
        console.log('else if (req.params.datacenter.indexOf ("contact")');
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
        if (dcSubId === 'new'){
            context ={
                id:dc._id,
                titleNow:dc.abbreviation,
                fullName:dc.fullName,
                abbreviation:dc.abbreviation,
                createdOn: strTgs.dateMod(dc.createdOn),
                foundingCompany:dc.foundingCompany,
                };
            res.render('location/datacentercontact', context);
        } else {
       
        var thisSubDoc = datacenter.contacts.id(dcSubId);

        if(err) return next(err);
        if(!datacenter) return next();
        console.log(datacenter);
            context ={
                id:dc._id,
                fullName:dc.fullName,
                abbreviation:dc.abbreviation,
                createdOn: strTgs.dateMod(dc.createdOn),
                foundingCompany:dc.foundingCompany,
                titleNow:thisSubDoc.conName+" - "+dc.abbreviation,
               
                        conId : thisSubDoc.id,
                        conGuid: thisSubDoc.conGuid,
                        conType: thisSubDoc.conType,
                        conName: thisSubDoc.conName,
                        address1: thisSubDoc.address1,
                        address2: thisSubDoc.address2,
                        address3: thisSubDoc.address3,
                        address4: thisSubDoc.address4,
                        city:thisSubDoc.city,
                        state:thisSubDoc.state,
                        country:thisSubDoc.country,
                        zip:thisSubDoc.zip,
                        lat:thisSubDoc.lat,
                        lon:thisSubDoc.lon,
                        conEmail: thisSubDoc.conEmail,
                        conURL: thisSubDoc.conURL,
                        conPho1Num: thisSubDoc.conPho1Num,
                        conPho1Typ: thisSubDoc.conPho1Typ,
                        conPho2Num: thisSubDoc.conPho2Num,
                        conPho2Typ: thisSubDoc.conPho2Typ,
                        conPho3Num: thisSubDoc.conPho3Num,
                        conPho3Typ: thisSubDoc.conPho3Typ,                        
                        conPho4Num: thisSubDoc.conPho4Num,
                        conPho4Typ: thisSubDoc.conPho4Typ,        
                        conNotes: thisSubDoc.conNotes, 
                    
                };
                
        //console.log(context);
        res.render('location/datacentercontact', context);  
        }});

/*
Datacenter Main New and Edit  

New is Working
this is the DC edit block. Looks for "edit" in the URL and redirects to a form to edit the Datacenter.
If "New" is in the URL, it does New, otherwise it goes to existing
*/
    } else if (req.params.datacenter.indexOf ("edit") !=-1){
        console.log('else if (req.params.datacenter.indexOf ("edit")');
        start = req.params.datacenter.indexOf ("-");
        dcabbr = req.params.datacenter.substring (start+1);
        
        if (dcabbr ==="new"){
                   
        res.render('location/datacenteredit');
        } else {
        
        //console.log('edit called' + dcabbr);
            Datacenter.findOne({abbreviation: dcabbr},function(err,datacenter){
        if(err) return next(err);
        if(!datacenter) return next();
        //console.log(datacenter);
            var dc = datacenter;
            var context ={
                id:dc._id,
                fullName:dc.fullName,
                abbreviation:dc.abbreviation,
                createdOn: strTgs.dateMod(dc.createdOn),
                foundingCompany:dc.foundingCompany,
                };            

        //console.log(context);
        res.render('location/datacenteredit', context);  
        });
        }
    }  else {

/*
Datacenter Full display

Working but not sure if I need it any more
this takes the abbreviation and displays the matching datacenter details
*/  
    Datacenter.findOne({abbreviation: req.params.datacenter},function(err,datacenter){
        if(err) return next(err);
        if(!datacenter) return next();
        //console.log(datacenter);
        console.log ('Datacenter.findOne - abbreviation to matching datacenter');
        var dc = datacenter;
        // looks up racks in Rack based on datacenter id
        Rack.find({rackParentDC: dc._id}).sort('rackUnique').exec(function(err,racks){
        console.log ('Rack - id to matching rack to datacenter'+ dc._id); 
            var context ={
                id:dc._id,
                titleNow:dc.abbreviation,
                fullName:dc.fullName,
                abbreviation:dc.abbreviation,
                foundingCompany:dc.foundingCompany,
                createdOn: strTgs.dateMod(dc.createdOn),
                powerNames: dc.powerNames,
                contacts: dc.contacts.map(function(contact){
                    var ct = contact;
                    return {
                        conId: ct.id,
                        conType: ct.conType,
                        conName: ct.conName,
                        address1: ct.address1,
                        address2: ct.address2,
                        address3: ct.address3,
                        address4: ct.address4,
                        city:ct.city,
                        state:ct.state,
                        zip:ct.zip,
                        country:ct.country,
                        lat:ct.lat,
                        lon:ct.lon,
                        conEmail: ct.conEmail,
                        conURL: ct.conURL,
                        conPho1Num: ct.conPho1Num,
                        conPho1Typ: ct.conPho1Typ,
                        conPho2Num: ct.conPho2Num,
                        conPho2Typ: ct.conPho2Typ,
                        conPho3Num: ct.conPho3Num,
                        conPho3Typ: ct.conPho3Typ,                        
                        conPho4Num: ct.conPho4Num,
                        conPho4Typ: ct.conPho4Typ,        
                        conNotes: ct.conNotes, 
                    };
                }),
                cages: dc.cages.map(function(cage){
                    var cg = cage;
                    return {
                            id:cg._id,
                            cageNickname:cg.cageNickname,
                            cageAbbreviation: cg.cageAbbreviation,
                            cageName: cg.cageName,
                            cageInMeters: cg.cageInMeters,
                            cageInFeet: strTgs.convertMetersToFeet(cg.cageInMeters),
                            cageWattPSM: cg.cageWattPSM,
                            cageWattPSF: strTgs.convertMetersToFeet(cg.cageWattPSM),
                            cageMap: cg.cageMap,
                            cageNotes: cg.cageNotes,
                        };
                    
                }),
                racks: racks.map(function(rack){
                    return {
                            rackParentDC: rack.rackParentDC,
                            rackParentCage: rack.rackParentCage,
                            rackNickname: rack.rackNickname,
                            rackName: rack.rackName,
                            rackUnique: rack.rackUnique,
                            rackDescription: rack.rackDescription,
                            rackLat: rack.rackLat,
                            rackLon: rack.rackLon,
                            rackStatus: strTgs.trueFalseIcon(rack.rackStatus,rack.rackStatus),
                            rackSN: rack.rackSN,
                            rUs: rack.rUs,
                            createdBy: rack.createdBy,
                            createdOn: strTgs.dateMod(rack.createdOn),
                            modifiedOn: strTgs.dateMod(rack.modifiedOn),
                    };
                }),

            };   
        res.render('location/datacenter', context);  
        });
        });
    }
};
/*
Datacenter Contact Post
Working - Done
this is the DC Cage edit block. Looks for "cage/edit-" in the URL and redirects to a form to edit the Datacenter.
*/
// this works like this: 
// if(thisSubDoc.conType==="" && req.body.conType==""){}else{thisSubDoc.conType = req.body.conType.trim();}
/*uCleanUp
uCleanUp = function(old,current){
    console.log ("was>"+old);
    console.log ("now>"+current)
    if(old==="" && current==""){}else{was = current.trim();}
    return current;
};

New Datacenter working
*/
exports.datacenterPost = function(req,res){
    // this makes the abbreviation available for the URL
    res.abbreviation = req.body.abbreviation;
    console.log("datacenterPost abbreviation>"+res.abbreviation);
    if (!req.body.id){
    Datacenter.create({
                    fullName : req.body.fullName,               
                    abbreviation : req.body.abbreviation,
                    foundingCompany : req.body.foundingCompany,
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
                return res.redirect(303, 'location/datacenter/'+ res.abbreviation);
	        }
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
                };
	        return res.redirect(303, '/location/datacenter/'+ res.abbreviation);
	    }
        );
     // Datacenter update   
	} else {
    Datacenter.findById(req.body.id, function(err, datacenter){
    var thisDoc = datacenter;
    console.log("id>"+thisDoc);
        if (err) {
            console.log(err);
            res.redirect('location/datacenter/'+res.abbreviation);
        
        } else {
                    thisDoc.fullName = strTgs.uCleanUp(thisDoc.fullName,req.body.fullName);
                    thisDoc.abbreviation = strTgs.uCleanUp(thisDoc.abbreviation,req.body.abbreviation);
                    thisDoc.foundingCompany = strTgs.uCleanUp(thisDoc.foundingCompany,req.body.foundingCompany); 
                    thisDoc.modifiedOn = Date.now();
                    thisDoc.modifiedBy = "Admin";
                    }

	    datacenter.save(function(err){
	        if(err) {
	        	console.error(err.stack);
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };
	            return res.redirect(303, 'location/datacenter/'+ res.abbreviation);
	        }
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
	        };
	        return res.redirect(303, '/location/datacenter/'+ res.abbreviation);
	    });
	});
}
};
  
exports.datacenterContactPost = function(req,res){
    // this makes the abbreviation available for the URL
    res.abbreviation = req.body.abbreviation;
    console.log("id>"+req.body.id);
    console.log("abbreviation>"+req.body.abbreviation);
    console.log("conId       >"+req.body.conId);
    Datacenter.findById(req.body.id, 'contacts modifiedOn', function(err, datacenter){
    var thisSubDoc = datacenter.contacts.id(req.body.conId);
        if (err) {
            console.log(err);
            res.redirect('location/datacenter/'+res.abbreviation);
        
        } else if (!thisSubDoc){
                    datacenter.contacts.push({
                        conGuid : req.body.id+req.body.conName.trim(),
                        conType : req.body.conType.trim(),               
                        conName : req.body.conName.trim(),
                        address1 : req.body.address1.trim(),
                        address2 : req.body.address2.trim(),
                        address3 : req.body.address3.trim(),
                        address4 : req.body.address4.trim(),
                        city : req.body.city.trim(),
                        state : req.body.state,
                        country : req.body.country,
                        zip : req.body.zip.trim(),
                        lat : req.body.lat.trim(),
                        lon : req.body.lon.trim(),
                        conEmail : req.body.conEmail.trim(),
                        conURL : req.body.conURL.trim(),
                        conPho1Num : req.body.conPho1Num.trim(),
                        conPho1Typ : req.body.conPho1Typ.trim(),
                        conPho2Num : req.body.conPho2Num.trim(),
                        conPho2Typ : req.body.conPho2Typ.trim(),
                        conPho3Num : req.body.conPho3Num.trim(),
                        conPho3Typ : req.body.conPho3Typ.trim(),
                        conPho4Num : req.body.conPho4Num.trim(),
                        conPho4Typ : req.body.conPho4Typ.trim(),
                        conNotes : req.body.conNotes.trim(),
                    });        
        } else { 
                    thisSubDoc.conGuid = strTgs.uCleanUp(thisSubDoc.conGuid,req.body.id+req.body.conName);
                    thisSubDoc.conType = strTgs.uCleanUp(thisSubDoc.conType,req.body.conType);
                    thisSubDoc.conName = strTgs.uCleanUp(thisSubDoc.conName,req.body.conName);
                    thisSubDoc.address1 = strTgs.uCleanUp(thisSubDoc.address1,req.body.address1); 
                    thisSubDoc.address2 = strTgs.uCleanUp(thisSubDoc.address2,req.body.address2);
                    thisSubDoc.address3 = strTgs.uCleanUp(thisSubDoc.address3,req.body.address3);
                    thisSubDoc.address4 = strTgs.uCleanUp(thisSubDoc.address4,req.body.address4);
                    thisSubDoc.city = strTgs.uCleanUp(thisSubDoc.city,req.body.city);
                    thisSubDoc.state = strTgs.uCleanUp(thisSubDoc.state,req.body.state);
                    thisSubDoc.country = strTgs.uCleanUp(thisSubDoc.country,req.body.country);
                    thisSubDoc.zip = strTgs.uCleanUp(thisSubDoc.zip,req.body.zip);
                    thisSubDoc.lat = strTgs.uCleanUp(thisSubDoc.lat,req.body.lat);
                    thisSubDoc.lon = strTgs.uCleanUp(thisSubDoc.lon,req.body.lon);
                    thisSubDoc.conEmail = strTgs.uCleanUp(thisSubDoc.conEmail,req.body.conEmail);
                    thisSubDoc.conURL = strTgs.uCleanUp(thisSubDoc.conURL,req.body.conURL);
                    thisSubDoc.conPho1Num = strTgs.uCleanUp(thisSubDoc.conPho1Num,req.body.conPho1Num);
                    thisSubDoc.conPho1Typ = strTgs.uCleanUp(thisSubDoc.conPho1Typ,req.body.conPho1Typ);
                    thisSubDoc.conPho2Num = strTgs.uCleanUp(thisSubDoc.conPho2Num,req.body.conPho2Num);
                    thisSubDoc.conPho2Typ = strTgs.uCleanUp(thisSubDoc.conPho2Typ,req.body.conPho2Typ);
                    thisSubDoc.conPho3Num = strTgs.uCleanUp(thisSubDoc.conPho3Num,req.body.conPho3Num);
                    thisSubDoc.conPho3Typ = strTgs.uCleanUp(thisSubDoc.conPho3Typ,req.body.conPho3Typ);
                    thisSubDoc.conPho4Num = strTgs.uCleanUp(thisSubDoc.conPho4Num,req.body.conPho4Num);
                    thisSubDoc.conPho4Typ = strTgs.uCleanUp(thisSubDoc.conPho4Typ,req.body.conPho4Typ);
                    thisSubDoc.conNotes = strTgs.uCleanUp(thisSubDoc.conNotes,req.body.conNotes);
                    }

	    datacenter.save(function(err){
	        if(err) {
	        	console.error(err.stack);
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };
	            return res.redirect(303, 'location/datacenter/'+ res.abbreviation);
	        }
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
	        };
	        return res.redirect(303, '/location/datacenter/'+ res.abbreviation);
	    });
	});
}; 

// contact and cage Delete

exports.datacenterSubDelete = function(req,res){
            
    res.abbreviation = req.body.abbreviation;
if (req.body.id && req.body.subId){
            
    Datacenter.findById(req.body.id,req.body.subDoc,function (err, datacenter){
            console.log("first : "+datacenter); 
        if(err){
        console.log(err);
        //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        }else{            
            if(req.body.collectionSub === "contact"){
               datacenter.contacts.id(req.body.subId).remove();
                console.log("delete: "+req.body.subId+" - "+req.body.subName);
            } else if (req.body.collectionSub === "cages"){//(req.body.collectionSub === "cages")
                datacenter.cages.id(req.body.subId).remove();
                console.log("delete: "+req.body.subId+" - "+req.body.subName);
            }
            datacenter.save(function(err){
                if(err){
                console.log(err);
                req.session.flash = {
                        type: 'danger',
                        intro: 'Ooops!',
                        message: 'Something went wrong, '+ req.body.subName +' was not deleted.',
                    };
                    return res.redirect(303, '/location/datacenter/'+ res.abbreviation);
                } else {
                    req.session.flash = {
                    type: 'success',
                    intro: 'Done!',
                    message:  req.body.subName +' has been deleted.',
                };
                return res.redirect(303, '/location/datacenter/'+ res.abbreviation);
                }
            });
        }
    });
}
};

// datacenter delete

exports.datacenterDelete = function(req,res){
    res.abbreviation = req.body.id;
if (req.body.id){
        console.log("delete got this far");
        Datacenter.findOne({_id: req.body.id},function(err,datacentertodelete){
        if(err){
        console.log(err);
        //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        }else{
            datacentertodelete.remove(function(err){
                if(err){
                console.log(err);
                req.session.flash = {
                        type: 'danger',
                        intro: 'Ooops!',
                        message: 'Something went wrong, '+ req.body.subName +' was not deleted.',
                    };
                    return res.redirect(303, '/location/datacenter/'+ res.abbreviation);
                } else {
                    req.session.flash = {
                    type: 'success',
                    intro: 'Done!',
                    message: 'Datacenter '+ req.body.rackUnique +' has been deleted. Good luck with that one',
                };
                return res.redirect(303, '/location/datacenter/list');
                }
            });
        }
    });
}
};
/*
Datacenter Cage Edit 

Working - Done
this is the DC Cage edit block. Looks for "cage/edit-" in the URL and redirects to a form to edit the Datacenter.
*/  
exports.datacenterCagePages = function(req,res,next){
    //console.log('***********datacenterCagePages First ' +req.params.datacenter);
    console.log('exports.datacenterCagePages');
    start = req.params.datacenter.indexOf ("-");
    var searchId = req.params.datacenter.substring (start+1);
        console.log('edit called ' + searchId); 
    //  console.log(obj_dccage);
    var query = Datacenter.findOne({_id: searchId});
        query.exec(function(err,datacenter){
        if(err) return next(err);
        //console.log("datacenter :" + datacenter);
        console.log("1 v19 ");
        if(!datacenter) return next();
        //console.log("2 ");

            var dc = datacenter;
            console.log ("dc>"+dc);
            var context ={
                id:dc._id,
                fullName:dc.fullName,
                abbreviation:dc.abbreviation,
                createdOn: strTgs.dateMod(dc.createdOn),
                foundingCompany:dc.foundingCompany,
                
                cages: dc.cages.map(function(cg){
                    //var cg = cage;
                    return {
                        id:cg._id,
                        titleNow:cg.cageAbbreviation,
                        cageNickname:cg.cageNickname,
                        cageAbbreviation:cg.cageAbbreviation,
                        cageName: cg.cageName,
                        cageInMeters: cg.cageInMeters,
                        cageWattPSM: cg.cageWattPSM,
                        cageMap: cg.cageMap,
                        cageNotes: cg.cageNotes,
                    };
                }),
            };

        res.render('location/datacentercage', context);  
        });

};
/*
Datacenter Cage Post
Working - Done
this is the DC Cage edit block. Looks for "cage/edit-" in the URL and redirects to a form to edit the Datacenter.
*/  

exports.datacenterCagePost = function(req,res){
    // this makes the abbreviation available for the URL
    res.abbreviation = req.body.abbreviation;
    console.log("@ id "+ req.body.id);
    var i = 1;
    // having the [i]index at the end of the form field collects it properly
    Datacenter.findById(req.body.id, 'cages modifiedOn', function(err, datacenter){
            if (err) {
                console.log(err);
                return res.redirect(303, '/location/datacenter/'+ res.abbreviation);
            } else if (!req.body.cageName){
                console.log("no cageName");
                req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'You can not submit blank forms.',
	            };
                return res.redirect(303, '/location/datacenter/'+ res.abbreviation);
            } else {
            //using index returned from handlebars and count to get loop count
                for(i=0;i<req.body.index.length;i++){
                    console.log('indx > '+req.body.index.length);
                    console.log('cageId           > '+req.body.cageId);
                    console.log('cageNickname     > '+req.body.cageNickname);
                    console.log('cageAbbreviation > '+req.body.cageAbbreviation);
                    console.log('cageName         > '+req.body.cageName);
                    console.log('cageWattPSM      > '+req.body.cageWattPSM);
                var checkVar = req.body.cageName[i];
                    console.log ("cageName> "+checkVar);
            // this is for empty +1    
                if (!checkVar){
                    console.log('no content cage');
            // this is for more than one new cage
            } else if (req.body.cageId[i] ==="new"){
                    console.log ('picked new cage');
            // this section for empty cage page    
                    datacenter.cages.push({
                        cageNickname : strTgs.uTrim(req.body.cageNickname[i]),
                        cageAbbreviation : strTgs.cTrim(req.body.cageAbbreviation[i]),
                        cageName : strTgs.uTrim(req.body.cageName[i]),
                        cageInMeters : strTgs.uTrim(req.body.cageInMeters[i]),
                        cageWattPSM : strTgs.uTrim(req.body.cageWattPSM[i]),
                        cageMap: strTgs.sTrim(req.body.cageMap[i]),
                        cageNotes : strTgs.uTrim(req.body.cageNotes[i]),
                    });
            // this is for existing cages    strTgs.uCleanUp(thisSubDoc.conType,req.body.conType);
            }else{
                    console.log('existing cage');
                    var thisSubDoc = datacenter.cages.id(req.body.cageId[i]);
                        thisSubDoc.cageNickname = strTgs.uTrim(req.body.cageNickname[i]);
                        thisSubDoc.cageAbbreviation = strTgs.cTrim(req.body.cageAbbreviation[i]);
                        thisSubDoc.cageName = strTgs.uTrim(req.body.cageName[i]);
                        thisSubDoc.cageInMeters = strTgs.uTrim(req.body.cageInMeters[i]);
                        thisSubDoc.cageWattPSM = strTgs.uTrim(req.body.cageWattPSM[i]);
                        thisSubDoc.cageMap = strTgs.uTrim(req.body.cageMap[i]);
                        thisSubDoc.cageNotes = strTgs.uTrim(req.body.cageNotes[i]);
                }}
            }
	    datacenter.save(function(err){
	        if(err) {
	        	console.error(err.stack);
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };
	            return res.redirect(303, '/location/datacenter/'+ res.abbreviation);
	        }
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
	        };
	        return res.redirect(303, '/location/datacenter/'+ res.abbreviation);
	    });
	});
}; 

/*
Datacenter Power Edit 

Working - Done
this is the DC Power edit block. Looks for "cage/edit-" in the URL and redirects to a form to edit the Datacenter.
*/  
exports.datacenterPowerPages = function(req,res,next){
    //console.log('***********datacenterCagePages First ' +req.params.datacenter);
    console.log('exports.datacenterPowerPages');
    start = req.params.datacenter.indexOf ("-");
    var searchId = req.params.datacenter.substring (start+1);
        console.log('edit called ' + searchId); 
    //  console.log(obj_dccage);
    var query = Datacenter.findOne({_id: searchId});
        query.exec(function(err,datacenter){
        if(err) return next(err);
        //console.log("datacenter :" + datacenter);
        console.log("Power v19 ");
        if(!datacenter) return next();
        //console.log("2 ");

            var dc = datacenter;
            console.log ("dc>"+dc);
            var context ={
                id:dc._id,
                titleNow:dc.abbreviation,
                fullName:dc.fullName,
                abbreviation:dc.abbreviation,
                createdOn: strTgs.dateMod(dc.createdOn),
                foundingCompany:dc.foundingCompany,
                powerNames: dc.powerNames,
                
            };

        res.render('location/datacenterpower', context);  
        });

};

exports.datacenterPowerPost = function(req,res){
    // this makes the abbreviation available for the URL
    res.abbreviation = req.body.abbreviation;
    console.log("PowerPost id "+ req.body.id);
    var i = 1;
    // having the [i]index at the end of the form field collects it properly
    Datacenter.findById(req.body.id, 'power modifiedOn', function(err, datacenter){
    var thisDoc = datacenter;
    console.log("id>"+thisDoc);
        if (err) {
            console.log(err);
            res.redirect('location/datacenter/'+res.abbreviation);
        
        } else {    
                    thisDoc.powerNames = strTgs.uCleanUp(thisDoc.powerNames,req.body.powerNames).split(","); // split makes this an array
                    thisDoc.modifiedOn = Date.now();
                    thisDoc.modifiedBy = "Admin";
                    }

	    datacenter.save(function(err){
	        if(err) {
	        	console.error(err.stack);
	            req.session.flash = {
	                type: 'danger',
	                intro: 'Ooops!',
	                message: 'There was an error processing your request.',
	            };
	            return res.redirect(303, 'location/datacenter/'+ res.abbreviation);
	        }
	        req.session.flash = {
	            type: 'success',
	            intro: 'Thank you!',
	            message: 'Your update has been made.',
	        };
	        return res.redirect(303, '/location/datacenter/'+ res.abbreviation);
	    });
	});
};

 