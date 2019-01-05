const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    chatName: { type: String, required: true },
    shareName: { type: String, required: true, unique: true },
    created: { type: Date, default: Date.now },
    lastUpdate: { type: Date, default: Date.now },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    about: { type: String, default: '' },
    chatAva: { type: String, required: true },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
});

const ChatModel = mongoose.model('Chat', ChatSchema);

class Chat {
    constructor(id = 0, chatName, shareName, creator,
        chatAva = 'https://res.cloudinary.com/boring-messenger/image/upload/v1541626236/default.png',
        about = '', created = Date.now(), lastUpdate = Date.now(), members = []) {
        this.id = id;
        this.chatName = chatName;
        this.shareName = shareName;
        this.creator = creator;
        this.created = created;
        this.lastUpdate = lastUpdate;
        this.about = about;
        this.members = members;
        this.chatAva = chatAva;
    }

    static getAll() {
        return ChatModel.find({});
    }

    static getAllWithMembers() {
        return ChatModel.find({}).populate('members').exec();
    }

    static getByIdWithMembers(id) {
        return ChatModel.findById(id).populate('members').exec();
    }

    static getByTag(shareName) {
        return ChatModel.findOne({ shareName: shareName });
    }

    static getById(id) {
        return ChatModel.findById(id);
    }

    static getChats(userId, have, limit) {
        return ChatModel.find({ 'members': userId })
            .sort({ lastUpdate: -1 })
            .skip(have)
            .limit(limit)
            .then(chats => {
                const defChats = [];
                for (let chat of chats) {
                    defChats.push(chat.toObject());
                }
                return defChats;
            });
    }

    static getChatOwner(id) {
        return ChatModel.findById(id).populate('creator').exec()
            .then(chat => chat.creator);
    }

    static insertChat(chat) {
        if (!this.validateChat(chat)) {
            return Promise.reject(new Error('Chat object failed validation.\nPlease, check your inputs.'));
        } else {
            return new ChatModel(chat).save();
        }
    }

    static update(id, chat) {
        return ChatModel.updateOne({ _id: id }, chat);
    }

    static delete(id) {
        return ChatModel.deleteOne({ _id: id });
    }

    static validShareName(str) {
        return typeof str === 'string' && /^[a-zA-Z0-9_]+$/.test(str) && str.length >= 3 && str.length <= 15;
    }

    static validChatName(str) {
        return typeof str === 'string' && str.trim().length >= 1 && str.trim().length <= 32;
    }

    static validAbout(str) {
        return typeof str === 'string' && str.trim().length >= 0 && str.trim().length <= 70;
    }

    static validateChat(chat) {
        return this.validShareName(chat.shareName)
            && this.validChatName(chat.chatName)
            && this.validAbout(chat.about);
    }
}

module.exports = Chat;
