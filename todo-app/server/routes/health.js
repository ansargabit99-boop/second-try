const express = require('express');
const router = express.Router();
const FoodLog = require('../models/FoodLog');

// Get Daily Logs
router.get('/nutrition/:playerId', async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const logs = await FoodLog.find({
            playerId: req.params.playerId,
            date: { $gte: startOfDay }
        });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Food
router.post('/nutrition', async (req, res) => {
    try {
        console.log('Received Nutrition POST:', JSON.stringify(req.body, null, 2));
        const { playerId, name, calories, protein, carbs, fat } = req.body;

        if (!playerId) throw new Error('Player ID is required');

        const newLog = new FoodLog({ playerId, name, calories, protein, carbs, fat });
        await newLog.save();
        console.log('Food Log saved successfully:', newLog._id);

        // Check if today's goal is met after this addition
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const logs = await FoodLog.find({
            playerId: playerId,
            date: { $gte: startOfDay }
        });

        const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
        const targetCalories = 2500;

        let reward = null;
        if (totalCalories >= targetCalories) {
            // Check if already rewarded today
            const Player = require('../models/Player');
            const player = await Player.findById(playerId);

            if (player) {
                const lastDailyReset = player.lastDailyReset ? new Date(player.lastDailyReset) : new Date(0);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (lastDailyReset < today) {
                    // Update new stats: Fitness and Health
                    player.fitness = (player.fitness || 50) + 1;
                    player.health = (player.health || 50) + 1;
                    player.lastDailyReset = new Date();
                    await player.save();
                    reward = {
                        message: 'DAILY GOAL MET: +1 FITNESS, +1 HEALTH',
                        stats: { fitness: player.fitness, health: player.health }
                    };
                    console.log('Daily goal reached and reward granted for player:', playerId);
                }
            } else {
                console.warn('Reward check failed: Player not found:', playerId);
            }
        }

        res.json({ log: newLog, reward });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
