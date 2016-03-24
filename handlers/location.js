const strTgs = require('../lib/stringThings.js');
const accConfig = require('../config/access');
const seedDataLoad = require('../seedDataLoad.js');
const dcit = require('../dcit.js');
const ObjectId = require('mongoose').Types.ObjectId;
const logger = require('../lib/logger.js');
const IpSubnetCalculator = require( 'ip-subnet-calculator' );
// Models
const Datacenter = require('../models/datacenter.js');
const Rack = require('../models/rack.js');
const Optionsdb = require('../models/options.js');
const Equipment = require('../models/equipment.js');
const Systemdb = require('../models/system.js');


// convenience function for joining fields
function smartJoin(arr, separator) {
  if (!separator) separator = ' ';
  return arr.filter(function(elt) {
    return elt !== undefined &&
      elt !== null &&
			elt.toString().trim() !== '';
  }).join(separator);
}

// ***** Datacenter ******************************************
// these are used by the arrayByType function to return a specific value.
var dbqCity = {
  dKey: 'conType',
  dVal: 'Main',
  dRet: 'city',
};
var dbqCountry = {
  dKey: 'conType',
  dVal: 'Main',
  dRet: 'country',
};
/*
Datacenter List
this is the DC List block. Looks for "List" in the URL and returns list of datacenters with city and country from Main contact.
*/
module.exports.datacenterPages = (req, res, next) => {
  // logger.info('***********exports.datacenterPages First ' /*+req.params.datacenter*/);
  if (req.params.datacenter === 'list' || !req.params.datacenter) {
  // this looks for "list" as the / url. if it exists, it prints the datacenter list
    Datacenter.find((err, datacenters) => {
      var context = {
        ses: req.session.ses,
        datacenters: datacenters.map((dc) => {
        // var dc = datacenter;
        // logger.info(dc);
          return {
            id: dc._id,
            fullName: dc.fullName,
            titleNow: 'Datacenter List',
            abbreviation: dc.abbreviation,
            foundingCompany: dc.foundingCompany,
            city: strTgs.arrayByType(dc.contacts, dbqCity),
            country: strTgs.arrayByType(dc.contacts, dbqCountry),
          };
        }),
      };
          // the 'location/datacenter-list' is the view that will be called
          // context is the data from above
      res.render('location/datacenter-list', context);
    });


    // Datacenter Contact Edit for single doc
    // Create New Contact
    // Edit Contact
    // this is the DC edit block. Looks for "contact" in the URL
    // and redirects to a form to edit the Datacenter.
  } else if (req.params.datacenter.indexOf('contact') !=-1){
      // logger.info('else if (req.params.datacenter.indexOf ("contact")');
      // logger.info("datacenter "+req.params.datacenter);
    var start = req.params.datacenter.indexOf('~') + 1;
      //    logger.info("|start   >"+start);
    var dcInfo = req.params.datacenter.substring(start);
      //    logger.info("|dcInfo  >"+dcInfo);
    var dcSplit = dcInfo.indexOf('-');
      //    logger.info("|dcSplit >"+dcSplit);
    var dcSubId = dcInfo.substring(dcSplit + 1);
       //   logger.info("|dcSubId >"+dcSubId);
    var dcId = dcInfo.substring(0, dcSplit);
      //    logger.info("|dcId    >"+dcId);

    Datacenter.findById(dcId, (err, datacenter) => {
      var dc = datacenter;
      var context;
      if (dcSubId === 'new') {
        context = {
          ses: req.session.ses,
          id: dc._id,
          titleNow: dc.abbreviation,
          fullName: dc.fullName,
          abbreviation: dc.abbreviation,
          createdOn: strTgs.dateMod(dc.createdOn),
          foundingCompany: dc.foundingCompany,
        };
        res.render('location/datacentercontact', context);
      } else {

        var thisSubDoc = datacenter.contacts.id(dcSubId);

        if (err) return next(err);
        if (!datacenter) return next();
          // logger.info(datacenter);
        context = {
          ses: req.session.ses,
          id: dc._id,
          fullName: dc.fullName,
          abbreviation: dc.abbreviation,
          createdOn: strTgs.dateMod(dc.createdOn),
          foundingCompany: dc.foundingCompany,
          titleNow: thisSubDoc.conName + ' - ' + dc.abbreviation,
          menu1: dc.abbreviation,
          menuLink1: '',
          conId: thisSubDoc.id,
          conGuid: thisSubDoc.conGuid,
          conType: thisSubDoc.conType,
          conName: thisSubDoc.conName,
          address1: thisSubDoc.address1,
          address2: thisSubDoc.address2,
          address3: thisSubDoc.address3,
          address4: thisSubDoc.address4,
          city: thisSubDoc.city,
          state: thisSubDoc.state,
          country: thisSubDoc.country,
          zip: thisSubDoc.zip,
          lat: thisSubDoc.lat,
          lon: thisSubDoc.lon,
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
      // logger.info(context);
        res.render('location/datacentercontact', context);
      }});

    // Datacenter Main New and Edit
    // New is Working
    // this is the DC edit block. Looks for "edit" in the URL
    // and redirects to a form to edit the Datacenter.
    // If "New" is in the URL, it does New, otherwise it goes to existing
  } else if (req.params.datacenter.indexOf('edit') != -1) {
    if (!req.user || req.user.access < 3) {
      req.session.flash = {
        type: 'danger',
        intro: 'Not Authorized!',
        message: 'You are not authorized for this action.',
      };
      return res.redirect(303, '/home');
    } else {
    // logger.info('else if (req.params.datacenter.indexOf ("edit")');
      var start = req.params.datacenter.indexOf('-');
      var dcabbr = req.params.datacenter.substring( start + 1);
      if (dcabbr === 'new') {
        var context = {
          ses: req.session.ses,
        };
        res.render('location/datacenteredit', context);
      } else {
      // logger.info('edit called' + dcabbr);
        Datacenter.findOne({abbreviation: dcabbr}, (err, datacenter) => {
          if (err) return next(err);
          if (!datacenter) return next();
        // logger.info(datacenter);
          var dc = datacenter;
          var context = {
            access: accConfig.accessCheck(req.user),
            user: req.user,
            requrl: req.url,
            ses: req.session.ses,
            id: dc._id,
            fullName: dc.fullName,
            abbreviation: dc.abbreviation,
            createdOn: strTgs.dateMod(dc.createdOn),
            foundingCompany: dc.foundingCompany,
          };
          // logger.info(context);
          res.render('location/datacenteredit', context);
        });
      }}
  } else {

    // Datacenter Full display

    // Working but not sure if I need it any more
    // this takes the abbreviation and displays the matching datacenter details

    Datacenter.findOne({abbreviation: req.params.datacenter}, (err, datacenter) => {
      if (err) return next(err);
      if (!datacenter) return next();
      // logger.info(datacenter);
      // logger.info ('Datacenter.findOne - abbreviation to matching datacenter');
      var dc = datacenter;
      // looks up racks in Rack based on datacenter id
      Rack.find({rackParentDC: dc._id}).sort('rackUnique').exec((err, racks) => {
      // logger.info ('Rack - id to matching rack to datacenter'+ dc._id);
        var context = {
          ses: req.session.ses,
          menu1: dc.abbreviation,
          menuLink1: `/location/datacenter/${dc.abbreviation}`,
          id: dc._id,
          titleNow: dc.abbreviation,
          fullName: dc.fullName,
          abbreviation: dc.abbreviation,
          foundingCompany: dc.foundingCompany,
          createdOn: strTgs.dateMod(dc.createdOn),
          powerNames: dc.powerNames,
          contacts: dc.contacts.map((contact) => {
            var ct = contact;
            return {
              id: dc._id,
              conId: ct.id,
              conType: ct.conType,
              conName: ct.conName,
              address1: ct.address1,
              address2: ct.address2,
              address3: ct.address3,
              address4: ct.address4,
              city: ct.city,
              state: ct.state,
              zip: ct.zip,
              country: ct.country,
              lat: ct.lat,
              lon: ct.lon,
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
          cages: dc.cages.map((cage) => {
            var cg = cage;
            return {
              id: cg._id,
              dcid: dc._id,
              cageNickname: cg.cageNickname,
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
          networks: dc.networks.map((nk) => {
            var iPRange;
            if (nk !== false) {
              iPRange = IpSubnetCalculator.calculateSubnetMask(nk.dcNetNetwork, nk.dcNetMask);
            }
            return {
              id: dc._id,
              dcNetId: nk._id,
              dcNetUnique: nk.dcNetUnique,
              dcNetType: nk.dcNetType,
              dcNetNetwork: nk.dcNetNetwork,
              dcNetMask: nk.dcNetMask,
              dcNetVlan: nk.dcNetVlan,
              dcNetDesc: nk.dcNetDesc,
              dcNetGateway: nk.dcNetGateway,
              dcNetDomain: nk.dcNetDomain,
              dcNetDns1: nk.dcNetDns1,
              dcNetDns2: nk.dcNetDns2,
              dcNetNTP1: nk.dcNetNTP1,
              dcNetNTP2: nk.dcNetNTP2,
              dcNetLdap1: nk.dcNetLdap1,
              dcNetLdap2: nk.dcNetLdap2,
              dcNetLdapString: nk.dcNetLdapString,
              dcNetTftpHost: nk.dcNetTftpHost,
              dcNetACSFilePath: nk.dcNetACSFilePath,
              ipLowStr: iPRange.ipLowStr,
              ipHighStr: iPRange.ipHighStr,
              prefixMaskStr: iPRange.prefixMaskStr,
            };
          }),
          racks: racks.map((rack) => {
            return {
              rackParentDC: rack.rackParentDC,
              rackParentCage: rack.rackParentCage,
              rackNickname: rack.rackNickname,
              rackName: rack.rackName,
              rackUnique: rack.rackUnique,
              rackDescription: rack.rackDescription,
              rackLat: rack.rackLat,
              rackLon: rack.rackLon,
              rackRow: rack.rackRow,
              rackStatus: strTgs.trueFalseIcon(rack.rackStatus, rack.rackStatus),
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

// -----------------------------------------------------------
// -------------------- Datacenter Post ----------------------
// -----------------------------------------------------------

module.exports.datacenterPost = (req, res) => {
  // this makes the abbreviation available for the URL
  res.abbreviation = req.body.abbreviation;
  // logger.info('datacenterPost abbreviation>'+res.abbreviation);
  if (!req.body.id) {
    Datacenter.create({
      fullName: req.body.fullName,
      abbreviation: req.body.abbreviation,
      foundingCompany: req.body.foundingCompany,
      createdOn: Date.now(),
      createdBy: req.user.local.email,
    }, (err) => {
      if (err) {
        console.error(err.stack);
        req.session.flash = {
          type: 'danger',
          intro: 'Ooops!',
          message: 'There was an error processing your request.',
        };
        return res.redirect(303, `location/datacenter/${res.abbreviation}`);
      }
      req.session.flash = {
        type: 'success',
        intro: 'Thank you!',
        message: 'Your update has been made.',
      };
      return res.redirect(303, `/location/datacenter/${res.abbreviation}`);
    });
     // Datacenter update
  } else {
    Datacenter.findById(req.body.id, (err, datacenter) => {
      var thisDoc = datacenter;
      // logger.info('id>'+thisDoc);
      if (err) {
        logger.info(err);
        res.redirect(`location/datacenter/${res.abbreviation}`);
      } else {
        thisDoc.fullName = strTgs.uCleanUp(thisDoc.fullName, req.body.fullName);
        thisDoc.abbreviation = strTgs.uCleanUp(thisDoc.abbreviation, req.body.abbreviation);
        thisDoc.foundingCompany = strTgs.uCleanUp(thisDoc.foundingCompany, req.body.foundingCompany);
        thisDoc.modifiedOn = Date.now();
        thisDoc.modifiedBy = req.user.local.email;
      }
      datacenter.save((err) => {
        if (err) {
          console.error(err.stack);
          req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'There was an error processing your request.',
          };
          return res.redirect(303, `location/datacenter/${res.abbreviation}`);
        }
        req.session.flash = {
          type: 'success',
          intro: 'Thank you!',
          message: 'Your update has been made.',
        };
        return res.redirect(303, `/location/datacenter/${res.abbreviation}`);
      });
    });
  }
};

module.exports.datacenterContactPost = (req, res) => {
  // this makes the abbreviation available for the URL
  res.abbreviation = req.body.abbreviation;
  // logger.info('id>'+req.body.id);
  // logger.info('abbreviation>'+req.body.abbreviation);
  // logger.info('conId       >'+req.body.conId);
  Datacenter.findById(req.body.id, 'contacts modifiedOn', (err, datacenter) => {
    var thisSubDoc = datacenter.contacts.id(req.body.conId);
    if (err) {
      logger.info(err);
      res.redirect(`location/datacenter/${res.abbreviation}`);
    } else if (!thisSubDoc) {
      datacenter.contacts.push({
        conGuid: req.body.id + req.body.conName.trim(),
        conType: req.body.conType.trim(),
        conName: req.body.conName.trim(),
        address1: req.body.address1.trim(),
        address2: req.body.address2.trim(),
        address3: req.body.address3.trim(),
        address4: req.body.address4.trim(),
        city: req.body.city.trim(),
        state: req.body.state,
        country: req.body.country,
        zip: req.body.zip.trim(),
        lat: req.body.lat.trim(),
        lon: req.body.lon.trim(),
        conEmail: req.body.conEmail.trim(),
        conURL: req.body.conURL.trim(),
        conPho1Num: req.body.conPho1Num.trim(),
        conPho1Typ: req.body.conPho1Typ.trim(),
        conPho2Num: req.body.conPho2Num.trim(),
        conPho2Typ: req.body.conPho2Typ.trim(),
        conPho3Num: req.body.conPho3Num.trim(),
        conPho3Typ: req.body.conPho3Typ.trim(),
        conPho4Num: req.body.conPho4Num.trim(),
        conPho4Typ: req.body.conPho4Typ.trim(),
        conNotes: req.body.conNotes.trim(),
      });
    } else {
      thisSubDoc.conGuid = strTgs.uCleanUp(thisSubDoc.conGuid, req.body.id + req.body.conName);
      thisSubDoc.conType = strTgs.uCleanUp(thisSubDoc.conType, req.body.conType);
      thisSubDoc.conName = strTgs.uCleanUp(thisSubDoc.conName, req.body.conName);
      thisSubDoc.address1 = strTgs.uCleanUp(thisSubDoc.address1, req.body.address1);
      thisSubDoc.address2 = strTgs.uCleanUp(thisSubDoc.address2, req.body.address2);
      thisSubDoc.address3 = strTgs.uCleanUp(thisSubDoc.address3, req.body.address3);
      thisSubDoc.address4 = strTgs.uCleanUp(thisSubDoc.address4, req.body.address4);
      thisSubDoc.city = strTgs.uCleanUp(thisSubDoc.city, req.body.city);
      thisSubDoc.state = strTgs.uCleanUp(thisSubDoc.state, req.body.state);
      thisSubDoc.country = strTgs.uCleanUp(thisSubDoc.country, req.body.country);
      thisSubDoc.zip = strTgs.uCleanUp(thisSubDoc.zip, req.body.zip);
      thisSubDoc.lat = strTgs.uCleanUp(thisSubDoc.lat, req.body.lat);
      thisSubDoc.lon = strTgs.uCleanUp(thisSubDoc.lon, req.body.lon);
      thisSubDoc.conEmail = strTgs.uCleanUp(thisSubDoc.conEmail, req.body.conEmail);
      thisSubDoc.conURL = strTgs.uCleanUp(thisSubDoc.conURL, req.body.conURL);
      thisSubDoc.conPho1Num = strTgs.uCleanUp(thisSubDoc.conPho1Num, req.body.conPho1Num);
      thisSubDoc.conPho1Typ = strTgs.uCleanUp(thisSubDoc.conPho1Typ, req.body.conPho1Typ);
      thisSubDoc.conPho2Num = strTgs.uCleanUp(thisSubDoc.conPho2Num, req.body.conPho2Num);
      thisSubDoc.conPho2Typ = strTgs.uCleanUp(thisSubDoc.conPho2Typ, req.body.conPho2Typ);
      thisSubDoc.conPho3Num = strTgs.uCleanUp(thisSubDoc.conPho3Num, req.body.conPho3Num);
      thisSubDoc.conPho3Typ = strTgs.uCleanUp(thisSubDoc.conPho3Typ, req.body.conPho3Typ);
      thisSubDoc.conPho4Num = strTgs.uCleanUp(thisSubDoc.conPho4Num, req.body.conPho4Num);
      thisSubDoc.conPho4Typ = strTgs.uCleanUp(thisSubDoc.conPho4Typ, req.body.conPho4Typ);
      thisSubDoc.conNotes = strTgs.uCleanUp(thisSubDoc.conNotes, req.body.conNotes);
    }
    datacenter.save((err) => {
      if (err) {
        console.error(err.stack);
        req.session.flash = {
          type: 'danger',
          intro: 'Ooops!',
          message: 'There was an error processing your request.',
        };
        return res.redirect(303, `location/datacenter/${res.abbreviation}`);
      }
      req.session.flash = {
        type: 'success',
        intro: 'Thank you!',
        message: 'Your update has been made.',
      };
      return res.redirect(303, `/location/datacenter/${res.abbreviation}`);
    });
  });
};
// datacenter delete
module.exports.datacenterDelete = (req, res) => {
  if (accConfig.accessCheck(req.user).root !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else  {
    res.abbreviation = req.body.id;
    if (req.body.id) {
  // logger.info('delete got this far');
      Datacenter.findOne({_id: req.body.id}, (err, datacentertodelete) => {
        if (err) {
      // logger.info(err);
      // return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        } else {
          datacentertodelete.remove((err) => {
            if (err) {
              logger.info(err);
              req.session.flash = {
                type: 'danger',
                intro: 'Ooops!',
                message: `Something went wrong, ${req.body.subName} was not deleted.`,
              };
              return res.redirect(303, `/location/datacenter/${res.abbreviation}`);
            } else {
              req.session.flash = {
                type: 'success',
                intro: 'Done!',
                message: 'Datacenter ' + req.body.rackUnique + ' has been deleted. Good luck with that one',
              };
              return res.redirect(303, '/location/datacenter/list');
            }
          });
        }
      });
    }
  }
};
// ------------------------------------------------------
// -------------------- Datacenter Cage Edit ------------
// ------------------------------------------------------

module.exports.datacenterCagePages = (req, res, next) => {
// logger.info('***********datacenterCagePages First ' +req.params.datacenter);
// logger.info('exports.datacenterCagePages');
  var start = req.params.datacenter.indexOf('-');
  var searchId = req.params.datacenter.substring(start + 1);
  // logger.info('edit called ' + searchId);
  //  logger.info(obj_dccage);
  var query = Datacenter.findOne({_id: searchId});
  query.exec((err, datacenter) => {
    if (err) return next(err);
    // logger.info("datacenter :" + datacenter);
    // logger.info('1 v19 ');
    if (!datacenter) return next();
    // logger.info("2 ");
    var dc = datacenter;
    // logger.info ('dc>'+dc);
    var context = {
      access: accConfig.accessCheck(req.user),
      user: req.user,
      requrl: req.url,
      menu1: dc.abbreviation,
      menuLink1: `/location/datacenter/${dc.abbreviation}`,
      titleNow: dc.abbreviation,
      id: dc._id,
      fullName: dc.fullName,
      abbreviation: dc.abbreviation,
      createdOn: strTgs.dateMod(dc.createdOn),
      foundingCompany: dc.foundingCompany,
      cages: dc.cages.map((cg) => {
        // var cg = cage;
        return {
          id: cg._id,
          titleNow: cg.cageAbbreviation,
          cageNickname: cg.cageNickname,
          cageAbbreviation: cg.cageAbbreviation,
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
// ------------------------------------------------------
// -------------------- Datacenter Cage Post ------------
// ------------------------------------------------------

module.exports.datacenterCagePost = (req, res) => {
  // this makes the abbreviation available for the URL
  res.abbreviation = req.body.abbreviation;
  // logger.info('@ id '+ req.body.id);
  var i = 1;
  // having the [i]index at the end of the form field collects it properly
  Datacenter.findById(req.body.id, 'cages modifiedOn', (err, datacenter) => {
    if (err) {
      logger.info(err);
      return res.redirect(303, `/location/datacenter/${res.abbreviation}`);
      } else if (!req.body.cageName) {
      // logger.info('no cageName');
        req.session.flash = {
          type: 'danger',
          intro: 'Ooops!',
          message: 'You can not submit blank forms.',
        };
        return res.redirect(303, `/location/datacenter/${res.abbreviation}`);
      } else {
      // using index returned from handlebars and count to get loop count
        for (var i = 0; i < req.body.index.length; i++) {
          var checkVar = req.body.cageName[i];
          // logger.info ('cageName> '+checkVar);
          // this is for empty +1
          if (!checkVar) {
          // logger.info('no content cage');
          // this is for more than one new cage
          } else if (req.body.cageId[i] === 'new') {
        // logger.info ('picked new cage');
        // this section for empty cage page
            datacenter.cages.push({
              cageNickname: strTgs.uTrim(req.body.cageNickname[i]),
              cageAbbreviation: strTgs.cTrim(req.body.cageAbbreviation[i]),
              cageName: strTgs.uTrim(req.body.cageName[i]),
              cageInMeters: strTgs.uTrim(req.body.cageInMeters[i]),
              cageWattPSM: strTgs.uTrim(req.body.cageWattPSM[i]),
              cageMap: strTgs.sTrim(req.body.cageMap[i]),
              cageNotes: strTgs.uTrim(req.body.cageNotes[i]),
            });
            // this is for existing cages    strTgs.uCleanUp(thisSubDoc.conType,req.body.conType);
          } else {
          //  logger.info('existing cage');
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
    datacenter.save((err) => {
      if (err) {
        console.error(err.stack);
        req.session.flash = {
          type: 'danger',
          intro: 'Ooops!',
          message: 'There was an error processing your request.',
        };
        return res.redirect(303, `/location/datacenter/${res.abbreviation}`);
      }
      req.session.flash = {
        type: 'success',
        intro: 'Thank you!',
        message: 'Your update has been made.',
      };
      return res.redirect(303, `/location/datacenter/${res.abbreviation}`);
    });
  });
};

// ------------------------------------------------------
// -------------------- Datacenter Power Edit -----------
// ------------------------------------------------------
module.exports.datacenterPowerPages = (req, res, next) => {
  // logger.info('***********datacenterCagePages First ' +req.params.datacenter);
  // logger.info('exports.datacenterPowerPages');
  var start = req.params.datacenter.indexOf('-');
  var searchId = req.params.datacenter.substring(start + 1);
  //    logger.info('edit called ' + searchId);
  //  logger.info(obj_dccage);
  var query = Datacenter.findOne({_id: searchId});
  query.exec((err, datacenter) => {
    if (err) return next(err);
    // logger.info("datacenter :" + datacenter);
    // logger.info('Power v19 ');
    if (!datacenter) return next();
    // logger.info("2 ");
    var dc = datacenter;
    // logger.info ('dc   >'+dc);
    var context = {
      access: accConfig.accessCheck(req.user),
      user: req.user,
      requrl: req.url,
      menu1: dc.abbreviation,
      menuLink1: `/location/datacenter/${dc.abbreviation}`,
      titleNow: dc.abbreviation,
      id: dc._id,
      fullName: dc.fullName,
      abbreviation: dc.abbreviation,
      createdOn: strTgs.dateMod(dc.createdOn),
      foundingCompany: dc.foundingCompany,
      powerNames: dc.powerNames,
    };
    res.render('location/datacenterpower', context);
  });
};

module.exports.datacenterPowerPost = (req, res) => {
 // this makes the abbreviation available for the URL
  res.abbreviation = req.body.abbreviation;
 // logger.info('PowerPost id '+ req.body.id);
  var i = 1;
  // having the [i]index at the end of the form field collects it properly
  Datacenter.findById(req.body.id, 'power modifiedOn', (err, datacenter) => {
  var thisDoc = datacenter;
  // logger.info('id>'+thisDoc);
    if (err) {
      logger.info(err);
      res.redirect('location/datacenter/' + res.abbreviation);
    } else {
      thisDoc.powerNames = strTgs.uCleanUp(thisDoc.powerNames, req.body.powerNames).split(','); // split makes this an array
      thisDoc.modifiedOn = Date.now();
      thisDoc.modifiedBy = req.user.local.email;
    }
    datacenter.save((err) => {
      if (err) {
        console.error(err.stack);
        req.session.flash = {
          type: 'danger',
          intro: 'Ooops!',
          message: 'There was an error processing your request.',
        };
        return res.redirect(303, `location/datacenter/${res.abbreviation}`);
      }
      req.session.flash = {
        type: 'success',
        intro: 'Thank you!',
        message: 'Your update has been made.',
      };
      return res.redirect(303, `/location/datacenter/${res.abbreviation}`);
    });
  });
};

// NETWORK //////////////////////////////////////////////////////

module.exports.datacenterNetworkPages = (req, res, next) => {
  // /location/network/{{id}}-new
  // /location/network/{{../id}}-{{dcNetId}}
  // /location/network/{{../id}}-{{dcNetId}}~copy
  Optionsdb.find({}, 'optListKey optListArray', (err, opt) => {
    if (err) return next(err);
    var copy;
    // logger.info('exports.datacenterNetworkPages');
    var dcInfo = req.params.datacenter;
    if (dcInfo) {
      var dcSplit = dcInfo.indexOf('-');
      var dcId = dcInfo.substring(0, dcSplit);
      var dcSubId = dcInfo.substring(dcSplit + 1);
      if (dcSubId.indexOf('copy') !=-1) {
        dcSubId = dcSubId.substring(0, dcSubId.indexOf('~'));
        copy = true;
        // logger.info('copy >'+dcSubId);
      }
      Datacenter.findById(dcId, (err, datacenter) => {
      var dc = datacenter;
      var context;
      var nk;
        if (dcSubId === 'new') {
          context = {
            access: accConfig.accessCheck(req.user),
            user: req.user,
            requrl: req.url,
            id: dc._id,
            titleNow: dc.abbreviation,
            fullName: dc.fullName,
            abbreviation: dc.abbreviation,
            createdOn: strTgs.dateMod(dc.createdOn),
            foundingCompany: dc.foundingCompany,
            optMask: strTgs.findThisInThatMulti('optMask', opt, 'optListKey'),
          };
          res.render('location/networkedit', context);
        } else if (copy === true) { // copy
          nk = dc.networks.id(dcSubId);
          context = {
            access: accConfig.accessCheck(req.user),
            user: req.user,
            requrl: req.url,
            id: dc._id,
            titleNow: dc.abbreviation,
            fullName: dc.fullName,
            abbreviation: dc.abbreviation,
            createdOn: strTgs.dateMod(dc.createdOn),
            foundingCompany: dc.foundingCompany,
            dcNetType: nk.dcNetType,
            dcNetDesc: nk.dcNetDesc,
            dcNetDomain: nk.dcNetDomain,
            dcNetDns1: nk.dcNetDns1,
            dcNetDns2: nk.dcNetDns2,
            dcNetNTP1: nk.dcNetNTP1,
            dcNetNTP2: nk.dcNetNTP2,
            dcNetLdap1: nk.dcNetLdap1,
            dcNetLdap2: nk.dcNetLdap2,
            dcNetLdapString: nk.dcNetLdapString,
            dcNetTftpHost: nk.dcNetTftpHost,
            dcNetACSFilePath: nk.dcNetACSFilePath,
            optMask: strTgs.findThisInThatMulti('optMask', opt, 'optListKey'),
          };
          res.render('location/networkedit', context);
        } else { // edit
          nk = dc.networks.id(dcSubId);
          context = {
            access: accConfig.accessCheck(req.user),
            user: req.user,
            requrl: req.url,
            id: dc._id,
            titleNow: dc.abbreviation,
            fullName: dc.fullName,
            abbreviation: dc.abbreviation,
            createdOn: strTgs.dateMod(dc.createdOn),
            foundingCompany: dc.foundingCompany,
            dcNetId: nk._id,
            dcNetUnique: nk.dcNetUnique,
            dcNetType: nk.dcNetType,
            dcNetNetwork: nk.dcNetNetwork,
            dcNetMask: nk.dcNetMask,
            dcNetVlan: nk.dcNetVlan,
            dcNetDesc: nk.dcNetDesc,
            dcNetGateway: nk.dcNetGateway,
            dcNetDomain: nk.dcNetDomain,
            dcNetDns1: nk.dcNetDns1,
            dcNetDns2: nk.dcNetDns2,
            dcNetNTP1: nk.dcNetNTP1,
            dcNetNTP2: nk.dcNetNTP2,
            dcNetLdap1: nk.dcNetLdap1,
            dcNetLdap2: nk.dcNetLdap2,
            dcNetLdapString: nk.dcNetLdapString,
            dcNetTftpHost: nk.dcNetTftpHost,
            dcNetACSFilePath: nk.dcNetACSFilePath,
            optMask: strTgs.findThisInThatMulti('optMask', opt, 'optListKey'),
          };
          res.render('location/networkedit', context);
        }
      });
    }
  });
};

module.exports.datacenterNetworkPost = (req, res, next) => {
  // logger.info('exports.datacenterNetworkPost');
  var data = req.body;
  res.abbreviation = data.abbreviation;
  var dcNetUnique = `${data.abbreviation}-${strTgs.multiTrim(data.dcNetNetwork, 9, 2)}/${strTgs.multiTrim(data.dcNetMask, 9, 2)}`;
  // logger.info('id>'+data.id);
  // logger.info('abbreviation>'+data.abbreviation);
  // logger.info('dcNetId       >'+data.dcNetId);
  Datacenter.findById(data.id, 'networks modifiedOn', (err, datacenter) => {
    if (err) {
      // logger.info(err);
      res.redirect(`location/datacenter/${res.abbreviation}`);
    } else if (!data.dcNetId) {
      //   logger.info(datacenter);
      // logger.info('New network '+data.dcNetNetwork+'/'+data.dcNetMask);
      datacenter.networks.push({
        dcNetUnique: dcNetUnique,
        dcNetType: strTgs.clTrim(data.dcNetType),
        dcNetNetwork: strTgs.clTrim(data.dcNetNetwork),
        dcNetMask: strTgs.clTrim(data.dcNetMask),
        dcNetVlan: strTgs.clTrim(data.dcNetVlan),
        dcNetDesc: strTgs.clTrim(data.dcNetDesc),
        dcNetGateway: strTgs.clTrim(data.dcNetGateway),
        dcNetDomain: strTgs.clTrim(data.dcNetDomain),
        dcNetDns1: strTgs.clTrim(data.dcNetDns1),
        dcNetDns2: strTgs.clTrim(data.dcNetDns2),
        dcNetNTP1: strTgs.clTrim(data.dcNetNTP1),
        dcNetNTP2: strTgs.clTrim(data.dcNetNTP2),
        dcNetLdap1: strTgs.clTrim(data.dcNetLdap1),
        dcNetLdap2: strTgs.clTrim(data.dcNetLdap2),
        dcNetLdapString: strTgs.clTrim(data.dcNetLdapString),
        dcNetTftpHost: strTgs.clTrim(data.dcNetTftpHost),
        dcNetACSFilePath: strTgs.uTrim(data.dcNetACSFilePath),
        createdBy: req.user.local.email,
        createdOn: Date.now(),
        modifiedBy: req.user.local.email,
        modifiedOn: Date.now(),
      });
    } else {
      var thisSubDoc = datacenter.networks.id(data.dcNetId);
      thisSubDoc.dcNetUnique = dcNetUnique;
      thisSubDoc.dcNetType = strTgs.clCleanUp(thisSubDoc.dcNetType, data.dcNetType);
      thisSubDoc.dcNetNetwork = strTgs.clCleanUp(thisSubDoc.dcNetNetwork, data.dcNetNetwork);
      thisSubDoc.dcNetMask = strTgs.clCleanUp(thisSubDoc.dcNetMask, data.dcNetMask);
      thisSubDoc.dcNetVlan = strTgs.clCleanUp(thisSubDoc.dcNetVlan, data.dcNetVlan);
      thisSubDoc.dcNetDesc = strTgs.clCleanUp(thisSubDoc.dcNetDesc, data.dcNetDesc);
      thisSubDoc.dcNetGateway = strTgs.clCleanUp(thisSubDoc.dcNetGateway, data.dcNetGateway);
      thisSubDoc.dcNetDomain = strTgs.clCleanUp(thisSubDoc.dcNetDomain, data.dcNetDomain);
      thisSubDoc.dcNetDns1 = strTgs.clCleanUp(thisSubDoc.dcNetDns1, data.dcNetDns1);
      thisSubDoc.dcNetDns2 = strTgs.clCleanUp(thisSubDoc.dcNetDns2, data.dcNetDns2);
      thisSubDoc.dcNetNTP1 = strTgs.clCleanUp(thisSubDoc.dcNetNTP1, data.dcNetNTP1);
      thisSubDoc.dcNetNTP2 = strTgs.clCleanUp(thisSubDoc.dcNetNTP2, data.dcNetNTP2);
      thisSubDoc.dcNetLdap1 = strTgs.clCleanUp(thisSubDoc.dcNetLdap1, data.dcNetLdap1);
      thisSubDoc.dcNetLdap2 = strTgs.clCleanUp(thisSubDoc.dcNetLdap2, data.dcNetLdap2);
      thisSubDoc.dcNetLdapString = strTgs.clCleanUp(thisSubDoc.dcNetLdapString, data.dcNetLdapString);
      thisSubDoc.dcNetTftpHost = strTgs.clCleanUp(thisSubDoc.dcNetTftpHost, data.dcNetTftpHost);
      thisSubDoc.dcNetACSFilePath = strTgs.uCleanUp(thisSubDoc.dcNetACSFilePath, data.dcNetACSFilePath);
      thisSubDoc.modifiedOn = Date.now();
      thisSubDoc.modifiedBy = req.user.local.email;
    }
    datacenter.save((err) => {
      if (err) {
        console.error(err.stack);
        req.session.flash = {
          type: 'danger',
          intro: 'Ooops!',
          message: 'There was an error processing your request.',
        };
        return res.redirect(303, `location/datacenter/${res.abbreviation}`);
      }
      req.session.flash = {
        type: 'success',
        intro: 'Thank you!',
        message: 'Your update has been made.',
      };
      return res.redirect(303, `/location/datacenter/${res.abbreviation}`);
    });
  });
};

// contact and cage Delete

module.exports.datacenterSubDelete = (req, res) => {
  res.abbreviation = req.body.abbreviation;
  if (req.body.id && req.body.subId){
    Datacenter.findById(req.body.id, req.body.subDoc, (err, datacenter) => {
      //    logger.info('first : '+datacenter);
      if (err) {
        logger.info(err);
        // return res.redirect(303 '/location/datacenter/'+res.abbreviation);
      } else {
        if (req.body.collectionSub === 'contact') {
          datacenter.contacts.id(req.body.subId).remove();
          // logger.info('delete: '+req.body.subId+' - '+req.body.subName);
        } else if (req.body.collectionSub === 'cages') { // (req.body.collectionSub === "cages")
          datacenter.cages.id(req.body.subId).remove();
          // logger.info('delete: '+req.body.subId+' - '+req.body.subName);
        } else if (req.body.collectionSub === 'network') { // (req.body.collectionSub === "network")
          datacenter.networks.id(req.body.subId).remove();
          // logger.info('delete: '+req.body.subId+' - '+req.body.subName);
        }
        datacenter.save((err) => {
          if (err) {
            logger.info(err);
            req.session.flash = {
              type: 'danger',
              intro: 'Ooops!',
              message: `Something went wrong, ${req.body.subName} was not deleted.`,
            };
            return res.redirect(303, `/location/datacenter/${res.abbreviation}`);
          }
          req.session.flash = {
            type: 'success',
            intro: 'Done!',
            message: req.body.subName + ' has been deleted.',
          };
          return res.redirect(303, `/location/datacenter/${res.abbreviation}`);
        });
      }
    });
  }
};
