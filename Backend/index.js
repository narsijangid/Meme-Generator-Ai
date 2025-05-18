const express = require('express');
const app = express();
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const ProductRouter = require('./Routes/ProductRouter');
require('dotenv').config();
require('./Models/db');

const PORT = process.env.PORT || 8080;

// Create HTTP server and attach WebSocket to it
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

// Ping endpoint
app.get('/ping', (req, res) => {
    res.send('PONG');
});

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/auth', AuthRouter);
app.use('/products', ProductRouter);

// WebSocket connection
wss.on('connection', (ws) => {
    console.log('New WebSocket connection established.');

    ws.on('message', (message) => {
        console.log('Received:', message);
        ws.send(`Echo: ${message}`);
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed.');
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
