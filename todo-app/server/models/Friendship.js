const mongoose = require('mongoose');

const FriendshipSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'blocked'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure unique friendship between two players
FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model('Friendship', FriendshipSchema);
