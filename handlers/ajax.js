
const logger = require('../lib/logger.js');
const strTgs = require('../lib/stringThings.js');
const dcit = require('../dcit.js');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const csv = require('fast-csv');
const seedDataLoad = require('../seedDataLoad.js');
const equipmentCrud = require('../crud/equipment.js');
const systemdbCrud = require('../crud/system.js');
const accConfig = require('../config/access');
const ObjectId = require('mongoose').Types.ObjectId;

// Models
const Models = require('../models');
const Datacenter = require('../models/datacenter.js');
const Rack = require('../models/rack.js');
const Optionsdb = require('../models/options.js');
const Equipment = require('../models/equipment.js');
const Systemdb = require('../models/system.js');
const Fileinfo = require('../models/fileinfo.js');

exports.get = function(req, res, next) {
  console.log('ajax.get +++++++++++++');
};
exports.allSystemNames = function(req, res) {
// logger.info('req.query '+req.query.query);
  if (accConfig.accessCheck(req.user).read !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
    var query = Systemdb.find({ 'systemName': { '$regex': req.query.query, '$options': 'i' } }, {'systemName': 1, '_id': 0});
    query.sort({'systemName': 'asc'}).exec(function(err, sysName) {
      if (err) return next(err);
      if (!sysName) return next();
      var aSN = [];
      for (var i = 0; i < sysName.length; i++) {
        aSN[i] = sysName[i].systemName;
      }
      var context = {
        'query': 'Unit',
        'suggestions': aSN,
      };
      // logger.info('allSystemNames');
      res.json(context);
    });
  }
};

exports.allSystemRole = function(req, res) {
  if (accConfig.accessCheck(req.user).read !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
    var query = Systemdb.find({ 'systemRole': { '$regex': req.query.query, '$options': 'i' } },{'systemRole':1,'_id':0});
    query.sort({'systemRole': 'asc'}).exec(function(err, result) {
      if (err) return next(err);
      if (!result) return next();
      var a = [];
      for(var i = 0; i < result.length; i++) {
        a[i] = result[i].systemRole;
      }
      var context = {
        'query': 'Unit',
        'suggestions': strTgs.arrayUnique(a),
      };
      res.json(context);
    });
  }
};

exports.allSystemEnviron = function(req, res) {
  if (accConfig.accessCheck(req.user).read !== 1){
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
    var query = Systemdb.find({ 'systemEnviron': { '$regex': req.query.query, '$options': 'i' } },{'systemEnviron':1,'_id':0});
    query.sort({'systemEnviron': 'asc'}).exec(function(err, result){
    if (err) return next(err);
    if (!result) return next();
    var a = [];
    for (var i = 0; i < result.length; i++) {
      a[i] = result[i].systemEnviron;
    }
    var context = {
      'query': 'Unit',
      'suggestions': strTgs.arrayUnique(a),
    };
      res.json(context);
    });
  }
};

exports.allEquipSN = function(req, res) {
    // logger.info('req.query '+req.query.query);
  if (accConfig.accessCheck(req.user).read !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
  var query = Equipment.find({ 'equipSN': { '$regex': req.query.query, '$options': 'i' } }, {'equipSN': 1, '_id': 0});
    query.sort({'equipSN': 'asc'}).exec(function(err, result) {
      if (err) return next(err);
      if (!result) return next();
      var aSN = [];
      for (var i = 0; i < result.length; i++) {
        aSN[i] = result[i].equipSN;
      }
      var context = {
        'query': 'Unit',
        'suggestions': aSN,
      };
//        logger.info('allEquipSN');
      res.json(context);
    });
  }
};

exports.allEquipMake = function(req, res) {
  if (accConfig.accessCheck(req.user).read !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
  var query = Equipment.find({ 'equipMake': { '$regex': req.query.query, '$options': 'i' } }, {'equipMake': 1, '_id': 0});
    query.sort({'equipMake': 'asc'}).exec(function(err, result) {
      if(err) return next(err);
      if(!result) return next();
      var aMake = [];
      for (var i = 0; i < result.length; i++) {
        aMake[i] = result[i].equipMake;
      }
      var context = {
        'query': 'Unit',
        'suggestions': strTgs.arrayUnique(aMake),
      };
      res.json(context);
    });
  }
};

