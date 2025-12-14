const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FitnessPlan',
        required: true
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    }
});

subscriptionSchema.index({ userId: 1, planId: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema, 'subscriptions');
