const mongoose = require('mongoose');

const defaultAvaUrl = 'https://res.cloudinary.com/boring-messenger/image/upload/v1541626236/default.png';

const UserSchema = new mongoose.Schema({
    login: { type: String, required: true, unique: true },
    hashedPass: { type: String, required: false },
    fullname: { type: String, required: true },
    avaUrl: { type: String, default: defaultAvaUrl },
    bio: { type: String, required: false },
    role: { type: Number, default: 0 },
    registredAt: { type: Date, default: Date.now },
    isDisabled: { type: Boolean, default: false },
    googleId: { type: Number, required: false, unique: true }
});

const UserModel = mongoose.model('User', UserSchema);

class User {
    constructor(id = 0, login, hashedPass, role = 0, fullname = 'empty',
        registredAt = new Date(), isDisabled = false, bio = '',
        avaUrl = defaultAvaUrl, googleId = '') {
        this.id = id;
        this.login = login;
        this.hashedPass = hashedPass;
        this.fullname = fullname;
        this.role = role;
        this.registredAt = registredAt;
        this.avaUrl = avaUrl;
        this.isDisabled = isDisabled;
        this.bio = bio;
        this.googleId = googleId;
    }

    static isChatMember(user, members) {
        for (let member of members) {
            if (member._id !== undefined) {
                if (user._id.toString() === member._id.toString())
                    return true;
            } else {
                if (user._id.toString() === member.toString()) {
                    return true;
                }
            }
        }
        return false;
    }

    static isDefaultAva(url) {
        return url === defaultAvaUrl;
    }

    static validLogin(str) {
        return typeof str === 'string' && /^[a-zA-Z0-9_]+$/.test(str)
            && str.trim().length >= 5 && str.trim().length <= 16;
    }

    static validFullName(str) {
        return typeof str === 'string' && /^[а-яА-ЯёЁa-zA-Z\s]+$/.test(str)
            && str.trim().length >= 1 && str.trim().length <= 32;
    }

    static validPassword(str) {
        return typeof str === 'string' && (str.length === 0 || (/^\S+$/.test(str) && str.length >= 6));
    }

    static validBio(str) {
        return typeof str === 'string' && str.trim().length >= 0 && str.trim().length <= 70;
    }

    static getAll() {
        return UserModel.find({});
    }

    static getAllExceptLogged(id) {
        return UserModel.find({ _id: { $ne: id } });
    }

    static getById(id) {
        return UserModel.findById(id);
    }

    static getByLogin(login) {
        return UserModel.findOne({ login });
    }

    static getByGoogleId(googleId) {
        return UserModel.findOne({ googleId });
    }

    static getByParams(login, hashedPass) {
        return UserModel.findOne({ login, hashedPass });
    }

    static insertUser(user) {
        if (!this.validateUser(user)) {
            return Promise.reject(new Error('User object failed validation.'));
        } else {
            return new UserModel(user).save();
        }
    }

    static update(id, user) {
        return UserModel.updateOne({ _id: id }, user);
    }

    static delete(id) {
        return UserModel.deleteOne({ _id: id });
    }

    static validateUser(u) {
        const password = u.hashedPass !== undefined ? u.hashedPass : u.password;
        console.log(password);
        console.log(this.validPassword(password));
        return this.validLogin(u.login) && this.validFullName(u.fullname)
            && this.validBio(u.bio) && this.validPassword(password)
            && (typeof u.role === 'number' && (u.role === 0 || u.role === 1))
            && (u.isDisabled === false || u.isDisabled === true);
    }

}

module.exports = User;
