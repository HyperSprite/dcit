var Datacenter = require('../models/datacenter.js'),
       stringThings = require('../lib/stringThings.js');


exports.datacenterNew = function(req,res){
    res.render('datacenter-new');
};

exports.datacenterNewPost = function(req,res,next){
    next(new Error("Not yet implemented"));
};

// convenience function for joining fields
function smartJoin(arr, separator){
	if(!separator) separator = ' ';
	return arr.filter(function(elt) {
		return elt!==undefined &&
			elt!==null &&
			elt.toString().trim() !== '';
	}).join(separator);
}

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


//working
exports.datacenterOne = function(req,res,next){
    console.log(req.params.datacenter);
    if (req.params.datacenter === 'list'){
    // this looks for "list" as the / url. if it exists, it prints the datacenter list
         Datacenter.find(function(err, datacenters){
            var context = {
                datacenters: datacenters.map(function(datacenter){
                    var dc = datacenter;
                    //console.log(datacenter);
                    return {
                        name: dc.fullName,
                        abb: dc.abbreviation,
                        id: dc._id,
                        city:stringThings.arrayByType(dc.contacts,dbqCity),
                        country:stringThings.arrayByType(dc.contacts,dbqCountry),
                    };
                })
            };
            res.render('location/datacenter-list', context);
        });    
    //} else {
    //this is the DC edit block. Looks for "edit" in the URL and redirects to a form.
    
    
    } else {
    // this takes the abbreviation and displays the matching datacenter
    Datacenter.findOne({abbreviation: req.params.datacenter},function(err,datacenter){
        if(err) return next(err);
        if(!datacenter) return next();
        console.log(datacenter);
            var dc = datacenter;
            var context ={
                id:dc._id,
                name:dc.fullName,
                crOn: stringThings.dateMod(dc.createdOn),
                contacts: dc.contacts.map(function(contact){
                    var ct = contact;
                    return {
                        conType: ct.conType,
                        conName: ct.conName,
                        address1: ct.address1,
                        address: stringThings.addressCleaner(ct),
                        city:ct.city,
                        state:ct.state,
                        zip:ct.zip,
                        lat:ct.lat,
                        lon:ct.lon,
                        conEmail: ct.conEmail,
                        conURL: ct.conURL,
                        conPhones: ct.conPhones.map(function(phone){
                            var po = phone;
                            return {
                                conPhoNum: po.conPhoNumber,
                                conPhoType: po.conPhoType,
                            };
                        }),
                        conNotes: ct.conNotes.map(function(note){
                            return {
                                conNoteDate: note.conNoteDate,
                                conNote: note.conNote,
                            };
                        }),
                    };
                }),
                };
        console.log(context);
        res.render('location/datacenter', context);  
        });
     }
};

// saving this block of code, it displays the datacenter details but I want to make it a view
 //   Datacenter.findOne({abbreviation: req.params.datacenter},function(err,datacenter){
 //       if(err) return next(err);
 //       if(!datacenter) return next();
 //       res.render('location/datacenter', {datacenter: datacenter});  
 //       });



//working : do not touch but no longer used
exports.datacenterTwo = function(req,res,next){
    console.log(req.params.datacenter);
    Datacenter.findOne({abbreviation: req.params.datacenter},function(err,datacenter){
        if(err) return next(err);
        if(!datacenter) return next();
        res.render('location/datacenter', {datacenter: datacenter});  
        });
};
//working : do not touch but no longer used
exports.datacenterList = function(req,res){
        Datacenter.find(function(err, datacenters){
            var context = {
                datacenters: datacenters.map(function(datacenter){
                    return {
                        name: datacenter.fullName,
                        abb: datacenter.abbreviation,
                        id: datacenter._id,
                        city: datacenter.city,
                        country: datacenter.country,
                        };
                })
            };
            res.render('location/datacenter-list', context);
        });    
};