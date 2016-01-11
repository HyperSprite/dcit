module.exports = {
    cookieSecret: 'thisIsTheCookieSecret',
    cookieName: 'dcitCookie',
    gmail: {
        user: 'your@gmail.com',
        pass: 'yourPassword',
    },
    mongo: {
    
        development: {
            connectionString:'mongodb://localhost:27017/dcit',
        },
        production: {
            connectionString:'mongodb://localhost:27017/dcit',
        },
    },
};
//URL must be in the format mongodb://user:pass@host:port/dbname