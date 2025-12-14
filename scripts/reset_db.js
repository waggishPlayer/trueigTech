const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const FitnessPlan = require('../models/FitnessPlan');
const Subscription = require('../models/Subscription');
const TrainerFollower = require('../models/TrainerFollower');

const resetDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for reset...');

        console.log('Deleting Users...');
        await User.deleteMany({});

        console.log('Deleting Fitness Plans...');
        await FitnessPlan.deleteMany({});

        console.log('Deleting Subscriptions...');
        await Subscription.deleteMany({});

        console.log('Deleting Trainer Followers...');
        await TrainerFollower.deleteMany({});

        console.log('Database cleared successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
};

resetDb();
