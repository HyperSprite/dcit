var Datacenter = require('../models/datacenter.js'),
       stringThings = require('../lib/stringThings.js'),
       logger = require('../lib/logger.js');


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

// ***** Cage ***********************************************






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

//working - Returns list of datacenters with city and country from Main contact
exports.datacenterPages = function(req,res,next){
    logger.info('***********First call/n' +req.params.datacenter);
    if (req.params.datacenter === 'list'){
    // this looks for "list" as the / url. if it exists, it prints the datacenter list
         Datacenter.find(function(err, datacenters){
            var context = {
                datacenters: datacenters.map(function(datacenter){
                    var dc = datacenter;
                    //logger.info(datacenter);
                    return {
                        name: dc.fullName,
                        abb: dc.abbreviation,
                        id: dc._id,
                        city:stringThings.arrayByType(dc.contacts,dbqCity),
                        country:stringThings.arrayByType(dc.contacts,dbqCountry),
                    };
                })
            };
            // the 'location/datacenter-list' is the view that will be called
            // context is the data from above
            res.render('location/datacenter-list', context);
        });    
    } else if (req.params.datacenter.indexOf ("edit") !=-1){
    //this is the DC edit block. Looks for "edit" in the URL and redirects to a form to edit the Datacenter.

        var start = req.params.datacenter.indexOf ("-");
        var dcabbr = req.params.datacenter.substring (start+1);
        logger.info('edit called' + dcabbr);
            Datacenter.findOne({abbreviation: dcabbr},function(err,datacenter){
        if(err) return next(err);
        if(!datacenter) return next();
        logger.info(datacenter);
            var dc = datacenter;
            var context ={
                id:dc._id,
                fullName:dc.fullName,
                abbreviation:dc.abbreviation,
                createdOn: stringThings.dateMod(dc.createdOn),
                foundingCompany:dc.foundingCompany,
                                
                contacts: dc.contacts.map(function(contact){
                    var ct = contact;
                    return {
                        conType: ct.conType,
                        conName: ct.conName,
                        address1: ct.address1,
                        address2: ct.address2,
                        address3: ct.address3,
                        address4: ct.address4,
                        city:ct.city,
                        state:ct.state,
                        country:ct.country,
                        zip:ct.zip,
                        lat:ct.lat,
                        lon:ct.lon,
                        conEmail: ct.conEmail,
                        conURL: ct.conURL,
                        conPhones: ct.conPhones.map(function(phone){
                            var po = phone;
                            return {
                                conPhoNumber: po.conPhoNumber,
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
                cages: dc.cages.map(function(cage){
                    var ca = cage;
                    return {
                        //cageNickname:String,cageName:String,cageInMeters:Number,cageWattPSM:Number,cageNotes:String
                        cageNickname:ca.cageNickname,
                        cageName:ca.cageName,
                        cageInMeters:ca.cageInMeters,
                        cageWattPSM:ca.cageWattPSM,
                        cageNotes:ca.cageNotes,
                    };
                };
        logger.info(context);
        res.render('location/datacenter-edit', context);  
        });
    } else {
// working - this takes the abbreviation and displays the matching datacenter
    Datacenter.findOne({abbreviation: req.params.datacenter},function(err,datacenter){
        if(err) return next(err);
        if(!datacenter) return next();
        logger.info(datacenter);
            var dc = datacenter;
            var context ={
                id:dc._id,
                name:dc.fullName,
                abbr:dc.abbreviation,
                crOn: stringThings.dateMod(dc.createdOn),
                contacts: dc.contacts.map(function(contact){
                    var ct = contact;
                    return {
                        contactCnt: ct.contactCnt,
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
                                conPhoCnt: po.conPhoCnt,
                                conPhoNumber: po.conPhoNumber,
                                conPhoType: po.conPhoType,
                            };
                        }),
                        conNotes: ct.conNotes.map(function(note){
                            return {
                                conNoteCnt: note.conNoteCnt,
                                conNoteDate: stringThings.dateMod(note.conNoteDate),
                                conNote: note.conNote,
                            };
                        }),
                    };
                }),
                };
        logger.info(context);
        res.render('location/datacenter', context);  
        });
     }
};
// everything above this line works everything below it is sandbox



exports.datacenterPagesPost = function(req,res,next){
    var dcabbr = req.body.abbreviation;
    logger.info('edit post called -' + dcabbr);
   
    Datacenter.update({_id: req.body.id}, {upsert:true}, function(err, doc){
    if (err) return res.send(500, { error: err });
    logger.info("succesfully saved");
    res.render('location/datacenter/'+ dcabbr);
    });

}
    //add handlebars index to the edit page. then do the updates based on the index number. 
    // there should be a better way though.
    
//Model.findOneAndUpdate({_id : req.body.id, data._id : rec.body.contacts.id }, { data.$.conType : rec.body.contacts.conType })
    


// saving this block of code, it displays the datacenter details but I want to make it a view
 //   Datacenter.findOne({abbreviation: req.params.datacenter},function(err,datacenter){
 //       if(err) return next(err);
 //       if(!datacenter) return next();
 //       res.render('location/datacenter', {datacenter: datacenter});  
 //       });



//working : do not touch but no longer used
exports.datacenterTwo = function(req,res,next){
    logger.info(req.params.datacenter);
    Datacenter.findOne({abbreviation: req.params.datacenter},function(err,datacenter){
        if(err) return next(err);
        if(!datacenter) return next();
        res.render('location/datacenter', {datacenter: datacenter});  
        });
};
//working : do not touch but no longer used
exports.olddatacenterOld1 = function(req,res){
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




