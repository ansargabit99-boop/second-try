const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    title: { type: String, required: true },
    description: { type: String },
    difficulty: { type: String, enum: ['E', 'D', 'C', 'B', 'A', 'S'], default: 'E' },
    xpReward: { type: Number, default: 10 },
    goldReward: { type: Number, default: 0 },
    isDaily: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    failed: { type: Boolean, default: false },
    dueDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quest', QuestSchema);
