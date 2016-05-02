const logger = require('../lib/logger.js');
const accConfig = require('../config/access');
const strTgs = require('../lib/stringThings.js');
const ObjectId = require('mongoose').Types.ObjectId;

// Models
const Models = require('../models');

// ---------------------------------------------------------------------
// ----------------------   Rack List  ---------------------------------
// ---------------------------------------------------------------------

// app.get('/location/rack', handlers.rack.dcRackAll);
module.exports.dcRackAll = (req, res, next) => {
  var context;
  var uber;
  Models.Rack.find({}).sort('rackUnique').exec((err, racks) => {
    if (err) {
      logger.info(err);
    } else {
      Models.Datacenter.find({}, '_id fullName abbreviation foundingCompany cages._id cages.cageNickname cages.cageAbbreviation cages.cageName', (err, datacenter) => {
        if (err) return next(err);
        context = {
          racks: racks.map((rack) => {
            uber = strTgs.findCGParent(rack.rackParentCage, datacenter);
            // rack.populate('rackParentDC', 'abbreviation cageNickname')
            // logger.info(rack);
            if (uber) {
              return {
                menu1: 'Datacenters',
                menuLink1: '/location/datacenter/list',
                titleNow: 'Rack List',
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
                rackRow: rack.rackRow,
                rackStatus: strTgs.trueFalseIcon(rack.rackStatus, rack.rackStatus),
                rackMake: rack.rackMake,
                rackModel: rack.rackModel,
                rUs: rack.rUs,
                createdBy: rack.createdBy,
                createdOn: strTgs.dateMod(rack.createdOn),
                modifiedOn: strTgs.dateMod(rack.modifiedOn),
              };
            }
            return {
              menu1: 'Datacenters',
              menuLink1: '/location/datacenter/list',
              titleNow: 'Rack List',
              abbreviation: 'Unknown',
              rackParentDC: rack.rackParentDC,
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
              rackRow: rack.rackRow,
              rackStatus: strTgs.trueFalseIcon(rack.rackStatus, rack.rackStatus),
              rackMake: rack.rackMake,
              rackModel: rack.rackModel,
              rUs: rack.rUs,
              createdBy: rack.createdBy,
              createdOn: strTgs.dateMod(rack.createdOn),
              modifiedOn: strTgs.dateMod(rack.modifiedOn),
            };
          }),
        };
        // the 'location/datacenter-list' is the view that will be called
        // context is the data from above
        res.render('location/rack-list', context);
      });
    }
  });
};


// ----------------------------------------------------------------------
// ---------------------  Create New Rack   -------------------------------
// ------------------------------------------------------------------------
// link to this looks
//  /location/rack/newrack~{{dcId}}-{{cageId}}
//  /location/rack/newrack~5459a1b4310bed5b0c039b7a-5459a1b4310bed5b0c039b7b
//  ------------------------------------------------------------------------

// app.get('/location/rack/new', handlers.rack.dcRackNew);
module.exports.dcRackNew = (req, res, next) => {
  var dcId = req.query.dcId;
  var dcCageId = req.query.dcCageId;
  var dc;
  var context;
  var thisSubDoc;
  Models.Datacenter.findById(dcId, (err, datacenter) => {
    if (err) return next(err);
    Models.Optionsdb.findOne({ optListKey: 'optRackStatus' }, (err, opt) => {
      if (err) return next(err);
      // logger.info(opt);
      if (!datacenter) {
        // logger.info('Rack !datacenter');
      } else {
        // logger.info('Rack is datacenter');
        thisSubDoc = datacenter.cages.id(dcCageId);
        if (err) return next(err);
        // logger.info('datacener= '+datacenter);
        context = {
          access: accConfig.accessCheck(req.user),
          requrl: req.url,
          optRackStatus: opt.optListArray,
          id: datacenter._id,
          fullName: datacenter.fullName,
          abbreviation: datacenter.abbreviation,
          createdOn: strTgs.dateMod(datacenter.createdOn),
          foundingCompany: datacenter.foundingCompany,
          titleNow: 'New Rack',
          cageId: thisSubDoc.id,
          cageNickname: thisSubDoc.cageNickname,
          cageName: thisSubDoc.cageName,
          cageAbbreviation: thisSubDoc.cageAbbreviation,
        };
        // logger.info(context);
        res.render('location/rackedit', context);
      }
    });
  });
};

