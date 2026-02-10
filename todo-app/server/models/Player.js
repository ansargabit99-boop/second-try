const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    job: { type: String, default: 'NONE' },
    title: { type: String, default: 'WOLF SLAYER' },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    xpToNextLevel: { type: Number, default: 100 },
    hp: { type: Number, default: 100 },
    maxHp: { type: Number, default: 100 },
    mp: { type: Number, default: 10 },
    maxMp: { type: Number, default: 10 },
    rank: { type: String, default: 'E' },
    gold: { type: Number, default: 0 },

    // --- SOLO LEVELING STATS ---
    // Real-World Hunter Stats
    health: { type: Number, default: 50 },  // Physical well-being
    diet: { type: Number, default: 50 },    // Nutritional status
    iq: { type: Number, default: 100 },      // Intelligence Quotient (Mental)
    fitness: { type: Number, default: 50 }, // Physical performance
    social: { type: Number, default: 50 },  // Social/Communication status
    weight: { type: Number, default: 70 },   // in kg
    height: { type: Number, default: 175 },  // in cm
    // rank: { type: String, default: 'E' },   // Hunter Rank (E to S) - DUPLICATE RESERVED
    statPoints: { type: Number, default: 0 },
    titles: [{ type: String }],             // Earned titles
    activeBonuses: [{
        name: String,
        value: Number,
        type: String // 'xp', 'stat', etc.
    }],

    lastDailyReset: { type: Date, default: Date.now },

    // --- SOCIAL & BATTLE STATS ---
    rating: { type: Number, default: 1000 },
    battleStats: {
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        bossKills: { type: Number, default: 0 }
    },
    badges: [{
        id: String,
        name: String,
        description: String,
        icon: String, // lucide icon name
        unlockedAt: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('Player', PlayerSchema);
