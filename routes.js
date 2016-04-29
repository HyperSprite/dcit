const logger = require('./lib/logger');
const passport = require('passport');
const accConfig = require('./config/access');
const handlers = require('./handlers');
const strTgs = require('./lib/stringThings');

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  return res.redirect('/');
}

function accCheckr(req, res, next) {
  if (accConfig.accessCheck(req.user).read !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  }
  return next();
}

function accChecke(req, res, next) {
  // console.log(req.user);
  if (accConfig.accessCheck(req.user).edit !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  }
  return next();
}

function accCheckd(req, res, next) {
  // console.log(req.user);
  if (accConfig.accessCheck(req.user).delete !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  }
  return next();
}

function accChecks(req, res, next) {
  // console.log(req.user);
  if (accConfig.accessCheck(req.user).root !== 1) {
    req.session.flash = strTgs.notAuth;
    return res.redirect(303, '/');
  }
  return next();
}

module.exports = (app) => {
  app.post('/admin/uploadpost', isLoggedIn, handlers.admin.uploadPost);
// cross-site request forgery protection
  app.use(require('csurf')());
  app.use((req, res, next) => {
    res.locals._csrfToken = req.csrfToken();
    next();
  });

  app.use((err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
  // handle CSRF token errors here
    logger.warn(`crsf error req.csrfToken >${req.csrfToken()}`);
    logger.warn(req.hostname + req.originalUrl);

    res.status(403);
    res.send('session has expired or form tampered with');
  });

  // miscellaneous routes
  app.get('/', handlers.main.home);
  app.get('/about', handlers.main.about);
  app.get('/help', handlers.main.help);

  // testing/sample routes
  app.get('/jquery-test', handlers.samples.jqueryTest);
  app.get('/epic-fail', handlers.samples.epicFail);

  // users
  app.get('/user', handlers.user.home);
  app.get('/user/:data', handlers.user.home);
  app.get('/user/profile', isLoggedIn, handlers.user.home);
  app.post('/user/signup', handlers.user.localSignup);
  app.post('/user/login', handlers.user.localLogin);


  // locations
  // URL is incoming / :datacenter is the req storage (this could have had a better name)
  // Next part is the export file.name in handlers dir.

  app.get('/location/datacenters', accCheckr, handlers.location.datacenterPages);
  app.get('/location/datacenter/:datacenter', accCheckr, handlers.location.datacenterPages);

  app.post('/location/datacentercontact/:datacenter', accChecke, isLoggedIn, handlers.location.datacenterContactPost);
  app.post('/location/datacenterdelete/:datacenter', accChecke, isLoggedIn, handlers.location.datacenterDelete);
  app.post('/location/datacentersubdelete/:datacenter', accChecke, isLoggedIn, handlers.location.datacenterSubDelete);
  app.post('/location/datacenterpost', isLoggedIn, handlers.location.datacenterPost);

  app.get('/location/datacentercage/:datacenter', accChecke, isLoggedIn, handlers.location.datacenterCagePages);
  app.post('/location/datacentercage/:datacenter', accChecke, isLoggedIn, handlers.location.datacenterCagePost);
  app.get('/location/datacenterpower/:datacenter', accChecke, isLoggedIn, handlers.location.datacenterPowerPages);
  app.post('/location/datacenterpower/:datacenter', accChecke, isLoggedIn, handlers.location.datacenterPowerPost);
  app.get('/location/network/:datacenter', accChecke, isLoggedIn, handlers.location.datacenterNetworkPages);
  app.post('/location/network/:datacenter', accChecke, isLoggedIn, handlers.location.datacenterNetworkPost);

  app.get('/location/rack', accCheckr, handlers.rack.dcRackAll);
  app.get('/location/rack/new', accChecke, handlers.rack.dcRackNew);
  app.get('/location/rack/:data', accCheckr, handlers.rack.dcRackView);
  app.get('/location/rack/:data/copy', accChecke, handlers.rack.dcRackCopy);
  app.get('/location/rack/:data/edit', accChecke, handlers.rack.dcRackEdit);
  app.get('/location/rackpower', accCheckr, handlers.rack.dcRackPowAll);
  app.get('/location/rackpower/:data/new', accChecke, handlers.rack.dcRackPowNew);
  app.get('/location/rackpower/:data/copy', accChecke, handlers.rack.dcRackPowCopy);
  app.get('/location/rackpower/:data/edit', accChecke, handlers.rack.dcRackPowEdit);

  app.post('/location/rack/:data', accChecke, isLoggedIn, handlers.rack.dcRackPost);
  app.post('/location/rackdelete/:data', accCheckd, isLoggedIn, handlers.rack.rackDelete);
  app.post('/location/rackpower/:data', accChecke, isLoggedIn, handlers.rack.dcRackPowPost);
  app.post('/location/racksubdelete/:data', accCheckd, isLoggedIn, handlers.rack.rackSubDelete);
  // Equipment
  app.get('/equipment', accCheckr, handlers.equipment.dcEquipAll);
  app.get('/equipment/new', accChecke, handlers.equipment.dcEquipNew);
  app.get('/equipment/:data', accCheckr, handlers.equipment.dcEquipView);
  app.get('/equipment/:data/copy', accChecke, handlers.equipment.dcEquipCopy);
  app.get('/equipment/:data/edit', accChecke, handlers.equipment.dcEquipEdit);
  app.get('/equipment-systems', accCheckr, handlers.equipment.dcEquipSysPages);
  app.get('/equipment-systems/:datacenter', accCheckr, handlers.equipment.dcEquipSysPages);
  app.get('/elevation/:datacenter', accCheckr, handlers.equipment.dcRackElevationPage);
  app.get('/equipment-snchange/:datacenter', accCheckd, handlers.equipment.dcEquipSNChange);
  app.post('/equipment-snchange/:datacenter', accCheckd, isLoggedIn, handlers.equipment.dcEquipSNChangePost);
  app.post('/equipment/:datacenter', accChecke, isLoggedIn, handlers.equipment.dcEquipmentPost);
  app.post('/equipmentdelete/:datacenter', accCheckd, isLoggedIn, handlers.equipment.dcEquipDelete);
  app.post('/equipmentportdelete/:datacenter', accCheckd, isLoggedIn, handlers.equipment.equipSubDelete);
  // Systems
  app.get('/system', accCheckr, handlers.system.dcSystemAll);
  app.get('/system/new', accChecke, handlers.system.dcSystemNew);
  app.get('/system/:data', accCheckr, handlers.system.dcSystemView);
  app.get('/system/:data/copy', accChecke, handlers.system.dcSystemCopy);
  app.get('/system/:data/edit', accChecke, handlers.system.dcSystemEdit);
  app.get('/endpoint/:data', accCheckr, handlers.system.findEndpoints);
  app.get('/systemports-list', accCheckr, handlers.system.dcSystemPortPages);
  app.get('/system/:data/namechange', accCheckd, handlers.system.dcSystemNameChange);
  app.post('/system/:data/namechange', accCheckd, isLoggedIn, handlers.system.dcSystemNameChangePost);
  app.post('/system/:data', accChecke, isLoggedIn, handlers.system.dcSystemPost);
  app.post('/system/:data/delete', accCheckd, isLoggedIn, handlers.system.dcsystemDelete);
  app.post('/system/:data/portdelete', accCheckd, isLoggedIn, handlers.system.dcsystemSubDelete);

  app.get('/reports', handlers.report.dcReport);

  app.get('/reports/query', accCheckr, handlers.report.queryAggr);
  app.get('/reports/:collection/:findIn/:findWhat', handlers.report.multiAggr);

  app.get('/reports/:datacenter', handlers.report.dcByEnvRole);
  app.get('/env-role-reports', handlers.report.dcByEnvRole);
  app.get('/env-role-report/:datacenter', handlers.report.dcByEnvRole);
  app.get('/reportByInserviceEnv.json', handlers.report.reportByInserviceEnv);
  app.get('/reportByInserviceEnvRole.json', handlers.report.reportByInserviceEnvRole);

  // Admin
  app.get('/admin', accChecks, isLoggedIn, handlers.admin.home);
  app.get('/admin/options', accChecks, isLoggedIn, handlers.admin.options);
  app.get('/admin/dbinsert', accChecks, isLoggedIn, handlers.admin.dbinsert);
  app.get('/admin/useradmin', accChecks, isLoggedIn, handlers.admin.useradmin);
  app.get('/admin/logs', accChecks, isLoggedIn, handlers.admin.logs);
  app.get('/admin/logviewer/:data', accChecks, isLoggedIn, handlers.admin.logviewer);
  app.get('/admin/filemanager', accChecks, isLoggedIn, handlers.admin.filemanager);
  app.get('/admin/joins', accChecks, isLoggedIn, handlers.admin.joins);
  app.get('/admin/models', accChecks, isLoggedIn, handlers.admin.models);
  app.get('/admin/optionsedit/:data', accChecks, isLoggedIn, handlers.admin.optionsEdit);
  app.post('/admin/userprofileupdate', accChecks, isLoggedIn, handlers.admin.userEditPost);
  app.post('/admin/optionspost', accChecks, isLoggedIn, handlers.admin.optionsEditPost);

  app.post('/admin/uploaddelete', accChecks, isLoggedIn, handlers.admin.uploadDeletePost);
  app.post('/admin/userprofile', accChecks, isLoggedIn, handlers.admin.userEdit);
  app.post('/admin/logdelete', accChecks, isLoggedIn, handlers.admin.logdelete);
  app.post('/admin/userdelete', accChecks, isLoggedIn, handlers.admin.userDelete);
  app.post('/admin/csvtodb', accChecks, isLoggedIn, handlers.admin.csvToDBPost);
  app.get('/admin/optionsadmin/dropDatacenter', accChecks, isLoggedIn, handlers.admin.dropDatacenterGet);
  app.get('/admin/optionsadmin/dropRack', accChecks, isLoggedIn, handlers.admin.dropRackGet);
  app.get('/admin/optionsadmin/dropOptionsdb', accChecks, isLoggedIn, handlers.admin.dropOptionsdbGet);
  app.get('/admin/optionsadmin/dropEquipment', accChecks, isLoggedIn, handlers.admin.dropEquipmentGet);
  app.get('/admin/optionsadmin/dropSystem', accChecks, isLoggedIn, handlers.admin.dropSystemGet);
  app.get('/admin/optionsadmin/seedDatacenter', accChecks, isLoggedIn, handlers.admin.seedDatacetnerGet);
  app.get('/admin/optionsadmin/seedRacks', accChecks, isLoggedIn, handlers.admin.seedRacksGet);
  app.get('/admin/optionsadmin/seedOptionsdb', accChecks, isLoggedIn, handlers.admin.seedOptionsdbGet);
  app.get('/admin/optionsadmin/seedEquipment', accChecks, isLoggedIn, handlers.admin.seedEquipmentGet);
  app.get('/admin/optionsadmin/seedSystem', accChecks, isLoggedIn, handlers.admin.seedSystemGet);
  // AJAX
  app.get('/go/input', handlers.ajax.get);
  app.get('/utility', handlers.ajax.userCheck);
  app.get('/autocomplete/allSystemNames', accCheckr, handlers.ajax.allSystemNames);
  app.get('/autocomplete/allSystemRole', accCheckr, handlers.ajax.allSystemRole);
  app.get('/autocomplete/allSystemEnviron', accCheckr, handlers.ajax.allSystemEnviron);
  app.get('/autocomplete/allEquipSN', accCheckr, handlers.ajax.allEquipSN);
  app.get('/autocomplete/allEquipMake', accCheckr, handlers.ajax.allEquipMake);
  app.get('/autocomplete/allEquipModel', accCheckr, handlers.ajax.allEquipModel);
  app.get('/autocomplete/allLocationRack', accCheckr, handlers.ajax.allLocationRack);
  app.get('/utility/distinct', handlers.ajax.distinct);
  app.post('/process/singleportdelete', accCheckd, isLoggedIn, handlers.ajax.singlePortDelete);
};
