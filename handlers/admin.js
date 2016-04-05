const logger = require('../lib/logger.js');
const strTgs = require('../lib/stringThings.js');
const dcit = require('../dcit.js');
const fs = require('fs');
const formidable = require('formidable');
const csv = require('fast-csv');
const seedDataLoad = require('../seedDataLoad.js');
const equipmentCrud = require('../crud/equipment.js');
const systemdbCrud = require('../crud/system.js');
const accConfig = require('../config/access');
const logConfig = require('../config/log');
const Fileinfo = require('../models/fileinfo.js');
const addContext = require('contextualizer');
const dates = require('../lib/dates.js');

// Models
const Models = require('../models');

//
//         Admin Home page
//
module.exports.home = (req, res) => {
  var context = {};
  context = {
    lastPage: '/admin',
    access: accConfig.accessCheck(req.user),
    titleNow: 'Admin Home',
  };
  res.render('admin/home', context);
};
//
//          Options page
//
module.exports.options = (req, res) => {
  var context = {};
  var msg = 'Something went sideways, sorry';
  // logger.info('called admin.options');
  Models.Optionsdb.find((err, opts) => {
    if (err) {
      msg = 'Something went wrong - err:Options ad58';
      logger.log(addContext(err, msg));
      req.session.flash = strTgs.errMsg(msg);
      res.redirect('/');
    }
    if (!opts) {
      context = {
        lastPage: '/admin/options',
        access: accConfig.accessCheck(req.user),
        titleNow: 'Admin Options',
        optEquipStatus: ['____________________________', 'Seed Optionsdb to populate', '____________________________'],
      };
      res.render('admin/options', context);
    } else {
      context = {
        lastPage: '/admin/options',
        access: accConfig.accessCheck(req.user),
        menu1: 'Admin',
        menuLink1: '/admin',
        menu2: 'File Manager',
        menuLink2: '/admin/filemanager',
        titleNow: 'Admin Options',
        optList: opts.map((opt) => {
          return {
            optListName: opt.optListName,
            optListKey: opt.optListKey,
            optListArray: opt.optListArray,
          };
        }),
      };
      res.render('admin/options', context);
    }
  });
};
//
//         Database admin
//
module.exports.dbinsert = (req, res) => {
  var context = {};
  context = {
    lastPage: '/admin/dbinsert',
    access: accConfig.accessCheck(req.user),
    titleNow: 'Admin DB Insert',
  };
  res.render('admin/dbinsert', context);
};
//
//         User Admin
//
module.exports.useradmin = (req, res) => {
  var context = {};
  var msg = 'Something went sideways, sorry';
  Models.User.find({}).sort({ access: 'desc' }).exec((err, usr) => {
    if (err) {
      msg = 'Something went wrong - err:Options ad109';
      logger.log(addContext(err, msg));
      req.session.flash = strTgs.errMsg(msg);
      res.redirect('/');
    }
    context = {
      lastPage: '/admin/useradmin',
      access: accConfig.accessCheck(req.user),
      titleNow: 'Admin User Manager',
      usr: usr.map((ur) => {
        return {
          id: ur._id,
          usrAccess: ur.access,
          email: ur.local.email,
          name: ur.local.name,
          phone: ur.local.phone,
          createdOn: ur.local.createdOn,
          lastAccessed: ur.local.lastAccessed,
        };
      }),
    };
    res.render('admin/useradmin', context);
  });
};

// ///////////////////////////////////////////////////////
// //      Log reader ------------------------------------
// ///////////////////////////////////////////////////////
module.exports.logs = (req, res) => {
  var context = {};
  var msg = 'Something went sideways, sorry';
  fs.readdir(logConfig.logDirectory, (err, files) => {
    if (err) {
      msg = 'Something went wrong - err:Options ad109';
      logger.log(addContext(err, msg));
      req.session.flash = strTgs.errMsg(msg);
      res.redirect('/');
    }
    // logger.info('files'+files);
    context = {
      lastPage: '/admin/logs',
      access: accConfig.accessCheck(req.user),
      titleNow: 'Admin Logs',
      files: files.map((name) => {
        return { name: name };
      }),
    };
    res.render('admin/logs', context);
  });
};
// ///////////////////////////////////////////////////////
// //      Log View --------------------------------------
// ///////////////////////////////////////////////////////
module.exports.logviewer = (req, res) => {
  var filename;
  var context = {};
  var msg = 'Something went sideways, sorry';
  filename = req.params.data;
  // logger.info('|filename    >'+filename);
  fs.readFile(logConfig.logDirectory + filename, (err, datas) => {
    if (err) {
      msg = 'Something went wrong - err:Options ad109';
      logger.log(addContext(err, msg));
      req.session.flash = strTgs.errMsg(msg);
      res.redirect('/');
    }
    // logger.log(data);
    datas = datas.toString();
    datas = datas.split('\n');
    context = {
      lastPage: '/admin/logs',
      access: accConfig.accessCheck(req.user),
      filename: filename,
      titleNow: 'Admin Logs',
      data: datas.map((da) => {
        return {
          message: da,
        };
      }),
    };
    res.render('admin/logviewer', context);
  });
};


