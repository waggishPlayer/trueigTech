const mongoose = require('mongoose');

const trainerFollowerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    followedAt: {
        type: Date,
        default: Date.now
    }
});

trainerFollowerSchema.index({ userId: 1, trainerId: 1 }, { unique: true });

module.exports = mongoose.model('TrainerFollower', trainerFollowerSchema, 'trainerFollowers');
