const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
require('dotenv').config();

// Serve the static files from the Quasar dist directory
app.use(express.static(__dirname + '/dist/spa'));

// Serve the Quasar index.html for all routes
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/dist/spa/index.html');
});

// Connect to MongoDB
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// Create a message schema
const messageSchema = new mongoose.Schema({
    username: String,
    message: String,
    type: String,
    timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);

// Store the connected users
let users = {};

// Socket.io event handling
io.on('connection', function (socket) {
    console.log('a user connected');

    // Prompt user for username
    socket.emit('requestUsername');

    // Handle username submission
    socket.on('submitUsername', function (username) {
        if (users[username]) {
            socket.emit('usernameTaken');
        } else {
            // Store the username and associate it with the socket
            users[username] = socket.id;
            socket.username = username;
            // io.emit('userJoined', username);
            const newMessage = new Message({ username: socket.username, message: `${socket.username} has joined the chat.`, type: "userJoined" });
            newMessage
                .save()
                .then(() => {
                    io.emit('userJoined', socket.username);
                })
                .catch((error) => {
                    console.error(error);
                });
            fetchMessages(); // Fetch and emit all messages
        }
    });


    // Handle chat message submission
    socket.on('submitMessage', function (message) {
        const newMessage = new Message({ username: socket.username, message, type: "newMessage" });
        newMessage
            .save()
            .then(() => {
                io.emit('newMessage', { username: socket.username, message, type: "newMessage" });
            })
            .catch((error) => {
                console.error(error);
            });
    });
    // Serve the Quasar index.html for all routes
    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/dist/spa/index.html');
    });

    // Serve all messages from the database
    app.get('/api/messages', function (req, res) {
        Message.find({}, function (err, messages) {
            if (err) return console.error(err);
            res.json(messages);
        });
    });

    // Handle disconnection
    socket.on('disconnect', function () {
        if (socket.username) {
            delete users[socket.username];

            // io.emit('userLeft', socket.username);

            const newMessage = new Message({ username: socket.username, message: `${socket.username} has left the chat.`, type: "userLeft" });
            newMessage
                .save()
                .then(() => {
                    io.emit('userLeft', socket.username);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    });
    // Handle editing a message
    socket.on('editMessage', async function ({ messageId, message }) {
        try {
            await Message.findByIdAndUpdate(messageId, { message });
        } catch (err) {
            console.error(err);
        }
    });

    // Handle deleting a message
    socket.on('deleteMessage', async function (messageId) {
        try {
            await Message.findByIdAndDelete(messageId);
        } catch (err) {
            console.error(err);
        }
    });

    function fetchMessages() {
        Message.find({})
            .exec()
            .then((messages) => {
                socket.emit('fetchedMessages', messages);
            })
            .catch((error) => {
                console.error(error);
            });
    }
});

// Start the server
const port = process.env.PORT || 3000;
http.listen(port, function () {
    console.log(`Server listening on port ${port}`);
});
