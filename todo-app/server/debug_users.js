const mongoose = require('mongoose');
const Player = require('./models/Player');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/solo_leveling_db')
    .then(async () => {
        console.log("Connected to DB");
        const users = await Player.find({});
        console.log("Users found:", users);
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
