var http = require('http'),
	https = require('https'),
	express = require('express'),
	fortune = require('./lib/fortune.js'),
	formidable = require('formidable'),
	fs = require('fs'),
	vhost = require('vhost'),
    Datacenter = require('./models/datacenter.js'),
    Rack = require('./models/rack.js'),
    Equipment = require('./models/equipment.js'),
    Systemdb = require('./models/system.js'),
    Optionsdb = require('./models/options.js'),
    seedDataLoad = require('./seedDataLoad.js');


var app = express();

var LIUser = {'account':'admin',
                'name':'Superuser',
                'groups':['admin','base'],
                };

var credentials = require('./credentials.js');

var emailService = require('./lib/email.js')(credentials);

// set up handlebars view engine
var handlebars = require('express-handlebars').create({
    defaultLayout:'main',
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        },
        static: function(name) {
            return require('./lib/static.js').map(name);
        },
        // for selects to have a default option
        selOption: function (current, field) {
          var results = ""; 
          results = 'value="' + current + '" ' + (field === current ? 'selected="selected"' : "");
          /*console.log("selOption r >"+results);
          console.log("selOption f >"+field);
          console.log("selOption c >"+current);
          */
          return (results);
          }
        

    }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// set up css/js bundling
var bundler = require('connect-bundle')(require('./config.js'));
app.use(bundler);

app.set('port', process.env.PORT || 3000);

// use domains for better error handling
app.use(function(req, res, next){
    // create a domain for this request
    var domain = require('domain').create();
    // handle errors on this domain
    domain.on('error', function(err){
        console.error('DOMAIN ERROR CAUGHT\n', err.stack);
        try {
            // failsafe shutdown in 5 seconds
            setTimeout(function(){
                console.error('Failsafe shutdown.');
                process.exit(1);
            }, 5000);

            // disconnect from the cluster
            var worker = require('cluster').worker;
            if(worker) worker.disconnect();

            // stop taking new requests
            server.close();

            try {
                // attempt to use Express error route
                next(err);
            } catch(error){
                // if Express error route failed, try
                // plain Node response
                console.error('Express error mechanism failed.\n', error.stack);
                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('Server error.');
            }
        } catch(error){
            console.error('Unable to send 500 response.\n', error.stack);
        }
    });

    // add the request and response objects to the domain
    domain.add(req);
    domain.add(res);

    // execute the rest of the request chain in the domain
    domain.run(next);
});

// logging
switch(app.get('env')){
    case 'development':
    	// compact, colorful dev logging
    	app.use(require('morgan')('dev'));
        break;
    case 'production':
        // module 'express-logger' supports daily log rotation
        app.use(require('express-logger')({ path: __dirname + '/log/requests.log'}));
        break;
}

var MongoSessionStore = require('session-mongoose')(require('connect'));
var sessionStore = new MongoSessionStore({ url: credentials.mongo.development.connectionString });

app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({ store: sessionStore,
                 secret: credentials.cookieSecret,
                 name: credentials.cookieName,
                 saveUninitialized: true,
                 resave: true }));
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser')());

// cross-site request forgery protection
/*
app.use(require('csurf')());
app.use(function(req, res, next){
	res.locals._csrfToken = req.csrfToken();
	next();
});
*/
// database configuration
var mongoose = require('mongoose');
var options = {
                server: {
                    socketOptions: { keepAlive: 1 } 
                }
};
switch(app.get('env')){
    case 'development':
        mongoose.connect(credentials.mongo.development.connectionString, options);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, options);
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}


exports.dropDatacenter = (function(Datacenter){
    Datacenter.find(function(err, datacenters){
    // this will need to be removed once we start using real data
    // or it will delete the real data
        if(datacenters.length) mongoose.connection.collections.datacenters.drop( function(err) {
        console.log('Datacenters collection dropped');
        });
    });
});
exports.dropRack = (function(Rack){
    Rack.find(function(err, racks){
        if(racks.length) mongoose.connection.collections.racks.drop(function(err) {
        console.log('Racks collection dropped');
        });
    });
});

exports.dropOptionsdb = (function(Optionsdb){
    Optionsdb.find(function(err, optionsdbs){
        if(optionsdbs.length) mongoose.connection.collections.optionsdbs.drop(function(err) {
        console.log('Optionsdbs collection dropped');
        });
    });    
});

exports.dropEquipment = (function(Equipment){
    Equipment.find(function(err, equipment){
        if(equipment.length) mongoose.connection.collections.equipment.drop(function(err) {
        console.log('Equipment collection dropped');
        });
    });    
});

exports.dropSystem = (function(Systemdb){
    Systemdb.find(function(err, systemdb){
        if(systemdb.length) mongoose.connection.collections.systemdb.drop(function(err) {
        console.log('Systemdb collection dropped');
        });
    });    
});

// stuff from the book

// flash message middleware
app.use(function(req, res, next){
	// if there's a flash message, transfer
	// it to the context, then clear it
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});

// set 'showTests' context property if the querystring contains test=1
app.use(function(req, res, next){
	res.locals.showTests = app.get('env') !== 'production' && 
		req.query.test === '1';
	next();
});

// add routes
require('./routes.js')(app);

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

var server;

function startServer() {
	var options = {
		key: fs.readFileSync(__dirname + '/ssl/cdsuperg.pem'),
		cert: fs.readFileSync(__dirname + '/ssl/cdsuperg.crt'),
	};
	server = https.createServer(options, app).listen(app.get('port'), function(){
		console.log('Express started in ' + app.get('env') +
			' https://localhost:' + app.get('port') + '.');
	});
}

if(require.main === module){
    // application run directly; start app server
    startServer();
} else {
    // application imported as a module via "require": export function to create server
    module.exports = startServer;
}
