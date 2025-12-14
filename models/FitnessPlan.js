const mongoose = require('mongoose');

const fitnessPlanSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    durationDays: {
        type: Number,
        required: true,
        min: 1
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('FitnessPlan', fitnessPlanSchema, 'fitnessPlans');
