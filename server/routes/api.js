const express = require('express');
const config = require('../config');
const jwt = require('jsonwebtoken');
const Auth = require('../modules/auth');
const router = express.Router();

router.get('/me', Auth.verifyToken, (req, res) => {
    const user = jwt.verify(req.token, config.jwt_secret);
    res.status(200).json({ user });
});

module.exports = router;
