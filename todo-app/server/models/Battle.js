const mongoose = require('mongoose');

const BattleSchema = new mongoose.Schema({
    challengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    defenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }, // Null for PvE bosses
    defenderName: { type: String }, // For Bosses or snapshot of player name
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    type: { type: String, enum: ['PVP', 'PVE'], required: true },
    log: [{ type: String }], // Text description of what happened
    ratingChange: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Battle', BattleSchema);
