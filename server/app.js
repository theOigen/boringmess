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
require('./modules/socket')(io);

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
passport.use(Auth.GoogleStrategy);
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



mongoose.connect(config.dbUrl, connectionOptions)
    .then(() => console.log(`Database connected: ${config.dbUrl}`))
    .then(() => http.listen(config.PORT, () => console.log(`Server is running on port ${config.PORT}`)))
    .catch(err => console.log(`Start error: ${err}`));

// app.use('*', function (req, res) {
//     res.sendFile(process.cwd() + "/dist/index.html");
// });
