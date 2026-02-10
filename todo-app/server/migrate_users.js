const mongoose = require('mongoose');
const Player = require('./models/Player');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/solo_leveling_db')
    .then(async () => {
        console.log("Connected to DB");

        // Delete all users without passwords (legacy users)
        const result = await Player.deleteMany({ password: { $exists: false } });
        console.log(`Deleted ${result.deletedCount} legacy users without passwords`);

        const remaining = await Player.find({});
        console.log(`Remaining users: ${remaining.length}`);

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