// -----------------------------------------------------------------------
// -------------------------Rack View ------------------------------------
// ------------------------------------------------------------------------

// app.get('/location/rack/:data', handlers.rack.dcRackView);
module.exports.dcRackView = (req, res, next) => {
  var rackUnique = req.params.data;
  var uber;
  var context;
  Models.Rack.findOne({ rackUnique: rackUnique }, (err, rack) => {
    if (err || !rack) return next(err);
    Models.Optionsdb.findOne({ optListKey: 'optRackStatus' }, (err, opt) => {
      if (err) return next(err);
      Models.Datacenter.findById(rack.rackParentDC, '_id fullName abbreviation foundingCompany cages._id cages.cageNickname cages.cageAbbreviation cages.cageName', (err, datacenter) => {
        if (err) return next(err);
        uber = strTgs.findCGParent(rack.rackParentCage, datacenter);
        if (uber) {
          context = {
            access: accConfig.accessCheck(req.user),
            requrl: req.url,
            optRackStatus: opt.optListArray,
            titleNow: rack.rackUnique,
            menu1: uber.abbreviation,
            menuLink1: `/location/datacenter/${uber.abbreviation}`,
            menu2: 'Details',
            menuLink2: `/equipment-systems/${rack.rackUnique}`,
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
            rackRow: rack.rackRow,
            rackStatus: rack.rackStatus,
            rackNotes: rack.rackNotes,
            createdBy: rack.createdBy,
            createdOn: strTgs.dateMod(rack.createdOn),
            modifiedBy: rack.modifiedBy,
            modifiedOn: strTgs.dateMod(rack.modifiedOn),
            powers: rack.powers.map((rp) => {
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
            access: accConfig.accessCheck(req.user),
            requrl: req.url,
            optRackStatus: opt.optListArray,
            titleNow: rack.rackUnique,
            menu2: 'Elevation',
            menuLink2: `/elevation/${rack.rackUnique}`,
            menu3: 'Details',
            menuLink3: `/equipment-systems/${rack.rackUnique}`,
            rackParentDC: rack.rackParentDC,
            abbreviation: 'unknown',
            rackParentCage: rack.rackParentCage,
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
            rackRow: rack.rackRow,
            rackStatus: rack.rackStatus,
            rackNotes: rack.rackNotes,
            createdBy: rack.createdBy,
            createdOn: strTgs.dateMod(rack.createdOn),
            modifiedBy: rack.modifiedBy,
            modifiedOn: strTgs.dateMod(rack.modifiedOn),
            powers: rack.powers.map((rp) => {
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
        }
        res.render('location/rack', context);
      });
    });
  });
};

// -----------------------------------------------------------------------
// -------------------------Rack Copy ------------------------------------
// ------------------------------------------------------------------------

// app.get('/location/rack/:data/copy', handlers.rack.dcRackCopy);
module.exports.dcRackCopy = (req, res, next) => {
  var backURL = req.header('Referer') || '/';
  var rackUnique = req.params.data;
  var uber;
  var context;
  Models.Rack.findOne({ rackUnique: rackUnique }, (err, rack) => {
    if (err || !rack) return next(err);
    Models.Optionsdb.findOne({ optListKey: 'optRackStatus' }, (err, opt) => {
      if (err) return next(err);
      Models.Datacenter.findById(rack.rackParentDC, '_id fullName abbreviation foundingCompany cages._id cages.cageNickname cages.cageAbbreviation cages.cageName', (err, datacenter) => {
        if (err) return next(err);
        uber = strTgs.findCGParent(rack.rackParentCage, datacenter);
        if (!uber) {
          req.session.flash = strTgs.errMsg(`Can't copy racks that are not in a Data Center`);
          res.redirect(backURL);
        } else {
          context = {
            access: accConfig.accessCheck(req.user),
            requrl: req.url,
            titleNow: `Copy ${rack.rackUnique}`,
            optRackStatus: opt.optListArray,
            wasCopy: rack.rackUnique,
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
          res.render('location/rackedit', context);
        }
      });
    });
  });
};

// -----------------------------------------------------------------------
// -------------------------Rack Edit ------------------------------------
// -----------------------------------------------------------------------

// app.get('/location/rack/:data/edit', handlers.rack.dcRackPages);
module.exports.dcRackEdit = (req, res, next) => {
  var rackUnique = req.params.data;
  var uber;
  var context;
  Models.Rack.findOne({ rackUnique: rackUnique }, (err, rack) => {
    if (err || !rack) return next(err);
    Models.Optionsdb.findOne({ optListKey: 'optRackStatus' }, (err, opt) => {
      if (err) return next(err);
      Models.Datacenter.findById(rack.rackParentDC, '_id fullName abbreviation foundingCompany cages._id cages.cageNickname cages.cageAbbreviation cages.cageName', (err, datacenter) => {
        if (err) return next(err);
        uber = strTgs.findCGParent(rack.rackParentCage, datacenter);
        if (uber) {
          context = {
            access: accConfig.accessCheck(req.user),
            requrl: req.url,
            optRackStatus: opt.optListArray,
            titleNow: rack.rackUnique,
            menu1: uber.abbreviation,
            menuLink1: `/location/datacenter/${uber.abbreviation}`,
            menu2: 'Elevation',
            menuLink2: `/elevation/${rack.rackUnique}`,
            menu3: 'Details',
            menuLink3: `/equipment-systems/${rack.rackUnique}`,
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
            rackRow: rack.rackRow,
            rackStatus: rack.rackStatus,
            rackNotes: rack.rackNotes,
            createdBy: rack.createdBy,
            createdOn: strTgs.dateMod(rack.createdOn),
            modifiedBy: rack.modifiedBy,
            modifiedOn: strTgs.dateMod(rack.modifiedOn),
            powers: rack.powers.map((rp) => {
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
            access: accConfig.accessCheck(req.user),
            requrl: req.url,
            optRackStatus: opt.optListArray,
            titleNow: rack.rackUnique,
            menu2: 'Elevation',
            menuLink2: `/elevation/${rack.rackUnique}`,
            menu3: 'Details',
            menuLink3: `/equipment-systems/${rack.rackUnique}`,
            rackParentDC: rack.rackParentDC,
            abbreviation: 'unknown',
            rackParentCage: rack.rackParentCage,
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
            rackRow: rack.rackRow,
            rackStatus: rack.rackStatus,
            rackNotes: rack.rackNotes,
            createdBy: rack.createdBy,
            createdOn: strTgs.dateMod(rack.createdOn),
            modifiedBy: rack.modifiedBy,
            modifiedOn: strTgs.dateMod(rack.modifiedOn),
            powers: rack.powers.map((rp) => {
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
        }
        res.render('location/rackedit', context);
      });
    });
  });
};

// --------------------------------------------------------------------
// ----------------------- Rack Power List  ---------------------------
// --------------------------------------------------------------------
// For future, basically report all power in a DC on the DC home page
// app.get('/location/rackpower', handlers.rack.dcRackPowAll);
module.exports.dcRackPowAll = (req, res, next) => {
  var backURL = req.header('Referer') || '/';
  req.session.flash = strTgs.errMsg(`Sorry, this feature not yet implemented`);
  res.redirect(backURL);
};

// --------------------------------------------------------------------
// ----------------------- New Rack Power   --------------------
// --------------------------------------------------------------------
// Note: there is no Rack Power View
// because all of the information is in the parent Rack

// app.get('/location/rackpower/:data/new', handlers.rack.dcRackPowNew);
module.exports.dcRackPowNew = (req, res, next) => {
  var rackUnique = req.params.data;
  var uber;
  var context;
  Models.Rack.findOne({ rackUnique: rackUnique }, (err, rk) => {
    if (err) return next(err);
    Models.Optionsdb.findOne({ optListKey: 'optEquipStatus' }, (err, opt) => {
      if (err) return next(err);
      // logger.info(opt);
      Models.Datacenter.find({}, '_id fullName abbreviation foundingCompany powerNames cages._id cages.cageNickname cages.cageAbbreviation cages.cageName', (err, datacenter) => {
        if (err) return next(err);
        uber = strTgs.findCGParent(rk.rackParentCage, datacenter);
        context = {
          access: accConfig.accessCheck(req.user),
          requrl: req.url,
          menu1: uber.abbreviation,
          menuLink1: `/location/datacenter/${uber.abbreviation}`,
          menu2: 'Elevation',
          menuLink2: `/elevation/${rk.rackUnique}`,
          menu3: 'Details',
          menuLink3: `/equipment-systems/${rk.rackUnique}`,
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
        res.render('location/rackpoweredit', context);
      });
    });
  });
};

// app.get('/location/rackpower/:data/copy', handlers.rack.dcRackPowCopy);
module.exports.dcRackPowCopy = (req, res, next) => {
  var rackUnique = req.params.data;
  var powerUnique = req.query.powerUnique;
  var uber;
  var context;
  var thisSubDoc;
  Models.Rack.findOne({ rackUnique: rackUnique }, (err, rk) => {
    if (err) return next(err);
    Models.Optionsdb.findOne({ optListKey: 'optEquipStatus' }, (err, opt) => {
      if (err) return next(err);
      // logger.info(opt);
      Models.Datacenter.find({}, '_id fullName abbreviation foundingCompany powerNames cages._id cages.cageNickname cages.cageAbbreviation cages.cageName', (err, datacenter) => {
        if (err) return next(err);
        uber = strTgs.findCGParent(rk.rackParentCage, datacenter);
        thisSubDoc = rk.powers.id(powerUnique);
        if (err || !rk) return next(err);
        // logger.info(rk);
        context = {
          access: accConfig.accessCheck(req.user),
          requrl: req.url,
          titleNow: `Copy ${rk.rackUnique}`,
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
        // logger.info(context);
        res.render('location/rackpoweredit', context);
      });
    });
  });
};

// app.get('/location/rackpower/:data/edit', handlers.rack.dcRackPowEdit);
module.exports.dcRackPowEdit = (req, res, next) => {
  var rackUnique = req.params.data;
  var powerUnique = req.query.powerUnique;
  var uber;
  var context;
  var thisSubDoc;
  Models.Rack.findOne({ rackUnique: rackUnique }, (err, rk) => {
    if (err) return next(err);
    Models.Optionsdb.findOne({ optListKey: 'optEquipStatus' }, (err, opt) => {
      if (err) return next(err);
      // logger.info(opt);
      Models.Datacenter.find({}, '_id fullName abbreviation foundingCompany powerNames cages._id cages.cageNickname cages.cageAbbreviation cages.cageName', (err, datacenter) => {
        if (err) return next(err);
        uber = strTgs.findCGParent(rk.rackParentCage, datacenter);
        thisSubDoc = rk.powers.id(powerUnique);
        context = {
          access: accConfig.accessCheck(req.user),
          requrl: req.url,
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
        // logger.info(context);
        res.render('location/rackpoweredit', context);
      });
    });
  });
};

/* ---------------------------------------------------------------------
-----------------------   Rack  Post   ---------------------------------
------------------------------------------------------------------------
*/

exports.dcRackPost = (req, res) => {
  if (accConfig.accessCheck(req.user).edit !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  }
  // this makes the abbreviation available for the URL
  res.abbreviation = req.body.abbreviation;
  // logger.info('dcRackPost abbreviation>'+res.abbreviation);
  // logger.info('rUs >'+req.body.rUs);
  // logger.info('rUs expanded >'+ strTgs.compUs(req.body.rUs));
  // rackUnique is created when making a new rack so it does not exist on new
  // or copied racks
  res.lastRack = req.body.rackNickname;
  if (!req.body.rackUnique) {
    if (req.body.wasCopy) {
      res.abbreviation = req.body.wasCopy;
    }
    // logger.info('new rack in DC '+req.body.id);
    Models.Rack.create({
      rackParentDC: req.body.id,
      rackParentCage: req.body.cageId,
      rackNickname: strTgs.multiTrim(req.body.rackNickname, 9, 1),
      rackName: strTgs.multiTrim(req.body.rackName, 3, 0),
      rackUnique: (`${req.body.abbreviation}_${req.body.cageAbbreviation}_${strTgs.multiTrim(req.body.rackNickname, 2, 2)}`),
      rackDescription: strTgs.multiTrim(req.body.rackDescription, 6, 0),
      rackSN: strTgs.multiTrim(req.body.rackSN, 9, 1),
      rackHeight: strTgs.multiTrim(req.body.rackHeight, 8, 0),
      rackWidth: strTgs.multiTrim(req.body.rackWidth, 8, 0),
      rackDepth: strTgs.multiTrim(req.body.rackDepth, 8, 0),
      rackLat: strTgs.multiTrim(req.body.rackLat, 9, 1),
      rackLon: strTgs.multiTrim(req.body.rackLon, 9, 1),
      rackRow: strTgs.multiTrim(req.body.rackRow, 9, 1),
      rackStatus: req.body.rackStatus,
      rackMake: strTgs.multiTrim(req.body.rackMake, 5, 0),
      rackModel: strTgs.multiTrim(req.body.rackModel, 5, 0),
      rUs: strTgs.multiTrim(req.body.rUs, 8, 0),
      rackNotes: strTgs.multiTrim(req.body.rackNotes, 6, 0),
      createdOn: Date.now(),
      createdBy: req.user.local.email,

    }, (err) => {
      if (err) {
        console.error(err.stack);
        if (err.stack.indexOf('matching') != -1) {
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
          };
        }
        return res.redirect(303, '/location/rack');
      }
      if (!req.body.wasCopy) {
        req.session.flash = {
          type: 'success',
          intro: 'Thank you!',
          message: 'Your update has been made.',
        };
        return res.redirect(303, `/location/datacenter/${res.abbreviation}`);
      } else {
        req.session.flash = {
          type: 'success',
          intro: 'Thank you!',
          message: 'Rack ' + res.lastRack + ' has been created!',
        };
        return res.redirect(303, `/location/rack/${res.abbreviation}/copy`);

      }
    });

  } else {
    Models.Rack.findOne({ rackUnique: req.body.rackUnique }, (err, rack) => {
      res.abbreviation = req.body.rackUnique;
      var thisDoc = rack;
      // logger.info('existing id>'+thisDoc);
      if (err) {
        // logger.info(err);
        res.redirect(`location/datacenter/${res.abbreviation}`);
      } else {

        thisDoc.rackName = strTgs.multiTrim(req.body.rackName, 3, 0);
        thisDoc.rackDescription = strTgs.multiTrim(req.body.rackDescription, 6, 0);
        thisDoc.rackSN = strTgs.multiTrim(req.body.rackSN, 9, 1);
        thisDoc.rackHeight = strTgs.multiTrim(req.body.rackHeight, 8, 0);
        thisDoc.rackWidth = strTgs.multiTrim(req.body.rackWidth, 8, 0);
        thisDoc.rackDepth = strTgs.multiTrim(req.body.rackDepth, 8, 0);
        thisDoc.rackLat = strTgs.multiTrim(req.body.rackLat, 9, 1);
        thisDoc.rackLon = strTgs.multiTrim(req.body.rackLon, 9, 1);
        thisDoc.rackRow = strTgs.multiTrim(req.body.rackRow, 9, 1);
        thisDoc.rackStatus = req.body.rackStatus;
        thisDoc.rackMake = strTgs.multiTrim(req.body.rackMake, 5, 0);
        thisDoc.rackModel = strTgs.multiTrim(req.body.rackModel, 5, 0);
        thisDoc.rackNotes = strTgs.multiTrim(req.body.rackNotes, 6, 0);
        thisDoc.rUs = strTgs.multiTrim(req.body.rUs, 8, 0);
        thisDoc.modifiedOn = Date.now();
        thisDoc.modifiedBy = req.user.local.email;
      }
      rack.save((err) => {
        if (err) {
          console.error(err.stack);
          req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: 'There was an error processing your request.',
          };
          return res.redirect(303, `location/rack/${res.abbreviation}`);
        }
        req.session.flash = {
          type: 'success',
          intro: 'Thank you!',
          message: 'Your update has been made.',
        };
        return res.redirect(303, `/location/rack/${res.abbreviation}`);
      });
    });
  }
};

/*---------------------------------------------------------------------
---------------------------- Rack Delete ------------------------------
------------------------------------------------------------------------
*/
exports.rackDelete = (req, res) => {
  if (accConfig.accessCheck(req.user).delete !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
    res.abbreviation = req.body.abbreviation;
    res.rackUnique = req.body.rackUnique;
    if (req.body.rackUnique) {
      // logger.info('delete got this far');
      Models.Rack.findOne({ rackUnique: req.body.rackUnique }, (err, racktodelete) => {
        if (err) {
          // logger.info(err);
          //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        } else {
          racktodelete.remove((err) => {
            if (err) {
              logger.info(err);
              req.session.flash = {
                type: 'danger',
                intro: 'Ooops!',
                message: `Something went wrong, ${req.body.subName} was not deleted.`,
              };
              return res.redirect(303, `/location/rack/${res.rackUnique}`);
            } else {
              req.session.flash = {
                type: 'success',
                intro: 'Done!',
                message: `Contact ${req.body.rackUnique} has been deleted. Good luck with that one`,
              };
              return res.redirect(303, `/location/datacenter/${res.abbreviation}`);
            }
          });
        }
      });
    }
  }
};
/* ---------------------------------------------------------------------
------------------------   Rack Power Post   ---------------------------
------------------------------------------------------------------------
*/

exports.dcRackPowPost = (req, res) => {
  var thisSubDoc;
  if (accConfig.accessCheck(req.user).edit !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  }
  Models.Rack.findOne({ rackUnique: req.body.rackUnique }, (err, rk) => {
    res.abbreviation = req.body.rackUnique;
    // logger.info('Rack Power findOne '+rk);
    // logger.info('dcRackPowPost abbreviation>'+res.abbreviation);
    if (req.body.rackPowUnique === 'new') {
      thisSubDoc = 'new';
    } else {
      thisSubDoc = rk.powers.id(req.body.rackPowId);
    }
    // logger.info('existing id>'+thisSubDoc);
    if (err) {
      logger.info(err);
      res.redirect(`location/rack/${res.abbreviation}`);
    } else if (thisSubDoc === 'new') {
      rk.powers.push({
        rackPowMain: req.body.rackPowMain,
        rackPowCircuit: strTgs.multiTrim(req.body.rackPowCircuit, 2, 2),
        rackPowUnique: `${req.body.abbreviation}_${req.body.rackPowMain}_${strTgs.multiTrim(req.body.rackPowCircuit, 2, 2)}`,
        rackPowStatus: req.body.rackPowStatus,
        rackPowVolts: strTgs.multiTrim(req.body.rackPowVolts, 8, 0),
        rackPowPhase: strTgs.multiTrim(req.body.rackPowPhase, 8, 0),
        rackPowAmps: strTgs.multiTrim(req.body.rackPowAmps, 8, 0),
        rackPowReceptacle: strTgs.multiTrim(req.body.rackPowReceptacle, 9, 1),
        rackPowCreatedBy: req.user.local.email,
        rackPowCreatedOn: modifiedOn = Date.now(),
        rackPowModifiedby: req.user.local.email,
        rackPowModifiedOn: modifiedOn = Date.now(),
      });
    } else {
      thisSubDoc.rackPowStatus = req.body.rackPowStatus;
      thisSubDoc.rackPowVolts = strTgs.multiTrim(req.body.rackPowVolts, 8, 0);
      thisSubDoc.rackPowPhase = strTgs.multiTrim(req.body.rackPowPhase, 8, 0);
      thisSubDoc.rackPowAmps = strTgs.multiTrim(req.body.rackPowAmps, 8, 0);
      thisSubDoc.rackPowReceptacle = strTgs.multiTrim(req.body.rackPowReceptacle, 9, 1);
      thisSubDoc.modifiedOn = Date.now();
      thisSubDoc.modifiedBy = req.user.local.email;
    }
    rk.save((err) => {
      if (err) {
        console.error(err.stack);
        req.session.flash = {
          type: 'danger',
          intro: 'Ooops!',
          message: 'There was an error processing your request.',
        };
        return res.redirect(303, `location/rack/${res.abbreviation}`);
      }
      req.session.flash = {
        type: 'success',
        intro: 'Thank you!',
        message: 'Your update has been made.',
      };
      return res.redirect(303, `/location/rack/${res.abbreviation}`);
    });
  });
};
/* ---------------------------------------------------------------------
-------------------    rackPow Delete   --------------------------------
------------------------------------------------------------------------
*/

exports.rackSubDelete = (req, res) => {
  if (accConfig.accessCheck(req.user).delete !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
    res.abbreviation = req.body.abbreviation;
    if (req.body.id && req.body.subId) {
      Models.Rack.findById(req.body.id, req.body.subDoc, (err, rk) => {
        if (err) {
          logger.info(err);
          //return res.redirect(303 '/location/datacenter/'+res.abbreviation);
        } else {
          rk.powers.id(req.body.subId).remove();
          rk.save((err) => {
            if (err) {
              logger.info(err);
              req.session.flash = {
                type: 'danger',
                intro: 'Ooops!',
                message: `Something went wrong, ${req.body.subName} was not deleted.`,
              };
              return res.redirect(303, `/location/rack/${res.abbreviation}`);
            } else {
              req.session.flash = {
                type: 'success',
                intro: 'Done!',
                message: `Contact ${req.body.subName} has been deleted.`,
              };
              return res.redirect(303, `/location/rack/${res.abbreviation}`);
            }
          });
        }
      });
    }
  }
};
