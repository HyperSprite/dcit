const http = require('http');
const https = require('https');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const fs = require('fs');
const vhost = require('vhost');
const passport = require('passport');
const moment = require('moment');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const morgan = require('morgan');
const helmet = require('helmet');

const seedDataLoad = require('./seedDataLoad.js');
const logger = require('./lib/logger.js');
const FileStreamRotator = require('file-stream-rotator');
const logConfig = require('./config/log');

var app = express();

var credentials = require('./credentials.js');
var emailService = require('./lib/email.js')(credentials);

require('./config/passport')(passport);

// set up handlebars view engine
var handlebars = require('express-handlebars').create({
  defaultLayout: 'main',
  helpers: {
    section: function fsection(name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
    static: function fstatic(name) {
      return require('./lib/static.js').map(name);
    },
    // for selects to have a default option
    selOption: function fselOption(current, field) {
      var results = '';
      results = 'value="' + current + '" ' + (field === current ? 'selected="selected"' : '');
      return (results);
    },
  },
});
// require('./lib/helpers.js');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// setup helmet
var ONE_YEAR = 31536000000;
app.use(helmet.hsts({
  maxAge: ONE_YEAR,
  includeSubdomains: true,
  force: true,
}));


// setup css/js bundling
var bundler = require('connect-bundle')(require('./config.js'));
app.use(bundler);

app.set('port', process.env.PORT || 3000);

// use domains for better error handling
app.use(function fdomains(req, res, next) {
  // create a domain for this request
  var domain = require('domain').create();
  // handle errors on this domain
  domain.on('error', function fdomain(err) {
    console.error('DOMAIN ERROR CAUGHT\n', err.stack);
    try {
      // failsafe shutdown in 5 seconds
      setTimeout(function fsetTimeout() {
        console.error('Failsafe shutdown.');
        process.exit(1);
      }, 5000);
      // disconnect from the cluster
      var worker = require('cluster').worker;
      if (worker) worker.disconnect();
      // stop taking new requests
      server.close();
      try {
      // attempt to use Express error route
        next(err);
      } catch (error) {
      // if Express error route failed, try
      // plain Node response
        console.error('Express error mechanism failed.\n', error.stack);
        res.statusCode = 500;
        res.setHeader('content-type', 'text/plain');
        res.end('Server error.');
      }
    } catch (error) {
      console.error('Unable to send 500 response.\n', error.stack);
    }
  });
  // add the request and response objects to the domain
  domain.add(req);
  domain.add(res);
  // execute the rest of the request chain in the domain
  domain.run(next);
});

// setup the logger
fs.existsSync(logConfig.logDirectory) || fs.mkdirSync(logConfig.logDirectory);

switch (app.get('env')) {
case 'development':
  app.use(morgan('dev'));
  break;
case 'production':
  var accessLogStream = FileStreamRotator.getStream({
    filename: logConfig.logDirectory + 'access-%DATE%.log',
    frequency: 'daily',
    verbose: true,
  });
  app.use(morgan('combined', {stream: accessLogStream}));
  break;
default:
  throw new Error('Unknown execution environment: ' + app.get('env'));
}

logger.info('DCIT Log started');

var options = {
  server: {
    socketOptions: { keepAlive: 1 },
  },
};
switch (app.get('env')) {
case 'development':
  mongoose.connect(credentials.mongo.development.connectionString, options);
  break;
case 'production':
  mongoose.connect(credentials.mongo.production.connectionString, options);
  break;
default:
  throw new Error('Unknown execution environment: ' + app.get('env'));
}
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// adding connect-mongo
app.use(session({
  secret: credentials.cookieSecret,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// flash message middleware
app.use(function fflash(req, res, next) {
  // if there's a flash message, transfer
  // it to the context, then clear it
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

// set 'showTests' context property if the querystring contains test=1
app.use(function fshowtests(req, res, next) {
  res.locals.showTests = app.get('env') !== 'production' &&
  req.query.test === '1';
  next();
});

// add routes
require('./routes')(app);

// 404 catch-all handler (middleware)
app.use(function f404(req, res, next){
  console.warn('404 url: ' + req.url);
  res.status(404);
  context = { user : req.user, };
  res.render('404', context);
});

// 500 error handler (middleware)
app.use(function f500(err, req, res, next){
  console.error(err.stack);
  res.status(500);
    context = { user : req.user };
  res.render('500', context);
});

var server;

function startServer() {
  var options = {
    key: fs.readFileSync(__dirname + '/ssl/cdsuperg.pem'),
    cert: fs.readFileSync(__dirname + '/ssl/cdsuperg.crt'),
  };
  server = https.createServer(options, app).listen(app.get('port'), function fserver(){
    logger.info('Express started in ' + app.get('env') +
			' https://localhost:' + app.get('port') + '.');
  });
}

if (require.main === module) {
  // application run directly; start app server
  startServer();
} else {
  // application imported as a module via "require": export function to create server
  module.exports = startServer;
}
