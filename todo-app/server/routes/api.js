const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Quest = require('../models/Quest');

// --- PLAYER ROUTES ---

// Get Player (Login/Init)
router.get('/player/:name', async (req, res) => {
    try {
        let player = await Player.findOne({ name: req.params.name });
        if (!player) {
            // Create new player if not exists
            player = new Player({
                name: req.params.name,
                email: `${req.params.name}@example.com`.toLowerCase(),
                password: '$2a$10$DUMMYHASHFORQUICKPLAY' // Dummy hash
            });
            await player.save();
        }
        res.json(player);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Player Stats
router.put('/player/:id', async (req, res) => {
    try {
        const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(player);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- QUEST ROUTES ---

// Get Quests for Player
router.get('/quests/:playerId', async (req, res) => {
    try {
        const quests = await Quest.find({ playerId: req.params.playerId });
        res.json(quests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Quest
router.post('/quests', async (req, res) => {
    try {
        const quest = new Quest(req.body);
        await quest.save();
        res.json(quest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Quest (Complete/Fail)
router.put('/quests/:id', async (req, res) => {
    try {
        const quest = await Quest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(quest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Quest
router.delete('/quests/:id', async (req, res) => {
    try {
        await Quest.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quest deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
