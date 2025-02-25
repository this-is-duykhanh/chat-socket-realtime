const {Schema, model} = require('mongoose');

const MessageSchema = new Schema({
    sender: { type: String, required: true },
    room: { type: String, required: true },
    text: { type: String },
    files: [{
        fileUrl: { type: String },
        fileType: { type: String } // "image", "video", "application"
    }], // "image", "video", "file"
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = model('Message', MessageSchema);
