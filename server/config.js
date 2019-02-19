require('dotenv').config();

const config = {
    PORT: process.env['PORT'],
    dbUrl: process.env['MONGODB_URI'],
    cloudinary: {
        cloud_name: process.env['CLOUD_NAME'],
        api_key: process.env['API_KEY'],
        api_secret: process.env['API_SECRET']
    },
    salt: process.env['SALT'],
    secret: process.env['SECRET'],
    jwt_secret: process.env['JWT_SECRET'],
    tokenLife: 900,
    refreshTokenLife: 86400,
    google: {
        clientID: process.env['GOOGLE_CLIENT_ID'],
        clientSecret: process.env['GOOGLE_CLIENT_SECRET']
    }
};

module.exports = config;