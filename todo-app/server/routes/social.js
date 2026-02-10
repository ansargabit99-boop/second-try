const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Friendship = require('../models/Friendship');

// Search Players
router.get('/search/:name', async (req, res) => {
    try {
        const players = await Player.find({ name: { $regex: req.params.name, $options: 'i' } }).select('name level rank title');
        res.json(players);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Friends
router.get('/friends/:playerId', async (req, res) => {
    try {
        const friendships = await Friendship.find({
            $or: [{ requester: req.params.playerId }, { recipient: req.params.playerId }],
            status: 'accepted'
        }).populate('requester recipient', 'name level rank title rating');

        const friends = friendships.map(f =>
            f.requester._id.toString() === req.params.playerId ? f.recipient : f.requester
        );
        res.json(friends);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Requests
router.get('/requests/:playerId', async (req, res) => {
    try {
        const requests = await Friendship.find({
            recipient: req.params.playerId,
            status: 'pending'
        }).populate('requester', 'name level rank title');
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send Request
router.post('/request', async (req, res) => {
    try {
        const { requesterId, recipientId } = req.body;
        if (requesterId === recipientId) return res.status(400).json({ error: "Cannot friend yourself" });

        const existing = await Friendship.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId }
            ]
        });

        if (existing) return res.status(400).json({ error: "Friendship status already exists" });

        const newFriendship = new Friendship({ requester: requesterId, recipient: recipientId });
        await newFriendship.save();
        res.json({ message: "Request sent" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Accept Request
router.post('/accept', async (req, res) => {
    try {
        const { friendshipId } = req.body;
        await Friendship.findByIdAndUpdate(friendshipId, { status: 'accepted' });
        res.json({ message: "Friend accepted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
