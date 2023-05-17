const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());

// Serve the static files from the Quasar dist directory
app.use(express.static(__dirname + '/dist/spa'));

// Serve the Quasar index.html for all routes
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/dist/spa/index.html');
});
const routes = require('./routes');
app.use('/api', routes);

// Connect to MongoDB
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        // Start the server
        app.listen(3000, () => {
            console.log('Server started on port 3000');
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB', error);
    });
