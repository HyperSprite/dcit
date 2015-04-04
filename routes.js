var    winston = require('winston'),
         user = require('./handlers/user.js')
          main = require('./handlers/main.js'),
	   samples = require('./handlers/sample.js'),
      location = require('./handlers/location.js'),
          rack = require('./handlers/rack.js'),
     equipment = require('./handlers/equipment.js'),
        system = require('./handlers/system.js'),
         admin = require('./handlers/admin.js'),
          ajax = require('./handlers/ajax.js'),
      passport = require('passport');

module.exports = function(app){

	// miscellaneous routes
	app.get('/', main.home);
    app.get('/about', main.about);

	// testing/sample routes
	app.get('/jquery-test', samples.jqueryTest);
	app.get('/epic-fail', samples.epicFail);

//users
    app.get('/user', user.home);
    app.get('/user/:data', user.home);
    app.get('/user/profile', isLoggedIn, user.home);

    app.post('/user/signup', passport.authenticate('local-signup', {
        successRedirect : '/user/profile', // redirect to the secure profile section
        failureRedirect : '/user/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

   app.post('/user/login', passport.authenticate('local-login', {
        successRedirect : '/', 
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // locations
        // URL is incoming / :datacenter is the req storage (this could have had a better name) 
        // Next part is the export file.name in handlers dir.
        app.get('/location/datacenters', location.datacenterPages);
        app.get('/location/datacenter/:datacenter', location.datacenterPages);
        app.post('/location/datacentercontact/:datacenter', isLoggedIn, location.datacenterContactPost);
        app.post('/location/datacenterdelete/:datacenter', isLoggedIn, location.datacenterDelete);
        app.post('/location/datacentersubdelete/:datacenter', isLoggedIn, location.datacenterSubDelete);
        app.post('/location/datacenterpost', isLoggedIn, location.datacenterPost);
        
        app.get('/location/datacentercage/:datacenter', isLoggedIn, location.datacenterCagePages);
        app.post('/location/datacentercage/:datacenter', isLoggedIn, location.datacenterCagePost);
        app.get('/location/datacenterpower/:datacenter', isLoggedIn, location.datacenterPowerPages);
        app.post('/location/datacenterpower/:datacenter', isLoggedIn, location.datacenterPowerPost);
        app.get('/location/network/:datacenter', isLoggedIn, location.datacenterNetworkPages);
        app.post('/location/network/:datacenter', isLoggedIn, location.datacenterNetworkPost);

        app.get('/location/racks', rack.dcRackPages);
        app.get('/location/rack', rack.dcRackPages);
        app.get('/location/rack/:datacenter', rack.dcRackPages);
        app.post('/location/rack/:datacenter', isLoggedIn, rack.dcRackPost);
        app.post('/location/rackdelete/:datacenter', isLoggedIn, rack.rackDelete);
        app.post('/location/rackpower/:datacenter', isLoggedIn, rack.dcRackPowPost);
        app.post('/location/racksubdelete/:datacenter', isLoggedIn, rack.rackSubDelete);
        
        app.get('/equipment', equipment.dcEquipPages);
        app.get('/equipment/:datacenter', equipment.dcEquipPages);
        app.get('/equipment-systems', equipment.dcEquipSysPages);
        app.get('/equipment-systems/:datacenter', equipment.dcEquipSysPages);
        app.get('/elevation/:datacenter', equipment.dcRackElevationPage);
        app.post('/equipment/:datacenter', isLoggedIn, equipment.dcEquipmentPost);
        app.post('/equipmentdelete/:datacenter', isLoggedIn, equipment.dcEquipDelete);
        app.post('/equipmentportdelete/:datacenter', isLoggedIn, equipment.equipSubDelete);
        
        app.get('/systems', system.dcSystemPages);
        app.get('/system/:datacenter', system.dcSystemPages);
        app.get('/endpoint/:datacenter', system.findEndpoints);
        app.get('/systemports-list', system.dcSystemPortPages);
        app.post('/system/:datacenter', isLoggedIn, system.dcSystemPost);
        app.post('/systemdelete/:datacenter', isLoggedIn, system.dcsystemDelete);
        app.post('/systemportdelete/:datacenter', isLoggedIn, system.dcsystemSubDelete);
        
        app.get('/reports', system.dcSystemCountbyEnv);
        app.get('/env-role-reports',system.dcSystembyEnvRole);
        app.get('/env-role-report/:datacenter',system.dcSystembyEnvRole);
        
        // Admin 
        app.get('/admin', isLoggedIn, admin.home);
        app.get('/admin/:datacenter', isLoggedIn, admin.home);
        app.get('/admin/optionsedit/:datacenter', isLoggedIn, admin.optionsEdit);
        app.post('/admin/userprofileupdate', isLoggedIn, admin.userEditPost)
        app.post('/admin/optionspost', isLoggedIn, admin.optionsEditPost);
        app.post('/admin/uploadpost', isLoggedIn, admin.uploadPost);
        app.post('/admin/uploaddelete', isLoggedIn, admin.uploadDeletePost);
        app.post('/admin/userprofile', isLoggedIn, admin.userEdit);
        app.post('/admin/logdelete', isLoggedIn, admin.logdelete);
        app.post('/admin/userdelete', isLoggedIn, admin.userDelete);
        app.post('/admin/csvtodb', isLoggedIn, admin.csvToDBPost);
        app.get('/admin/optionsadmin/dropDatacenter', isLoggedIn, admin.dropDatacenterGet);
        app.get('/admin/optionsadmin/dropRack', isLoggedIn, admin.dropRackGet);
        app.get('/admin/optionsadmin/dropOptionsdb', isLoggedIn, admin.dropOptionsdbGet);
        app.get('/admin/optionsadmin/dropEquipment', isLoggedIn, admin.dropEquipmentGet);
        app.get('/admin/optionsadmin/dropSystem', isLoggedIn, admin.dropSystemGet);
        app.get('/admin/optionsadmin/seedDatacenter', isLoggedIn, admin.seedDatacetnerGet);
        app.get('/admin/optionsadmin/seedOptionsdb', isLoggedIn, admin.seedOptionsdbGet);
        app.get('/admin/optionsadmin/seedEquipment', isLoggedIn, admin.seedEquipmentGet);
        app.get('/admin/optionsadmin/seedSystem', isLoggedIn, admin.seedSystemGet);

        app.get('/go/input', ajax.get);
        app.get('/autocomplete/allSystemNames', ajax.allSystemNames);
        app.get('/autocomplete/allSystemRole', ajax.allSystemRole);
        app.get('/autocomplete/allSystemEnviron', ajax.allSystemEnviron);        
        app.get('/autocomplete/allEquipSN', ajax.allEquipSN);
        app.get('/autocomplete/allEquipMake', ajax.allEquipMake);
        app.get('/autocomplete/allEquipModel', ajax.allEquipModel);
        app.get('/autocomplete/allLocationRack', ajax.allLocationRack);

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
