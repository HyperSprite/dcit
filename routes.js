var main = require('./handlers/main.js'),
	samples = require('./handlers/sample.js'),
    location = require('./handlers/location.js'),
    rack = require('./handlers/rack.js'),
    equipment = require('./handlers/equipment.js'),
    admin = require('./handlers/admin.js'),
    ajax = require('./handlers/ajax.js');

module.exports = function(app){

	// miscellaneous routes
	app.get('/', main.home);
    app.get('/about', main.about);


	// testing/sample routes
	app.get('/jquery-test', samples.jqueryTest);
	app.get('/epic-fail', samples.epicFail);

   
    // locations
        // URL is incoming / :datacenter is the req storage (this could have had a better name) 
        // Next part is the export file.name in handlers dir.
        app.get('/location/datacenter/:datacenter', location.datacenterPages);
        app.post('/location/datacentercontact/:datacenter', location.datacenterContactPost);
        app.post('/location/datacenterdelete/:datacenter', location.datacenterDelete);
        app.post('/location/datacentersubdelete/:datacenter', location.datacenterSubDelete);
        
        app.post('/location/datacenterpost', location.datacenterPost);
        

        
        app.get('/location/datacentercage/:datacenter', location.datacenterCagePages);
        app.post('/location/datacentercage/:datacenter', location.datacenterCagePost);
        app.get('/location/datacenterpower/:datacenter', location.datacenterPowerPages);
        app.post('/location/datacenterpower/:datacenter', location.datacenterPowerPost);
        app.get('/location/rack/:datacenter', rack.dcRackPages);
        app.post('/location/rack/:datacenter', rack.dcRackPost);
        app.post('/location/rackdelete/:datacenter', rack.rackDelete);
        app.post('/location/rackpower/:datacenter', rack.dcRackPowPost);
        app.post('/location/racksubdelete/:datacenter', rack.rackSubDelete);

        app.get('/asset/equipment/:datacenter', equipment.dcEquipPages);
        app.get('/asset/equipmentsystem/:datacenter', equipment.dcEquipSysPages);
        
        // Admin 
        
        app.get('/admin/options/:datacenter', admin.optionsEdit);
        app.post('/admin/optionspost', admin.optionsEditPost);
        app.get('/admin/options', admin.options);
        app.get('/admin/optionsadmin/dropDatacenter', admin.dropDatacenterGet);
        app.get('/admin/optionsadmin/dropRack', admin.dropRackGet);
        app.get('/admin/optionsadmin/dropOptionsdb', admin.dropOptionsdbGet);
        app.get('/admin/optionsadmin/dropEquipment', admin.dropEquipmentGet);
        app.get('/admin/optionsadmin/dropSystem', admin.dropSystemGet);
        app.get('/admin/optionsadmin/seedDatacenter', admin.seedDatacetnerGet);
        app.get('/admin/optionsadmin/seedOptionsdb', admin.seedOptionsdbGet);
        app.get('/admin/optionsadmin/seedEquipment', admin.seedEquipmentGet);
        app.get('/admin/optionsadmin/seedSystem', admin.seedSystemGet);

        app.get('/go/input', ajax.get);
        
};
