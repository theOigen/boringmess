const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const busboyBodyParser = require('busboy-body-parser');
const Auth = require('./modules/auth');
const passport = require('passport');
const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');

const http = require('http').Server(app);
const io = require('socket.io')(http);

const Chat = require('./models/chat');
const config = require('./config');
const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret
});
const connectionOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
};

// will open public/ directory files for http requests
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(busboyBodyParser({
    limit: '10mb'
}));

passport.use(Auth.LocalStrategy);
passport.use(Auth.JWTStrategy);
passport.serializeUser(Auth.serializeUser);
passport.deserializeUser(Auth.deserializeUser);
app.use(passport.initialize());

// app.use(express.static(path.join(__dirname, 'dist')));

const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

const usersRouter = require('./routes/users');
app.use('/api/v2/users', usersRouter);

const messagesRouter = require('./routes/messages');
app.use('/api/v2/messages', messagesRouter);

const chatsRouter = require('./routes/chats');
app.use('/api/v2/chats', chatsRouter);

const apiRouter = require('./routes/api');
app.use('/api/v2', apiRouter);


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
        socket.emit("joinChat", chat);
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

mongoose.connect(config.dbUrl, connectionOptions)
    .then(() => console.log(`Database connected: ${config.dbUrl}`))
    .then(() => http.listen(config.PORT, () => console.log(`Server is running on port ${config.PORT}`)))
    .catch(err => console.log(`Start error: ${err}`));

// app.use('*', function (req, res) {
//     res.sendFile(process.cwd() + "/dist/index.html");
// });
