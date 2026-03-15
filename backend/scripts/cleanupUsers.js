const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Avoid relying on connectDB since it logs differently or might do other things.
// Just connect directly for the script.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const cleanupUsers = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI is not defined in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Cleanup Script');

        console.log('Starting cleanup of unverified users...');
        const result = await User.deleteMany({ isVerified: false });

        console.log(`Successfully deleted ${result.deletedCount} unverified users.`);

        // Disconnect and exit
        await mongoose.disconnect();
        console.log('MongoDB Disconnected');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
};

cleanupUsers();
