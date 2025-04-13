const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    area: { type: Number, required: true },
    description: { type: String, required: true },
    amenities: [String],
    images: [String],
    owner: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Room = mongoose.model('Room', RoomSchema);
module.exports = Room;