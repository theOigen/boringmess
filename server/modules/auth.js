const crypto = require('crypto');
const User = require('../models/user');
const config = require('../config');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const serverSalt = config.salt;


function sha512(password) {
    const hash = crypto.createHmac('sha512', serverSalt);
    hash.update(password);
    const value = hash.digest('hex');
    return {
        passwordHash: value
    };
}

function serializeUser(user, done) {
    done(null, user._id);
}

async function deserializeUser(id, done) {
    try {
        const user = await User.getById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}

const LStrategy = new LocalStrategy(async (username, password, done) => {
    try {
        const hashedPass = sha512(password, serverSalt).passwordHash;
        const user = await User.getByParams(username, hashedPass);
        if (!user) done(null, false, { message: 'Incorrect username or password' });
        else done(null, user, { message: 'Logged In Successfully' });
    } catch (err) {
        done(err, null, { message: 'Some database error' });
    }
});

const JwtStrategy = new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: config.jwt_secret
}, async (jwtPayload, done) => {
    try {
        console.log('asdsads');
        const user = await User.getById(jwtPayload.id);
        if (user) {
            done(null, user, { message: 'Logged in successfully' });
        } else {
            done(null, false, { message: 'Incorrect username or password' });
        }
    } catch (err) {
        done(err);
    }
});

const GStrategy = new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await User.getByGoogleId({ googleId: profile.id });
        if (!user) {
            await User.insertUserByGoogle(profile);
        }
        done(null, user);
    } catch (error) {
        done(error);
    }
});

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader !== undefined) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

module.exports = {
    sha512,
    verifyToken,
    serializeUser,
    deserializeUser,
    LocalStrategy: LStrategy,
    JWTStrategy: JwtStrategy,
    GoogleStrategy: GStrategy
};