//
//         File Manager
//
module.exports.filemanager = (req, res) => {
  var context = {};
  var msg = 'Something went sideways, sorry';
  Models.Optionsdb.find({}, 'optListKey optListArray', (err, opt) => {
    if (err) {
      msg = 'Something went wrong - err:Options ad109';
      logger.log(addContext(err, msg));
      req.session.flash = strTgs.errMsg(msg);
      res.redirect('/');
    }
    Fileinfo.find({}).sort({ modifiedOn: 'desc' }).exec((err, fil) => {
      if (err) {
        msg = 'Something went wrong - err:Options ad109';
        logger.log(addContext(err, msg));
        req.session.flash = strTgs.errMsg(msg);
        res.redirect('/');
      }
      // logger.info(err);
      // logger.info('file-list'+fil);
      context = {
        lastPage: '/admin/filemanager',
        access: accConfig.accessCheck(req.user),
        titleNow: 'Admin Upload',
        optModels: strTgs.findThisInThatMulti('optModels', opt, 'optListKey'),
        fil: fil.map((fi) => {
        // rack.populate('rackParentDC', 'abbreviation cageNickname')
        // logger.info('sy Map>'+fi);
          return {
            menu1: 'Admin',
            menuLink1: '/admin',
            menu2: 'Options',
            menuLink2: '/admin/options',
            titleNow: 'File Manager',
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
        }),
      };
      res.render('admin/filemanager', context);
    });
  });
};
//
//  Joins
//
module.exports.joins = (req, res) => {
  var context = {};
  var msg = 'Something went sideways, sorry';
  context = {
    lastPage: '/admin/joins',
    access: accConfig.accessCheck(req.user),
    titleNow: 'Admin Joins',
  };
  res.render('admin/joins', context);
};
//
//  Models (not working)
//
module.exports.models = (req, res) => {
  var context = {};
  var msg = 'Something went sideways, sorry';
  context = {
    lastPage: '/admin/models',
    access: accConfig.accessCheck(req.user),
    titleNow: 'Admin Models',
  };
  res.render('admin/models', context);
};

module.exports.userEdit = (req, res) => {
  var context;
  Models.User.findOne({ _id: req.body.id }, (err, ur) => {
    if (err) {
      logger.warn(err);
    } else {
    // logger.info('ur '+ur);
      context = {
        lastPage: '/admin/useradmin',
        access: accConfig.accessCheck(req.user),
        titleNow: ur.local.name,
        id: ur._id,
        usrAccess: ur.access,
        locEmail: ur.local.email,
        locName: ur.local.name,
        locPhone: ur.local.phone,
        LocCreatedOn: ur.local.createdOn,
        locLastAccessed: ur.local.lastAccessed,
      };
      res.render('admin/userprofile', context);
    }
  });
};

var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

module.exports.userEditPost = (req, res) => {
  var data;
  // logger.info('userEditPost >'+ req.body.id);
  data = req.body;
  Models.User.findOne({ _id: req.body.id }, (err, ur) => {
    if (err) {
      logger.warn(err);
      res.redirect('admin/useradmin');
    } else if (!data.locEmail.match(VALID_EMAIL_REGEX)) {
      req.session.flash = {
        type: 'danger',
        intro: 'Validation error!',
        message: 'The email address you entered was  not valid.',
      };
      return res.redirect(303, '/admin/useradmin');
    } else {
      ur.local.email = strTgs.multiTrim(data.locEmail, 5, 2);
      ur.local.name = strTgs.multiTrim(data.locName, 9, 0);
      ur.local.phone = strTgs.multiTrim(data.locPhone, 9, 2);
      ur.access = data.usrAccess;
    }
    ur.save((err) => {
      if (err) {
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
};

module.exports.optionsEdit = (req, res) => {
  var dcInfo;
  var context;
  var msg;
  dcInfo = req.params.data;
  logger.info(`|dcInfo  > ${dcInfo}`);
  if (dcInfo === 'new') {
    context = {
      lastPage: '/admin/optionsedit',
      access: accConfig.accessCheck(req.user),
      titleNow: 'Admin Options Edit',
      stat: 'isNew',
    };
    res.render('admin/optionsedit', context);
  } else {
    Models.Optionsdb.findOne({ optListKey: dcInfo }, (err, opt) => {
      if (err) {
        msg = 'Something went wrong - err:Options ad109';
        logger.log(addContext(err, msg));
        req.session.flash = strTgs.errMsg(msg);
        res.redirect('/');
      }
      context = {
        lastPage: '/admin/optionsedit',
        access: accConfig.accessCheck(req.user),
        menu1: 'Admin',
        menuLink1: '/admin',
        titleNow: 'Admin Option Edit',
        id: opt._id,
        optListName: opt.optListName,
        optListKey: opt.optListKey,
        optListArray: opt.optListArray,
      };
      res.render('admin/optionsedit', context);
    });
  }
};

module.exports.optionsEditPost = (req, res, err) => {
  var thisDoc;
  // logger.info('optionsEditPost >'+ req.body.id);
  if (!req.body.id) {
    Models.Optionsdb.create({
      optListName: strTgs.csvCleanup(req.body.optListName),
      optListKey: strTgs.csvCleanup(req.body.optListKey),
      optListArray: strTgs.csvCleanup(req.body.optListArray),
      createdOn: Date.now(),
      createdBy:req.user,
    }, (err) => {
      if (err) {
        logger.error(err.stack);
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
    Models.Optionsdb.findById(req.body.id, (err, opt) => {
      if (err) {
        msg = 'Something went wrong - err:Options ad109';
        logger.log(addContext(err, msg));
        req.session.flash = strTgs.errMsg(msg);
        res.redirect('/');
      } else {
      // logger.info(opt);
        opt.optListArray = strTgs.csvCleanup(req.body.optListArray);
      }
      opt.save((err) => {
        if (err) {
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


module.exports.uploadPost = (req, res) => {
  // logger.info('date >'+Date.now());
  var userEmail = req.user.local.email;
  var form = new formidable.IncomingForm();
  form.uploadDir = logConfig.uploadDir;
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
  // logger.info('files >'+files);
    var file = files.newCSVfile;
    var fileHRName = strTgs.clTrim(file.name);
    var base = './public/userdata/';
    var dir = './userdata/uploads/';
    var dateStr = Date.now();
    var fileName = `${dateStr}-${fileHRName}`;
    var newPath = dir + fileName;
    // logger.info('dir+filename >'+dir + fileName);
    if (err) {
      res.session.flash = {
        type: 'danger',
        intro: 'Oops!',
        message: `There was an error processing your submission.
 Pelase try again.`,
      };
      // return res.redirect(303, '/contest/vacation-photo');
    }
    Fileinfo.create({
      fileName: file.name,
      filePath: './' + file.path,
      fileHRName: fileHRName,
      fileDescription: strTgs.csvCleanup(fields.fileDescription),
      fileType: fields.fileType,
      createdOn: Date.now(),
      createdBy: userEmail,
    }, (err) => {
      if (err) {
        res.session.flash = {
          type: 'danger',
          intro: 'Oops!',
          message: `There was an error processing ${fileHRName}.
 Pelase try again.`,
        };
        return res.redirect(303, '/admin');
      }
      req.session.flash = {
        type: 'success',
        intro: 'Awesome!',
        message: `File  ${fileHRName} uploaded.`,
      };
      return res.redirect(303, '/admin/filemanager');
    });
  });
};

//
// Upload Delete File POST
//
module.exports.uploadDeletePost = (req, res) => {
  var bdy;
  var msg;
  if (req.body.id) {
    bdy = req.body;
    // logger.info('delete got this far');
    Models.Fileinfo.findOne({ _id: bdy.id }, (err, fileToDelete) => {
      if (err) {
        msg = 'Something went wrong - Upload Delete : ad565';
        logger.log(addContext(err, msg));
        req.session.flash = strTgs.errMsg(msg);
        res.redirect('/');
      }
      // logger.info(err);
      fileToDelete.remove((err) => {
        if (err) {
        // logger.info(err);
          req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: `Something went wrong, ${fileToDelete.fileHRName} was not deleted.`,
          };
          return res.redirect(303, '/admin/filemanager');
        }
        // logger.info('path/file ./'+bdy.filePath);
        fs.unlink(bdy.filePath, (err) => {
          if (err) {
          // logger.info(err);
            req.session.flash = {
              type: 'danger',
              intro: 'Ooops!',
              message: `Something went wrong, ${fileToDelete.fileHRName} was not deleted.`,
            };
            return res.redirect(303, '/admin/filemanager');
          }
          logger.warn(`Uploaded File Deleted, ${fileToDelete.fileHRName}`);
          req.session.flash = {
            type: 'success',
            intro: 'Done!',
            message: `File ${fileToDelete.fileHRName} has been deleted. Good luck with that one`,
          };
          return res.redirect(303, '/admin/filemanager');
        });
      });
    });
  }
};
//  ////////////////////////////////////////
//  //  Delte log file -----------------------------------------
//  ////////////////////////////////////////
module.exports.logdelete = (req, res) => {
  var fileName;
  if (req.body.name) {
    fileName = logConfig.logDirectory + req.body.name;
    fs.unlink(fileName, (err) => {
      if (err) {
        logger.warn(`failed ${fileName} delete`);
        req.session.flash = {
          type: 'danger',
          intro: 'Ooops!',
          message: `Something went wrong, ${fileName} was not deleted.`,
        };
        return res.redirect(303, '/admin/logs');
      }
      logger.info(`Log File ${fileName} deleted by ${req.user.local.email}`);
      req.session.flash = {
        type: 'success',
        intro: 'Done!',
        message: `File ${fileName} has been deleted. Good luck with that one`,
      };
      return res.redirect(303, '/admin/logs');
    });
  }
};

//
//  CSV to DB
//
module.exports.csvToDBPost = (req, res) => {
  var equipmentStream;
  var portsStream;
  var systemdbStream;
  var systemPortsStream;
  // logger.info('csvToDBPost >'+req.body.file);
  switch (req.body.fileDescription) {
    case 'Equipment':
      equipmentStream = fs.createReadStream(req.body.file);
      csv
        .fromStream(equipmentStream, { headers: true })
        .on('data', (data) => {
          if (!data.equipSN) {
          // logger.info('No Equipment SN');
          } else {
            equipmentCrud.equipmentCreate(data, req);
          }
        })
        .on('end', () => {
        // logger.info('done');
        });
      break;
    case 'Equipment.equipPorts':
      // equipPortsStream = fs.createReadStream(req.body.file);
      // csv
      //   .fromStream(equipPortsStream, { headers: true })
      //   .on('data', (data) => {
      //     if (!data.equipSN) {
      //     // logger.info('Equipment Port error');
      //     } else {
      //       equipmentCrud.equipmentPortCreate(data, req);
      //     }
      //   })
      //   .on('end', () => {
      //   // logger.info('done');
      //   });

      var thisName = 'equipSN';
      var inputObj = [];
      var inputData;
      var i = 1;
      portsStream = fs.createReadStream(req.body.file);
      csv
        .fromStream(portsStream, { headers: true })
        .on('data', (data) => {
          i++;
          if (data[thisName] === '') {
            logger.warn(`${thisName} portsStream Error on row ${i}, index: ${data.index} or not found`);
          } else {
            inputData = data;
            if (inputObj.findIndex(sN => sN[thisName] === data[thisName]) === -1) {
              inputObj.push({
                equipSN: data[thisName],
                equipPorts: [inputData],
              });
            } else {
              var indx = inputObj.findIndex(sN => sN[thisName] === data[thisName]);
              inputObj[indx].equipPorts.push(inputData);
            }
          }
          // logger.warn(`index : ${i}`);
          // logger.warn(inputObj);
        })
        .on('end', () => {
          equipmentCrud.equipmentPortCreate(inputObj, req);
        });


      break;
    case 'Systemdb':
      systemdbStream = fs.createReadStream(req.body.file);
      csv
        .fromStream(systemdbStream, { headers: true })
        .on('data', (data) => {
          if (!data.systemName) {
          // logger.info('No System Name');
          } else {
            systemdbCrud.systemdbCreate(data, req);
          }
        })
        .on('end', () => {
        // logger.info('done');
        });
      break;
    case 'Systemdb.systemPorts':
      var inputObj = [];
      var inputData;
      var i = 1;
      systemPortsStream = fs.createReadStream(req.body.file);
      csv
        .fromStream(systemPortsStream, { headers: true })
        .on('data', (data) => {
          i++;
          if (data.systemName === '') {
            logger.warn(`systemPortsStream Error on row ${i}, index: ${data.index} or not found`);
          } else {
            inputData = data;
            if (inputObj.findIndex(sN => sN.systemName === data.systemName) === -1) {
              inputObj.push({
                systemName: data.systemName,
                systemPorts: [inputData],
              });
            } else {
              var indx = inputObj.findIndex(sN => sN.systemName === data.systemName);
              inputObj[indx].systemPorts.push(inputData);
            }
          }
          // logger.warn(`index : ${i}`);
          // logger.warn(inputObj);
        })
        .on('end', () => {
          systemdbCrud.systemdbPortsCreate(inputObj, req);
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
module.exports.userDelete = (req, res) => {
  var msg;
  if (req.body.id) {
  // logger.info('delete got this far id >'+ req.body.id);
    Models.User.findById(req.body.id, (err, userToDelete) => {
      if (err) {
        msg = 'Something went wrong - Upload Delete : ad565';
        logger.log(addContext(err, msg));
        req.session.flash = strTgs.errMsg(msg);
        res.redirect('/');
      }
      // return res.redirect(303 '/location/datacenter/'+usrToDelete);
      userToDelete.remove((err) => {
        if (err) {
          logger.warn(err);
          req.session.flash = {
            type: 'danger',
            intro: 'Ooops!',
            message: `Something went wrong, ${userToDelete.local.email} was not deleted.`,
          };
          return res.redirect(303, '/admin/useradmin');
        }
        logger.info(`USER DELETED : ${userToDelete.local.email} BY ${req.user.local.email}`);
        req.session.flash = {
          type: 'success',
          intro: 'Done!',
          message: `User ${userToDelete.local.email} has been deleted.`,
        };
        return res.redirect(303, '/admin/useradmin');
      });
    });
  }
};

// These drop the whole DB, not just one
module.exports.dropDatacenterGet = (req, res) => {
  dcit.dropDatacenter(Models.Datacenter);
  logger.warn(`dropDatacenter by, ${req.user.local.email}`);
  return res.redirect(303, '/location/datacenter/list');
};

module.exports.dropRackGet = (req, res) => {
  dcit.dropRack(Models.Rack);
  logger.warn(`dropRack by, ${req.user.local.email}`);
  return res.redirect(303, '/location/datacenter/list');
};

module.exports.dropOptionsdbGet = (req, res) => {
  dcit.dropOptionsdb(Models.Optionsdb);
  logger.warn(`dropOptionsdb by,${req.user.local.email}`);
  return res.redirect(303, '/admin/options');
};

module.exports.dropEquipmentGet = (req, res) => {
  dcit.dropEquipment(Models.Equipment);
  logger.warn(`dropEquipment by, ${req.user.local.email}`);
  return res.redirect(303, '/admin/options');
};

module.exports.dropSystemGet = (req, res) => {
  dcit.dropSystem(Models.Systemdb);
  logger.warn(`dropSystem by,${req.user.local.email}`);
  return res.redirect(303, '/admin/options');
};


module.exports.seedDatacetnerGet = (req, res) => {
  seedDataLoad.seedDatacenter(Models.Datacenter);
  logger.warn(`seedDatacetner by ${req.user.local.email}`);
  return res.redirect(303, '/location/datacenter/list');
};

module.exports.seedOptionsdbGet = (req, res) => {
  seedDataLoad.seedOptionsDataBase(Models.Optionsdb);
  logger.warn(`seedOptionsdb by, ${req.user.local.email}`);
  return res.redirect(303, '/admin/options');
};

module.exports.seedEquipmentGet = (req, res) => {
  seedDataLoad.seedEquipmentDataBase(Models.Equipment);
  logger.warn(`seedEquipment by, ${req.user.local.email}`);
  return res.redirect(303, '/admin/options');
};
module.exports.seedSystemGet = (req, res) => {
  seedDataLoad.seedSystemDataBase(Models.Systemdb);
  logger.warn(`seedSystem by,${req.user.local.email}`);
  return res.redirect(303, '/admin/options');
};
