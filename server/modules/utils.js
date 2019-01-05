const util = require('util');
const config = require('../config');
const cloudinary = require('cloudinary');
const Message = require('../models/message');
const Chat = require('../models/chat');
const Attachment = require('../models/attachment');

cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret
});

function upload(fileBuffer, fileType, callback) {
    cloudinary.v2.uploader.upload_stream({ resource_type: fileType },
        (err, result) => {
            if (err) {
                callback(err);
            } else {
                callback(null, result);
            }
        }).end(fileBuffer);
}

function destroy(publicId, fileType, callback) {
    cloudinary.uploader.destroy(publicId, info => {
        const err = info.error;
        const result = info.result;
        if (err) callback(err);
        else if (result !== 'ok') callback(new Error(`${result}`));
        else callback(null, result);
    }, { resource_type: fileType });
}

const fileUpload = util.promisify(upload);

const fileDestroy = util.promisify(destroy);

module.exports = {
    isChatOwner: async function (userId, chatId) {
        const chatCreator = await Chat.getChatOwner(chatId);
        return userId === chatCreator._id.toString();
    },

    lastMessages: function (chats) {
        const proms = [];
        for (let chat of chats) {
            proms.push(Message.findLastInChat(chat._id.toString())
                .then(message => {
                    if (!message)
                        chat.lastMessage = '';
                    else if (message.content)
                        chat.lastMessage = message.content;
                    else
                        chat.lastMessage = 'Media File';
                    return chat.lastMessage;
                }));
        }
        proms.push(chats);
        return Promise.all(proms);
    },

    getChatLastMessage: async function (chatId) {
        const message = await Message.findLastInChat(chatId);
        return message;
    },

    setChatLastMessage: async function (chat) {
        const lastMessage = await this.getChatLastMessage(chat._id.toString());
        if (!lastMessage)
            chat.lastMessage = '';
        else if (lastMessage.content)
            chat.lastMessage = lastMessage.content;
        else
            chat.lastMessage = 'Media File';
    },

    deleteChatHistory: async function (chatId) {
        let delProms = [];
        try {
            const messages = await Message.getHist(chatId, 0, 0);
            for (let message of messages) {
                if (message.attachment) {
                    const fileId = this.getImgId(message.attachment.mediaUrl);
                    const cloudinaryType = (message.attachment.fileType === 'audio' ?
                        'video' : message.attachment.fileType);
                    delProms.push(this.fileDestroy(fileId, cloudinaryType));
                    delProms.push(Attachment.delete(message.attachment._id));
                }
                delProms.push(Message.delete(message._id));
            }
            return Promise.all(delProms);
        } catch (err) {
            return Promise.reject(err.toString());
        }
    },

    hidePasswords: function (users) {
        for (let user of users) {
            user.hashedPass = undefined;
        }
    },

    checkFiles: function (files) {
        return files && files.image && (files.image.mimetype === "image/png"
            || files.image.mimetype === "image/jpeg");
    },

    getFileType: function (file) {
        const fileType = file.mimetype;
        const type = fileType.substring(0, fileType.indexOf('/'));
        if (type !== 'audio' && type !== 'video' && type !== 'image') {
            type = 'raw';
        }
        return type;
    },

    checkUserBody: function (req) {
        return this.checkFiles(req.files)
            && req.body.password
            && req.body.bio
            && req.body.login
            && req.body.fullname
            && req.body.chats
            && req.body.contacts;
    },

    checkMessageBody: function (req) {
        return (req.files.file || req.body.content) && req.body.chat;
    },

    checkChatBody: function (req) {
        return this.checkFiles(req.files) && req.body.about.length >= 0
            && req.body.chatName && req.body.shareName && req.body.members;
    },

    validUrl: function (str) {
        return /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/.test(str);
    },

    getImgId: function (url) {
        return url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
    },

    fileUpload,

    fileDestroy,

};