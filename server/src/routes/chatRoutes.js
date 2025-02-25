const express = require('express');
const router = express.Router();
const { getMessage, postMessage } = require('~/controllers/chatController');

const { uploadMiddleware} = require('~/middleware/upload');

// Lấy tin nhắn từ MongoDB và Redis
router.get('/messages/:room', getMessage);
router.post('/send-message',uploadMiddleware, postMessage)

module.exports = router;
