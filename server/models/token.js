const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true },
    refreshToken: { type: Object, required: true }
});

const TokenModel = mongoose.model('Token', TokenSchema);

module.exports = class Token {
    constructor(user, refreshToken) {
        this.user = user;
        this.refreshToken = refreshToken;
    }
    static getAll(user) {
        return TokenModel.find({ user });
    }

    static insertToken(refreshToken) {
        return new TokenModel(refreshToken).save();
    }

    static delete(user) {
        return TokenModel.deleteMany({ user });
    }

    static update(refreshToken, user) {
        return TokenModel.updateOne({ user }, refreshToken);
    }
};