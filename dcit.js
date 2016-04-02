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
const helmet = require('helmet');
const logger = require('./lib/logger.js');
const accConfig = require('./config/access');
const expressSanitizer = require('express-sanitizer');

const app = express();

const appPORT = process.env.PORT || 3080;
const appPORTs = process.env.PORT || 3000;
const credentials = require('./credentials.js');
const emailService = require('./lib/email.js')(credentials);

require('./config/passport')(passport);

// set up handlebars view engine
const handlebars = require('express-handlebars').create({
  defaultLayout: 'main',
  helpers: {
    section: (name, options) => {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
    static: (name) => {
      return require('./lib/static.js').map(name);
    },
    // for selects to have a default option
    selOption: (current, field) => {
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
const ONE_YEAR = 31536000000;
app.use(helmet.hsts({
  maxAge: ONE_YEAR,
  includeSubdomains: true,
  force: true,
}));


// setup css/js bundling
const bundler = require('connect-bundle')(require('./config.js'));
app.use(bundler);

// use domains for better error handling
app.use((req, res, next) => {
  // create a domain for this request
  const domain = require('domain').create();
  // handle errors on this domain
  domain.on('error', (err) => {
    console.error('DOMAIN ERROR CAUGHT\n', err.stack);
    try {
      // failsafe shutdown in 5 seconds
      setTimeout(() => {
        console.error('Failsafe shutdown.');
        process.exit(1);
      }, 5000);
      // disconnect from the cluster
      const worker = require('cluster').worker;
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

app.use(expressSanitizer());
// adding connect-mongo
app.use(session({
  secret: credentials.cookieSecret,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));

app.use(require('morgan')('tiny', { stream: logger.stream }));

logger.warn(`DCIT: Started ${moment().format('YYYY[-]MM[-]DD HH:mm:ss')}`);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// flash and user to locals middleware
app.use((req, res, next) => {
  res.locals.access = accConfig.accessCheck(req.user);
  res.locals.user = accConfig.userCheck(req.user);
  res.locals.requrl = req.url;


  // res.locals.accessLevel = accConfig.accessCheck(req.user);
  // res.locals.currentUser = req.user;
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  // console.log(res.locals);
  next();
});

// set 'showTests' context property if the querystring contains test=1
app.use((req, res, next) => {
  res.locals.showTests = app.get('env') !== 'production' &&
  req.query.test === '1';
  next();
});

// redirect to sercure
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  res.redirect(`https://${req.hostname}:${appPORTs}${req.url}`);
});

// add routes
require('./routes')(app);

// Error handler
app.use((err, req, res, next) => {
  logger.error(`ERR URL : ${req.url}`);
  logger.error(`ERR IP  : ${req.ip}`);
  logger.error(`ERR USER: ${req.user.local.email}`);
  logger.error(err);
  next();
});


// 404 catch-all handler (middleware)
app.use((req, res) => {
  logger.warn(`404 URL : ${req.url}`);
  logger.warn(`404 IP  : ${req.ip}`);
  logger.warn(`404 USER: ${req.user.local.email}`);
  res.status(404).render('404');
});

// 500 error handler (middleware)
app.use((err, req, res) => {
  logger.error(err.stack);
  res.status(500).render('500');
});

const secureServer = https.createServer({
  key: fs.readFileSync(__dirname + '/ssl/cdsuperg.pem'),
  cert: fs.readFileSync(__dirname + '/ssl/cdsuperg.crt'),
}, app).listen(appPORTs, () => {
  logger.info(`DCIT: HTTPS ${app.get('env')} https://localhost:${appPORTs}`);
});

const insecureServer = http.createServer(app).listen(appPORT, () => {
  logger.info(`DCIT: HTTP ${app.get('env')} http://localhost:${appPORT}`);
});
