

var        http = require('http'),
          https = require('https'), 
        express = require('express'),
       mongoose = require('mongoose'),
     bodyParser = require('body-parser'),
     formidable = require('formidable'),
	         fs = require('fs'),
        winston = require('winston'),
	      vhost = require('vhost'),
       passport = require('passport'),   
     Datacenter = require('./models/datacenter.js'),
           Rack = require('./models/rack.js'),
      Equipment = require('./models/equipment.js'),
       Systemdb = require('./models/system.js'),
      Optionsdb = require('./models/options.js'),
MrSystemEnviron = require('./models/mrsystemenviron.js'),
   seedDataLoad = require('./seedDataLoad.js'),
         logger = require('./lib/logger.js');

var app = express();

//var LIUser = {'account':'admin',
//                'name':'Superuser',
//                'groups':['admin','base'],
//               };

var credentials = require('./credentials.js');
var emailService = require('./lib/email.js')(credentials);

require('./config/passport')(passport);

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
       // var accessLogStream = fs.createWriteStream(__dirname + '/logs/dev/access.log', {flags: 'a'})
        //app.use(logger('tiny', {stream: accessLogStream}))
        break;
    case 'production':
        // module 'express-logger' supports daily log rotation
        //var accessLogStream = fs.createWriteStream(__dirname + '/logs/access.log', {flags: 'a'})
        //app.use(logger('tiny', {stream: accessLogStream}))
        break;
}

logger.info('DCIT Log started');

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


app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('express-session')({ 
                key: 'session',
                cookie:{
                   maxAge: 3600000
                },
                secret: credentials.cookieSecret,
                store: require('mongoose-session')(mongoose),
                saveUninitialized: true,
                resave: true,
                }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));
//app.use(bodyParser());
// cross-site request forgery protection
/*
app.use(require('csurf')());
app.use(function(req, res, next){
	res.locals._csrfToken = req.csrfToken();
    
	next();
});
*/

exports.dropDatacenter = (function(Datacenter){
    Datacenter.find(function(err, datacenters){
    // this will need to be removed once we start using real data
    // or it will delete the real data
        if(datacenters.length) mongoose.connection.collections.datacenters.drop( function(err) {
        logger.info('Datacenters collection dropped');
        });
    });
});
exports.dropRack = (function(Rack){
    Rack.find(function(err, racks){
        if(racks.length) mongoose.connection.collections.racks.drop(function(err) {
        logger.info('Racks collection dropped');
        });
    });
});

exports.dropOptionsdb = (function(Optionsdb){
    Optionsdb.find(function(err, optionsdbs){
        if(optionsdbs.length) mongoose.connection.collections.optionsdbs.drop(function(err) {
        logger.info('Optionsdbs collection dropped');
        });
    });    
});

exports.dropEquipment = (function(Equipment){
    Equipment.find(function(err, equipment){
        if(equipment.length) mongoose.connection.collections.equipment.drop(function(err) {
        logger.info('Equipment collection dropped');
        });
    });    
});

exports.dropSystem = (function(Systemdb){
    Systemdb.find(function(err, systemdb){
        if(systemdb.length) mongoose.connection.collections.systemdbs.drop(function(err) {
        logger.info('Systemdb collection dropped');
        });
    });    
});

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
		logger.info('Express started in ' + app.get('env') +
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
