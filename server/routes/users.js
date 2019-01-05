const express = require('express');
const User = require('../models/user');
const config = require('../config');
const jwt = require('jsonwebtoken');
const Auth = require('../modules/auth');
const utils = require('../modules/utils');
const router = express.Router();

router.get('/', Auth.verifyToken, async (req, res) => {
    let currentPage = Number(req.query.page);
    let search = req.query.search;
    const isValid = (search !== undefined && search.length !== 0);
    search = isValid ? search : '';
    if (isNaN(currentPage) || currentPage < 0) {
        currentPage = 1;
    }
    try {
        const user = jwt.verify(req.token, config.jwt_secret);
        const users = await User.getAllExceptLogged(user._id);
        const countOfItems = 4;
        const totalPages = Math.ceil(users.length / countOfItems);

        const filtered = users.filter(user => user.login.toLowerCase().includes(search ? search.toLowerCase() : ''));
        const resultUsers = (() => {
            let firstIndex = (currentPage - 1) * countOfItems;
            let lastIndex = currentPage * countOfItems;
            lastIndex = lastIndex > filtered.length ? filtered.length : lastIndex;
            return filtered.slice(firstIndex, lastIndex);
        })();

        utils.hidePasswords(resultUsers);

        const prev = currentPage - 1;
        const next = currentPage * countOfItems >= filtered.length ? 0 : currentPage + 1;
        const responseObj = {
            totalPages: totalPages,
            currentPage: currentPage,
            users: resultUsers,
            prevPage: prev,
            nextPage: next
        };
        res.status(200).json(responseObj);
    } catch (err) {
        res.status(400).json({ error: 'Bad Request' });
    }
});

router.get('/exist/:username', async (req, res) => {
    try {
        const user = await User.getByLogin(req.params.username);
        if (!user) {
            return res.json({ exist: false });
        }
        res.json({ exist: true });
    } catch (error) {
        res.json({ exist: false });
    }
});

router.get('/:id', Auth.verifyToken, async (req, res) => {
    try {
        jwt.verify(req.token, config.jwt_secret);
        const user = await User.getById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Not Found' });
        }
        user.hashedPass = undefined;
        res.status(200).json({ user });
    } catch (error) {
        res.status(400).json({ error: 'Bad Request' });
    }
});

router.put('/:id', Auth.verifyToken, async (req, res) => {
    try {
        let user = jwt.verify(req.token, config.jwt_secret);
        const isOwner = user._id.toString() === req.params.id;
        const isAdmin = user.role === 1;
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (!isOwner) {
            user = await User.getById(req.params.id);
            if (!user)
                return res.status(404).json({ error: 'Not found' });
        }
        if (!User.validLogin(req.body.login)
            || !User.validFullName(req.body.fullname)
            || !User.validBio(req.body.bio)) {
            return res.status(400).json({ error: 'Bad request' });
        }
        const toUpdate = {
            login: req.body.login,
            fullname: req.body.fullname,
            bio: req.body.bio,
            role: req.body.role
        };
        if (utils.checkFiles(req.files)) {
            const uploadResult = await utils.fileUpload(req.files.image.data, 'image');
            toUpdate.avaUrl = uploadResult.url;
        }

        const updateResult = await User.update(req.params.id, toUpdate);
        const newUser = await User.getById(req.params.id);
        let newToken = '';
        if (isOwner) {
            newToken = jwt.sign(newUser.toObject(), config.jwt_secret);
        }
        res.status(200).json({
            result: updateResult,
            updatedUser: newUser,
            newToken: newToken
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Bad request' });
    }
});

module.exports = router;
