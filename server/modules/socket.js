const Chat = require('../models/chat');

module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('>socket connected', socket.id);
        socket.on('loggedUser', async (id) => {
            if (id) {
                const chats = await Chat.getChats(id, 0, 0);
                if (chats.length) {
                    const roomsID = chats.map(chat => chat._id.toString());
                    roomsID.forEach(room => {
                        socket.join(room);
                    });
                }
            }
        });
        socket.on('newMessage', (message) => {
            socket.to(message.chat).emit('newMessage', message);
        });
        socket.on('deleteMessage', (data) => {
            socket.to(data.deletedMessage.chat).emit('deleteMessage', data);
        });
        socket.on('newChat', (chat) => {
            const room = chat._id.toString();
            socket.join(room);
            socket.broadcast.emit('newChat', chat);
        });
        socket.on('joinChat', (chat) => {
            const room = chat._id.toString();
            socket.join(room);
            socket.emit('joinChat', chat);
        });
        socket.on('deleteChat', (chatID) => {
            socket.to(chatID).emit('deleteChat', chatID);
            socket.leave(chatID);
        });
        socket.on('leaveChat', (chatID) => {
            socket.leave(chatID);
            socket.emit('leaveChat', chatID);
        });
        socket.on('updateChat', (chat) => {
            socket.broadcast.emit('updateChat', chat);
        });
        socket.on('maybeLeaveChat', (chatID) => {
            const rooms = Object.keys(socket.rooms);
            if (rooms.indexOf(chatID) >= 0) {
                socket.leave(chatID);
                socket.emit('leaveChat', chatID);
            }
        });
        socket.on('disconnect', () => {
            console.log('>socket disconnected');
        });
    });
};