exports.allEquipModel = function(req, res) {
  if (accConfig.accessCheck(req.user).read !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
  var query = Equipment.find({ 'equipModel': { '$regex': req.query.query, '$options': 'i' } }, {'equipModel': 1, '_id': 0});
    query.sort({'equipModel': 'asc'}).exec(function(err, result){
    if (err) return next(err);
    if (!result) return next();
    var aEquipModel = [];
      for (var i = 0; i < result.length; i++) {
        aEquipModel[i] = result[i].equipModel;
      }
      var context = {
        'query': 'Unit',
        'suggestions': strTgs.arrayUnique(aEquipModel),
      };
      res.json(context);
    });
  }
};

exports.allLocationRack = function(req, res) {
//    logger.info('req.query '+req.query.query);
  if (accConfig.accessCheck(req.user).read !== 1){
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  } else {
  var query = Rack.find({ 'rackUnique': { '$regex': req.query.query, '$options': 'i' } }, {'rackUnique': 1, '_id': 0});
    query.sort({'rackName': 'asc'}).exec(function(err, result){
      if (err) return next(err);
      if (!result) return next();
      var aSN = [];
      for (var i = 0; i < result.length; i++) {
      aSN[i] = result[i].rackUnique;
      }
      var context = {
        'query': 'Unit',
        'suggestions': aSN,
      };
      // logger.info('allEquipSN');
      res.json(context);
    });
  }
};

// /////////////////////////////////////////////////////
//
//   singlePortDelete
//
// /////////////////////////////////////////////////////

exports.singlePortDelete = function(req, res) {
  logger.info('singlePortDelete');
  logger.info('>>' + req.body.id + ' ' + req.body.subId);
  if (accConfig.accessCheck(req.user).delete !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
    } else {
    if (req.body.id && req.body.subId) {
      if (req.body.collectionName === 'Systemdb') {
        Systemdb.findById(req.body.id, req.body.subDoc, function(err, sys) {
          if (err) {
            logger.warn('singlePortDelete' + err);
            // return res.redirect(303 '/location/datacenter/'+res.abbreviation);
          } else {
            sys.systemPorts.id(req.body.subId).remove();
            sys.save(function(err) {
              if (err) {
                logger.warn('singlePortDelete' + err);
                req.session.flash = {
                  type: 'danger',
                  intro: 'Ooops!',
                  message: 'Something went wrong',
                };
                return res.redirect(303, '/system/edit-' + res.abbreviation);
              } else {
                res.send({success: true});
              }
            });
          }
        });
      } else if (req.body.collectionName === 'equipment') {
        Equipment.findById(req.body.id, req.body.subDoc, function(err, eq) {
          if (err) {
            logger.warn('singlePortDelete' + err);
            // return res.redirect(303 '/location/datacenter/'+res.abbreviation);
          } else {
            eq.equipPorts.id(req.body.subId).remove();
            eq.save(function(err) {
              if (err) {
                logger.warn('singlePortDelete' + err);
                req.session.flash = {
                  type: 'danger',
                  intro: 'Ooops!',
                  message: 'Something went wrong',
                };
                return res.redirect(303, '/equipment/edit-' + res.abbreviation);
              } else {
                res.send({success: true});
              }
            });
          }
        });
      }
    } else {
      logger.warn('singlePortDelete could not find matching IDs');
      req.session.flash = {
        type: 'danger',
        intro: 'Ooops!',
        message: 'Systems and Ports dont match',
      };
      return res.redirect(303, '/equipment/edit-' + res.abbreviation);
    }
  }
};


///////////////////////////////////////////////////////
//
//   Equipment Status Edit
//
///////////////////////////////////////////////////////


/*
First part:
Need to get equipment SN into ajax request

    FindOne equipment with the SN

    Get options db options

    Return equipstauedit form into div
    */
exports.equipStatusEdit = function(req, res) {
  logger.info('equipStatusEdit');
  logger.info('>>' + req.body.equipSN);
  if (accConfig.accessCheck(req.user).edit !== 1) {
  var eSN = equipSN;
    return res.status(404).end();
  } else {
    Equipment.findOne({equipSN: eSN}, function(err, eq) {
      if (err) return next(err);
      if (!eq) return next();
      Optionsdb.find({}, 'optListKey optListArray', function(err, opt) {
        if (err) return next(err);
        var context = {
          eq: eq,
          opt: opt,
        }; // context
        res.render('asset/equipstatusedit', {layout: null, context: context});
      }); // opt
    }); // eq
  }
};

// json returns

module.exports.distinct = function(req, res) {
  if (req.params.findIn !== 'User') {
    const query = Models[req.params.findIn].distinct(req.params.findWhat);
    query.exec(function(err, data) {
      if (err) {
        console.warn(err);
        res.send(`${req.params.findWhat} lookup error`);
      } else {
        res.json(data.sort());
      }
    });
  }
};

