const express = require('express');
const User = require('../models/user');
const Message = require('../models/message');
const Chat = require('../models/chat');
const Attachment = require('../models/attachment');
const config = require('../config');
const jwt = require('jsonwebtoken');
const Auth = require('../modules/auth');
const utils = require('../modules/utils');
const router = express.Router();

router.get('/', Auth.verifyToken, async (req, res) => {
    let currentPage = Number(req.query.page);
    let search = req.query.search;
    const isValid = (search !== undefined && search.length !== 0);
    if (isNaN(currentPage) || currentPage < 0) {
        search = isValid ? search : '';
        currentPage = 1;
    }
    try {
        const user = jwt.verify(req.token, config.jwt_secret);
        const messages = await Message.getByAuthor(user._id);
        const countOfItems = 4;
        const totalPages = Math.ceil(messages.length / countOfItems);

        const filtered = messages.filter(message => message.content.includes(search ? search : ''));
        const resultMessages = (() => {
            let firstIndex = (currentPage - 1) * countOfItems;
            let lastIndex = currentPage * countOfItems;
            lastIndex = lastIndex > filtered.length ? filtered.length : lastIndex;
            return filtered.slice(firstIndex, lastIndex);
        })();

        const responseObj = {
            totalPages: totalPages,
            currentPage: currentPage,
            messages: resultMessages
        };
        res.status(200).json(responseObj);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Bad Request' });
    }
});

router.get('/:id', Auth.verifyToken, async (req, res) => {
    try {
        jwt.verify(req.token, config.jwt_secret);
        const message = await Message.getById(req.params.id);
        if (!message)
            return res.status(404).json({ error: 'Not found' });
        res.status(200).json({ message });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Bad Request' });
    }
});

router.post('/', Auth.verifyToken, async (req, res) => {
    try {
        const user = jwt.verify(req.token, config.jwt_secret);
        if (!utils.checkMessageBody(req)
            || (!Message.validContent(req.body.content) && !req.files.file)) {
            return res.status(400).json({ error: 'Bad request' });
        }
        const chat = await Chat.getById(req.body.chat);
        if (!chat || !User.isChatMember(user, chat.members)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        let fileAttachment = '';
        if (req.files.file) {
            const type = utils.getFileType(req.files.file);
            const cloudinaryType = (type === 'audio' ? 'video' : type);
            const uplResult = await utils.fileUpload(req.files.file.data, cloudinaryType);
            const attach = new Attachment(uplResult.url, type);
            fileAttachment = await Attachment.insert(attach);
        }
        const reqCont = req.body.content;
        const content = reqCont ? reqCont.trim() : '';
        const message = new Message(0, content, fileAttachment ? fileAttachment : null,
            user._id, req.body.chat, new Date());
        const [newMessId] = await Promise.all([
            Message.insert(message), Chat.update(chat._id, { lastUpdate: message.created })
        ]);
        const newMessage = await Message.getByIdWithUser(newMessId);
        utils.hidePasswords([newMessage.author]);
        res.status(201).json(newMessage.toObject());
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Bad request' });
    }
});

router.put('/:id', Auth.verifyToken, async (req, res) => {
    try {
        const user = jwt.verify(req.token, config.jwt_secret);
        const message = await Message.getById(req.params.id);
        if (!message) {
            return res.status(404).json({ error: 'Not found' });
        }
        if (message.author.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (!Message.validContent(req.body.content)) {
            return res.status(400).json({ error: 'Bad request' });
        }
        const toUpdate = {
            content: req.body.content
        };
        const updateResult = await Message.update(req.params.id, toUpdate);
        message.content = toUpdate.content;
        res.status(200).json({
            result: updateResult,
            updatedMessage: message
        });
    } catch (err) {
        res.status(400).json({ error: 'Bad request' });
    }
});

router.delete('/:id', Auth.verifyToken, async (req, res) => {
    try {
        const user = jwt.verify(req.token, config.jwt_secret);
        const message = await Message.getById(req.params.id);
        if (!message) {
            return res.status(404).json({ error: 'Not found' });
        }
        const chat = await Chat.getById(message.chat);
        if (user._id.toString() !== message.author.toString()
            && user._id.toString() !== chat.creator.toString()) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const deletePromises = [];
        deletePromises.push(Message.delete(req.params.id));
        if (message.attachment) {
            const fileId = utils.getImgId(message.attachment.mediaUrl);
            const cloudinaryType = (message.attachment.fileType === 'audio' ?
                'video' : message.attachment.fileType);
            deletePromises.push(utils.fileDestroy(fileId, cloudinaryType));
            deletePromises.push(Attachment.delete(message.attachment._id));
        }

        const [deleteResult] = await Promise.all(deletePromises);

        const lastMessage = await utils.getChatLastMessage(chat._id.toString());
        if (lastMessage) {
            utils.hidePasswords([lastMessage.author]);
        }
        const lastUpd = lastMessage ? lastMessage.created : chat.created;
        await Chat.update(chat._id, { lastUpdate: new Date(lastUpd) });
        res.status(200).json({
            result: deleteResult,
            deletedMessage: message,
            lastMessage: lastMessage
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Bad request' });
    }
});

module.exports = router;
