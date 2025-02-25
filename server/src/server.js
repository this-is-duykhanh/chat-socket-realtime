require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const jwt = require('jsonwebtoken');
const chatSocket = require('./sockets/chatSocket');
const expressSession = require("express-session")
require("dotenv").config();

const app = express();

var session = expressSession({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
   })

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL, // Thay bằng frontend của bạn
        methods: ['GET', 'POST'],
        credentials: true,
    },
});


app.set('io', io);

app.use(
    cors({
		origin: process.env.FRONTEND_URL,
		methods: ["GET", "POST", "PATCH", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization", "Accept"],
		credentials: true,
	}),
);
app.use(express.json());
app.use('/', require('./routes/chatRoutes'));
app.use('/uploads', express.static('uploads'));
app.use(session);



// io.use((socket, next) => {
//     const token = socket.handshake.auth.token;
//     if (!token) return next(new Error('Authentication error'));

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         socket.user = decoded;
//         next();
//     } catch (err) {
//         next(new Error('Invalid token'));
//     }
// });


chatSocket(io);


connectDB();
connectRedis();


const port = process.env.PORT || 3000;
const hostName = process.env.HOST_NAME || "localhost";


server.listen(port,hostName, () => 	console.log(`Server is running on http://${hostName}:${port}`));

