const mongoose = require('mongoose');
require('dotenv').config();

async function resetDB() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/solo_leveling_db';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB.');

        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            await collection.deleteMany({});
            console.log(`Cleared collection: ${collection.collectionName}`);
        }

        console.log('Database reset complete.');
        process.exit(0);
    } catch (err) {
        console.error('Reset error:', err);
        process.exit(1);
    }
}

resetDB();
