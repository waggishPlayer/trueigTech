const express = require('express');
const User = require('../models/User');
const TrainerFollower = require('../models/TrainerFollower');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const trainers = await User.find({ role: 'TRAINER' }).select('-passwordHash');
        res.json({ trainers });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:trainerId', async (req, res) => {
    try {
        const { trainerId } = req.params;

        const trainer = await User.findOne({ _id: trainerId, role: 'TRAINER' }).select('-passwordHash');

        if (!trainer) {
            return res.status(404).json({ error: 'Trainer not found' });
        }

        res.json({ trainer });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/:trainerId/follow', authenticate, requireRole('USER'), async (req, res) => {
    try {
        const { trainerId } = req.params;

        const trainer = await User.findOne({ _id: trainerId, role: 'TRAINER' });
        if (!trainer) {
            return res.status(404).json({ error: 'Trainer not found' });
        }

        const existingFollow = await TrainerFollower.findOne({
            userId: req.user.userId,
            trainerId: trainerId
        });

        if (existingFollow) {
            return res.status(400).json({ error: 'Already following this trainer' });
        }

        const follow = new TrainerFollower({
            userId: req.user.userId,
            trainerId: trainerId
        });

        await follow.save();

        res.status(201).json({
            message: 'Successfully followed trainer',
            follow
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:trainerId/unfollow', authenticate, requireRole('USER'), async (req, res) => {
    try {
        const { trainerId } = req.params;

        const result = await TrainerFollower.findOneAndDelete({
            userId: req.user.userId,
            trainerId: trainerId
        });

        if (!result) {
            return res.status(404).json({ error: 'Not following this trainer' });
        }

        res.json({ message: 'Successfully unfollowed trainer' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
