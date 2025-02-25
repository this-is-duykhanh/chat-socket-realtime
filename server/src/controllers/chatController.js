const { redisClient } = require('~/config/redis');

const Message = require('~/models/Message');

const getMessage = async (req, res) => {
    try {
        const { room } = req.params;

        // Kiểm tra tin nhắn trong Redis trước
        const cachedMessages = await redisClient.lRange(`room:${room}`, 0, -1);
        if (cachedMessages.length > 0) {
            const sortedMessages = cachedMessages
            .map((msg) => JSON.parse(msg)) // First, parse the JSON strings into objects
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Then, sort them
            

            console.log('redis');
        return res.status(200).json(sortedMessages);
        }


        // Nếu không có trong Redis, lấy từ MongoDB
        const messages = await Message.find({ room })
            .sort({ createdAt: -1 })
            .limit(20);

        // Lưu vào Redis để dùng lần sau
        if (messages.length > 0) {
            await redisClient.del(`room:${room}`); // Xóa cache cũ
            await redisClient.rPush(
                `room:${room}`,
                ...messages.map((msg) => JSON.stringify(msg)),
            );
            // await redisClient.lTrim(`room:${room}`, 0, 19);
        }

        console.log('db');


        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error });
    }
};

const postMessage = async (req, res) => {
    try {
        const { sender, room, text } = req.body;
        let files =  [];

        if (req.files && req.files.length > 0) {
            files = req.files.map((file) => {
                let type = file.mimetype.split('/')[0]; // "image", "video", "application"

                // type not image or video -> "document"
                if (type !== 'image' && type !== 'video') {
                    type = 'document';
                }

                return {
                    fileUrl: `http://localhost:8080/uploads/${type}/${file.filename}`,
                    fileType: file.mimetype.split('/')[0], // Giữ nguyên loại file gốc
                };
            });
        }

        const message = new Message({ sender, room, text, files });
        await message.save();

        // thêm vào redis

        await redisClient.lPush(`room:${room}`, JSON.stringify(message));
        // await redisClient.lTrim(`room:${room}`, 0, 19);


        const io = req.app.get('io');
        if (!io) {
            console.error('❌ Socket.io chưa được khởi tạo!');
            return res.status(500).json({ error: 'WebSocket chưa hoạt động' });
        }

        // Phát tin nhắn đến room
        io.to(room).emit('newMessage', message);

        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Error sending message', error });
    }
};

module.exports = { getMessage, postMessage };
