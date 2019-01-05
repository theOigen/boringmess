const mongoose = require('mongoose');
const Attachment = require('./attachment');

const MessageSchema = mongoose.Schema({
    content: { type: String, required: false },
    attachment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attachment'
    },
    created: { type: Date, default: Date.now },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }
});

const MessageModel = mongoose.model('Message', MessageSchema);

class Message {
    constructor(id = -1, content, attachment = null,
        author = null, chat = null, created = new Date()) {
        this.id = id;
        this.content = content;
        this.attachment = attachment;
        this.author = author;
        this.chat = chat;
        this.created = created;
    }

    static getAll() {
        return MessageModel.find({}).populate('attachment').exec();
    }

    static getById(id) {
        return MessageModel.findById(id).populate('attachment').exec();
    }

    static getByAuthor(userId) {
        return MessageModel.find({ author: userId }).sort({ created: 1 }).populate('attachment').exec();
    }

    static getByIdWithUser(id) {
        return MessageModel.findById(id).populate([
            {
                path: 'author',
                model: 'User'
            },
            {
                path: 'attachment',
                model: 'Attachment'
            }
        ]).exec();
    }

    static getHist(chatId, have, limit) {
        return MessageModel.find({ chat: chatId })
            .sort({ created: -1 })
            .skip(have)
            .limit(limit)
            .populate([
                {
                    path: 'author',
                    model: 'User'
                },
                {
                    path: 'attachment',
                    model: 'Attachment'
                }
            ])
            .exec()
            .then(messages => {
                const defMessages = [];
                for (let message of messages) {
                    defMessages.push(message.toObject());
                }
                return defMessages;
            });
    }

    static findLastInChat(chatId) {
        return MessageModel.find({ chat: chatId })
            .sort({ created: 1 })
            .exec()
            .then(messages => {
                if (messages.length !== 0) {
                    return messages[messages.length - 1];
                }
                else return '';
            });
    }

    static insert(message) {
        if (!this.validateMessage(message)) {
            return Promise.reject(new Error('Message object failed validation'));
        } else {
            return new MessageModel(message).save()
                .then(mess => mess._id);
        }
    }

    static update(id, message) {
        if (!this.validateMessage(message)) {
            return Promise.reject(new Error('Message object failed validation'));
        } else {
            return MessageModel.updateOne({ _id: id }, message);
        }
    }

    static delete(id) {
        return MessageModel.deleteOne({ _id: id });
    }

    static validContent(str) {
        return typeof str === 'string' && str.trim().length !== 0 && /\S/.test(str);
    }

    static validateMessage(m) {
        return (m.content && this.validContent(m.content)
            || (m.attachment !== null && (m.attachment.mediaUrl !== undefined ? Attachment.validateAttachment(m.attachment) : true)))
            && m.author && m.chat;
    }

}

module.exports = Message;
