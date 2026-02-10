const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Battle = require('../models/Battle');

const BOSSES = {
    'PROCRASTINATION': { name: 'The Swamp of Procrastination', level: 5, hp: 500, attack: 20, defense: 10, xpReward: 100 },
    'LAZINESS': { name: 'Titan of Laziness', level: 10, hp: 1200, attack: 45, defense: 30, xpReward: 300 },
    'DOUBT': { name: 'Shadow of Doubt', level: 20, hp: 3000, attack: 80, defense: 60, xpReward: 1000 }
};

// Start Battle
router.post('/start', async (req, res) => {
    try {
        const { challengerId, targetId, type, bossId } = req.body;
        const challenger = await Player.findById(challengerId);

        let defender;
        if (type === 'PVP') {
            defender = await Player.findById(targetId);
        } else {
            defender = BOSSES[bossId] || BOSSES['PROCRASTINATION'];
        }

        if (!challenger || !defender) return res.status(404).json({ error: "Fighters not found" });

        // --- BATTLE LOGIC ---
        const log = [];
        log.push(`Battle Started: ${challenger.name} VS ${defender.name}`);

        // Simple turn-based simulation
        let cHp = challenger.hp;
        let dHp = defender.hp || (defender.maxHp || 100);
        let cAtk = (challenger.fitness || 10) + (challenger.level * 2);
        let dAtk = (defender.attack || (defender.fitness || 10) + (defender.level * 2));

        let turn = 0;
        let winnerId = null;

        while (cHp > 0 && dHp > 0 && turn < 20) {
            turn++;
            // Challenger attacks
            const dmg1 = Math.max(1, Math.round(cAtk * (0.8 + Math.random() * 0.4)));
            dHp -= dmg1;
            log.push(`Turn ${turn}: ${challenger.name} hits for ${dmg1} dmg.`);

            if (dHp <= 0) {
                winnerId = challengerId;
                log.push(`${defender.name} has fallen!`);
                break;
            }

            // Defender attacks
            const dmg2 = Math.max(1, Math.round(dAtk * (0.8 + Math.random() * 0.4)));
            cHp -= dmg2;
            log.push(`Turn ${turn}: ${defender.name} hits back for ${dmg2} dmg.`);

            if (cHp <= 0) {
                winnerId = type === 'PVP' ? targetId : null;
                log.push(`${challenger.name} was defeated.`);
                break;
            }
        }

        // --- REWARDS ---
        let ratingChange = 0;
        if (winnerId === challengerId) {
            if (type === 'PVP') ratingChange = 25; // Simple ELO +25
            else {
                // PvE Reward
                challenger.xp += defender.xpReward;
                challenger.battleStats.bossKills += 1;
                log.push(`Victory! Gained ${defender.xpReward} XP.`);
            }
            challenger.battleStats.wins += 1;
            if (type === 'PVP') challenger.rating += ratingChange;
        } else {
            challenger.battleStats.losses += 1;
            if (type === 'PVP') {
                challenger.rating = Math.max(0, challenger.rating - 25);
                ratingChange = -25;
            }
        }
        await challenger.save();

        if (type === 'PVP' && winnerId === targetId) {
            defender.rating += 25;
            defender.battleStats.wins += 1;
            await defender.save();
        }

        const battle = new Battle({
            challengerId,
            defenderId: type === 'PVP' ? targetId : null,
            defenderName: defender.name,
            winnerId,
            type,
            log,
            ratingChange
        });
        await battle.save();

        res.json({ battle, result: winnerId === challengerId ? 'VICTORY' : 'DEFEAT' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get History
router.get('/history/:playerId', async (req, res) => {
    try {
        const battles = await Battle.find({ $or: [{ challengerId: req.params.playerId }, { defenderId: req.params.playerId }] })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(battles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
