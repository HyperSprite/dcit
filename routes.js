const logger = require('./lib/logger');
const passport = require('passport');
const handlers = require('./handlers');
const strTgs = require('./lib/stringThings');

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
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

  app.get('/location/datacenters', handlers.location.datacenterPages);
  app.get('/location/datacenter/:datacenter', handlers.location.datacenterPages);

  app.post('/location/datacentercontact/:datacenter', isLoggedIn, handlers.location.datacenterContactPost);
  app.post('/location/datacenterdelete/:datacenter', isLoggedIn, handlers.location.datacenterDelete);
  app.post('/location/datacentersubdelete/:datacenter', isLoggedIn, handlers.location.datacenterSubDelete);
  app.post('/location/datacenterpost', isLoggedIn, handlers.location.datacenterPost);

  app.get('/location/datacentercage/:datacenter', isLoggedIn, handlers.location.datacenterCagePages);
  app.post('/location/datacentercage/:datacenter', isLoggedIn, handlers.location.datacenterCagePost);
  app.get('/location/datacenterpower/:datacenter', isLoggedIn, handlers.location.datacenterPowerPages);
  app.post('/location/datacenterpower/:datacenter', isLoggedIn, handlers.location.datacenterPowerPost);
  app.get('/location/network/:datacenter', isLoggedIn, handlers.location.datacenterNetworkPages);
  app.post('/location/network/:datacenter', isLoggedIn, handlers.location.datacenterNetworkPost);

  app.get('/location/rack', handlers.rack.dcRackAll);
  app.get('/location/rack/new', handlers.rack.dcRackNew);
  app.get('/location/rack/:data', handlers.rack.dcRackView);
  app.get('/location/rack/:data/copy', handlers.rack.dcRackCopy);
  app.get('/location/rack/:data/edit', handlers.rack.dcRackEdit);
  app.get('/location/rackpower', handlers.rack.dcRackPowAll);
  app.get('/location/rackpower/:data/new', handlers.rack.dcRackPowNew);
  app.get('/location/rackpower/:data/copy', handlers.rack.dcRackPowCopy);
  app.get('/location/rackpower/:data/edit', handlers.rack.dcRackPowEdit);

  app.post('/location/rack/:data', isLoggedIn, handlers.rack.dcRackPost);
  app.post('/location/rackdelete/:data', isLoggedIn, handlers.rack.rackDelete);
  app.post('/location/rackpower/:data', isLoggedIn, handlers.rack.dcRackPowPost);
  app.post('/location/racksubdelete/:data', isLoggedIn, handlers.rack.rackSubDelete);
  // Equipment
  app.get('/equipment', handlers.equipment.dcEquipAll);
  app.get('/equipment/new', handlers.equipment.dcEquipNew);
  app.get('/equipment/:data', handlers.equipment.dcEquipView);
  app.get('/equipment/:data/copy', handlers.equipment.dcEquipCopy);
  app.get('/equipment/:data/edit', handlers.equipment.dcEquipEdit);
  app.get('/equipment-systems', handlers.equipment.dcEquipSysPages);
  app.get('/equipment-systems/:datacenter', handlers.equipment.dcEquipSysPages);
  app.get('/elevation/:datacenter', handlers.equipment.dcRackElevationPage);
  app.get('/equipment-snchange/:datacenter', handlers.equipment.dcEquipSNChange);
  app.post('/equipment-snchange/:datacenter', isLoggedIn, handlers.equipment.dcEquipSNChangePost);
  app.post('/equipment/:datacenter', isLoggedIn, handlers.equipment.dcEquipmentPost);
  app.post('/equipmentdelete/:datacenter', isLoggedIn, handlers.equipment.dcEquipDelete);
  app.post('/equipmentportdelete/:datacenter', isLoggedIn, handlers.equipment.equipSubDelete);
  // Systems
  app.get('/system', handlers.system.dcSystemAll);
  app.get('/system/new', handlers.system.dcSystemNew);
  app.get('/system/:data', handlers.system.dcSystemView);
  app.get('/system/:data/copy', handlers.system.dcSystemCopy);
  app.get('/system/:data/edit', handlers.system.dcSystemEdit);
  app.get('/endpoint/:data', handlers.system.findEndpoints);
  app.get('/systemports-list', handlers.system.dcSystemPortPages);
  app.get('/system/:data/namechange', handlers.system.dcSystemNameChange);
  app.post('/system/:data/namechange', isLoggedIn, handlers.system.dcSystemNameChangePost);
  app.post('/system/:data', isLoggedIn, handlers.system.dcSystemPost);
  app.post('/system/:data/delete', isLoggedIn, handlers.system.dcsystemDelete);
  app.post('/system/:data/portdelete', isLoggedIn, handlers.system.dcsystemSubDelete);

  app.get('/reports', handlers.report.dcReport);
  app.get('/reports/:datacenter', handlers.report.dcByEnvRole);
  app.get('/env-role-reports', handlers.report.dcByEnvRole);
  app.get('/env-role-report/:datacenter', handlers.report.dcByEnvRole);
  app.get('/reportByInserviceEnv.json', handlers.report.reportByInserviceEnv);
  app.get('/reportByInserviceEnvRole.json', handlers.report.reportByInserviceEnvRole);

  app.get('/reports/systems/:findIn/:findWhat', handlers.report.systemsAggr);
  app.post('/reports/systems/:findIn/:findWhat', handlers.report.systemsAggr);
  // app.get('/reports/:inDB/:findIn/:findWhat', handlers.report.allAggr);
  // app.post('/reports/systemsPost', handlers.report.systemsAggr);
  // app.post('/reports/systemsPost', handlers.report.systemsAggrPost);

  // Admin
  app.get('/admin', isLoggedIn, handlers.admin.home);
  app.get('/admin/options', isLoggedIn, handlers.admin.options);
  app.get('/admin/dbinsert', isLoggedIn, handlers.admin.dbinsert);
  app.get('/admin/useradmin', isLoggedIn, handlers.admin.useradmin);
  app.get('/admin/logs', isLoggedIn, handlers.admin.logs);
  app.get('/admin/logviewer/:data', isLoggedIn, handlers.admin.logviewer);
  app.get('/admin/filemanager', isLoggedIn, handlers.admin.filemanager);
  app.get('/admin/joins', isLoggedIn, handlers.admin.joins);
  app.get('/admin/models', isLoggedIn, handlers.admin.models);
  app.get('/admin/optionsedit/:data', isLoggedIn, handlers.admin.optionsEdit);
  app.post('/admin/userprofileupdate', isLoggedIn, handlers.admin.userEditPost);
  app.post('/admin/optionspost', isLoggedIn, handlers.admin.optionsEditPost);

  app.post('/admin/uploaddelete', isLoggedIn, handlers.admin.uploadDeletePost);
  app.post('/admin/userprofile', isLoggedIn, handlers.admin.userEdit);
  app.post('/admin/logdelete', isLoggedIn, handlers.admin.logdelete);
  app.post('/admin/userdelete', isLoggedIn, handlers.admin.userDelete);
  app.post('/admin/csvtodb', isLoggedIn, handlers.admin.csvToDBPost);
  app.get('/admin/optionsadmin/dropDatacenter', isLoggedIn, handlers.admin.dropDatacenterGet);
  app.get('/admin/optionsadmin/dropRack', isLoggedIn, handlers.admin.dropRackGet);
  app.get('/admin/optionsadmin/dropOptionsdb', isLoggedIn, handlers.admin.dropOptionsdbGet);
  app.get('/admin/optionsadmin/dropEquipment', isLoggedIn, handlers.admin.dropEquipmentGet);
  app.get('/admin/optionsadmin/dropSystem', isLoggedIn, handlers.admin.dropSystemGet);
  app.get('/admin/optionsadmin/seedDatacenter', isLoggedIn, handlers.admin.seedDatacetnerGet);
  app.get('/admin/optionsadmin/seedOptionsdb', isLoggedIn, handlers.admin.seedOptionsdbGet);
  app.get('/admin/optionsadmin/seedEquipment', isLoggedIn, handlers.admin.seedEquipmentGet);
  app.get('/admin/optionsadmin/seedSystem', isLoggedIn, handlers.admin.seedSystemGet);
  // AJAX
  app.get('/go/input', handlers.ajax.get);
  app.get('/autocomplete/allSystemNames', handlers.ajax.allSystemNames);
  app.get('/autocomplete/allSystemRole', handlers.ajax.allSystemRole);
  app.get('/autocomplete/allSystemEnviron', handlers.ajax.allSystemEnviron);
  app.get('/autocomplete/allEquipSN', handlers.ajax.allEquipSN);
  app.get('/autocomplete/allEquipMake', handlers.ajax.allEquipMake);
  app.get('/autocomplete/allEquipModel', handlers.ajax.allEquipModel);
  app.get('/autocomplete/allLocationRack', handlers.ajax.allLocationRack);
  app.get('/utility/distinct/:findIn/:findWhat', handlers.ajax.distinct);
  app.post('/process/singleportdelete', isLoggedIn, handlers.ajax.singlePortDelete);
};


