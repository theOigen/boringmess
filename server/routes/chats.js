const express = require('express');
const Message = require('../models/message');
const Chat = require('../models/chat');
const config = require('../config');
const jwt = require('jsonwebtoken');
const Auth = require('../modules/auth');
const utils = require('../modules/utils');
const router = express.Router();

router.get('/', Auth.verifyToken, async (req, res) => {
    let currentCount = Number(req.query.have);
    let search = req.query.search;
    const isValid = (search !== undefined && search.length >= 0);
    if (isNaN(currentCount) || currentCount < 0) {
        search = isValid ? search : '';
        currentCount = 0;
    }
    try {
        const user = jwt.verify(req.token, config.jwt_secret);
        let limit = 8;
        if (isValid) {
            limit = currentCount < 8 ? 8 : currentCount;
            currentCount = 0;
        }
        const chats = await Chat.getChats(user._id, currentCount, limit)
            .then(chats => utils.lastMessages(chats))
            .then(results => results[results.length - 1]);
        const filtered = chats.filter(chat => chat.chatName.toLowerCase().includes(isValid ? search.toLowerCase() : ''));

        const responseObj = {
            chats: filtered,
            have: filtered.length,
            totalCount: chats.length
        };
        res.status(200).json(responseObj);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Bad request' });
    }
});

router.get('/exist/:shareName', async (req, res) => {
    try {
        const chat = await Chat.getByTag(req.params.shareName);
        if (!chat) {
            return res.json({ exist: false });
        }
        res.json({ exist: true });
    } catch (error) {
        res.json({ exist: false });
    }
});

router.get('/:id/history', Auth.verifyToken, async (req, res) => {
    const id = req.params.id;
    const user = jwt.verify(req.token, config.jwt_secret);
    let currentCount = Number(req.query.have);
    let search = req.query.search;
    const isValid = (search !== undefined && search.length >= 0);
    if (isNaN(currentCount) || currentCount < 0) {
        search = isValid ? search : '';
        currentCount = 0;
    }
    try {
        const chat = await Chat.getById(id);
        const index = chat.members.findIndex(member => member.toString() === user._id.toString());
        if (index < 0) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        let limit = 6;
        if (isValid) {
            limit = currentCount < limit ? limit : currentCount;
            currentCount = 0;
        }
        const messages = await Message.getHist(id, currentCount, limit);
        const filtered = messages.filter(message => message.content.toLowerCase().includes(search ? search.toLowerCase() : ''));
        filtered.reverse();
        filtered.forEach(msg => {
            utils.hidePasswords([msg.author]);
        });
        const chatOwner = await utils.isChatOwner(user._id.toString(), id);

        const responseObj = {
            messages: filtered,
            have: currentCount,
            isChatOwner: chatOwner
        };
        res.status(200).json(responseObj);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Bad request' });
    }
});

router.post('/', Auth.verifyToken, async (req, res) => {
    try {
        const user = jwt.verify(req.token, config.jwt_secret);
        if (!utils.checkChatBody(req) || !Chat.validateChat(req.body)) {
            return res.status(400).json({ error: 'Bad request' });
        }
        const ch = await Chat.getByTag(req.body.shareName);
        if (ch) {
            return res.status(409).json({ error: 'Sorry, but this tag already exists' });
        }
        const members = JSON.parse(req.body.members);
        members.push(user._id);
        const chatAva = await utils.fileUpload(req.files.image.data, 'image');
        const chat = new Chat(0, req.body.chatName, req.body.shareName,
            user._id, chatAva.url, req.body.about, new Date(), new Date(), members);
        const newChat = await Chat.insertChat(chat);
        res.status(201).json(newChat);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Bad request' });
    }
});

router.put('/:id', Auth.verifyToken, async (req, res) => {
    try {
        const user = jwt.verify(req.token, config.jwt_secret);
        const chat = await Chat.getById(req.params.id);
        if (!chat) {
            return res.status(404).json({ error: 'Not found' });
        }
        if (chat.creator.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (!Chat.validAbout(req.body.about)
            || !Chat.validChatName(req.body.chatName)
            || !Chat.validShareName(req.body.shareName)) {
            return res.status(400).json({ error: 'Bad request' });
        }
        let toUpdate = {
            chatName: req.body.chatName,
            shareName: req.body.shareName,
            about: req.body.about
        };
        if (utils.checkFiles(req.files)) {
            const uplResult = await utils.fileUpload(req.files.image.data, 'image');
            toUpdate.chatAva = uplResult.url;
        }
        if (req.body.members) {
            const members = JSON.parse(req.body.members);
            members.push(user._id);
            toUpdate.members = members;
        }
        toUpdate.lastUpdate = new Date();
        const updateResult = await Chat.update(req.params.id, toUpdate);

        const updatedChat = await Chat.getById(req.params.id);
        res.status(200).json({
            result: updateResult,
            updatedChat: updatedChat
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Bad request' });
    }
});

router.delete('/:id', Auth.verifyToken, async (req, res) => {
    try {
        const user = jwt.verify(req.token, config.jwt_secret);
        const chat = await Chat.getById(req.params.id);
        if (!chat) {
            return res.status(404).json({ error: 'Not found' });
        }
        if (chat.creator.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const publicId = utils.getImgId(chat.chatAva);
        await Promise.all([
            utils.fileDestroy(publicId, 'image'),
            utils.deleteChatHistory(req.params.id),
        ]);
        const deleteStatus = await Chat.delete(req.params.id);
        res.status(200).json({
            result: deleteStatus,
            deletedChat: chat
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Bad request' });
    }
});

router.get('/:id', Auth.verifyToken, async (req, res) => {
    try {
        const id = req.params.id;
        const user = jwt.verify(req.token, config.jwt_secret);
        const userId = user._id;
        let chat = await Chat.getByIdWithMembers(id);
        if (!chat)
            return res.status(404).json({ error: 'Not found' });
        const index = chat.members.findIndex(member => member._id.toString() === user._id.toString());
        if (index < 0) {
            res.status(403).json({ error: 'Forbidden' });
        }
        chat = chat.toObject();
        await utils.setChatLastMessage(chat);
        chat.members.splice(index, 1);
        let chatOwner = false;
        if (userId.toString() === chat.creator.toString())
            chatOwner = true;
        utils.hidePasswords(chat.members);
        const responseObj = {
            chat: chat,
            isChatOwner: chatOwner
        };
        res.status(200).json(responseObj);
    } catch (err) {
        console.log(err.toString());
        res.status(400).json({ error: 'Bad Request' });
    }
});

module.exports = router;
