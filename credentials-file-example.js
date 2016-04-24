// Change the name of this file to credentials.js and update the cookie
// secret and your mongodb urls and credentials.
module.exports = {
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
    },
    production: {
      connectionString: 'mongodb://localhost:27017/dcit',
      username: '',
      password: '',
    },
    test: {
      connectionString: 'mongodb://localhost:27017/dcit-test',
      username: '',
      password: '',
    },
  },
};
