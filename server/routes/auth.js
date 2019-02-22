const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Auth = require('../modules/auth');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const config = require('../config');
// const axios = require('axios');

router.post('/register', async (req, res) => {
    const login = req.body.username;
    const fullname = req.body.fullname;
    const pass = req.body.password;
    const pass_2 = req.body.password_2;
    if (!User.validLogin(login) || !User.validFullName(fullname)
        || !User.validPassword(pass) || !User.validPassword(pass_2) || pass !== pass_2) {
        return res.status(400).json({ error: 'Incorrect register data' });
    }
    const hash = Auth.sha512(pass).passwordHash;
    try {
        const user = await User.getByLogin(login);
        if (user) {
            res.status(400).json({ error: 'Username already exist' });
        } else {
            const user = new User(0, login, hash, 0, fullname);
            const registred = await User.insertUser(user);
            req.login(registred, { session: false }, (error) => {
                if (error) {
                    res.json({ error: error.toString() });
                    return console.error(error);
                }
                const token = jwt.sign(registred.toObject(), config.jwt_secret);
                return res.json({ user: registred, token });
            });
        }
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.toString() });
    }
});

router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: `Something goes wrong ${JSON.stringify(info)}`,
                user: user
            });
        }
        req.login(user, { session: false }, (err) => {
            if (err) {
                res.json({ error: err.toString() });
                return console.error(err);
            }
            const token = jwt.sign(user.toObject(), config.jwt_secret);
            return res.json({ user, token });
        });
    })(req, res);
});

router.post('/logout', Auth.verifyToken, (req, res) => {
    req.logout();
    const user = jwt.verify(req.token, config.jwt_secret);
    res.json(user);
});

router.post('/google', async (req, res) => {
    // todo get tokens from google api
    const user = req.body.user;
    try {
        let loggedInUser = null;
        const foundedUser = await User.getByGoogleId(user.googleId);
        if (foundedUser) {
            loggedInUser = foundedUser;
        } else {
            const newUser = new User(-1, user.name.toLowerCase().replace(/ /g, '_'), '', 0, user.name,
                new Date(), false, '', user.avaUrl, user.googleId);
            loggedInUser = await User.insertUser(newUser);
        }
        const token = jwt.sign(loggedInUser.toObject(), config.jwt_secret);
        return res.json({ user: loggedInUser, token });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

router.get('/google/redirect', (req, res) => {
    res.json('NORMALITY');
});

module.exports = router;
