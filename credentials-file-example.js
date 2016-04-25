// Change the name of this file to credentials.js and update the cookie
// secret and your mongodb urls and credentials.
module.exports = {
  checkAccess: 1,
  uploadDir: '../userdata/',
  logDirectory: '../log/',
  cookieSecret: 'thisIsTheCookieSecret',
  cookieName: 'dcitCookie',
  gmail: {
    user: 'your@gmail.com',
    pass: 'yourPassword',
  },
  mongo: {
    development: {
      connectionString: 'mongodb://localhost:27017/dcit',
      username: '',
      password: '',
      dbName: 'dcit-dev',
    },
    production: {
      connectionString: 'mongodb://localhost:27017/dcit',
      username: '',
      password: '',
      dbName: 'dcit',
    },
    test: {
      connectionString: 'mongodb://localhost:27017/dcit-test',
      username: '',
      password: '',
      dbName: 'dcit-test',
    },
  },
};
