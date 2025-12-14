const express = require('express');
const FitnessPlan = require('../models/FitnessPlan');
const TrainerFollower = require('../models/TrainerFollower');
const Subscription = require('../models/Subscription');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, requireRole('USER'), async (req, res) => {
    try {
        const followedTrainers = await TrainerFollower.find({ userId: req.user.userId });

        const trainerIds = followedTrainers.map(f => f.trainerId);

        const plans = await FitnessPlan.find({ trainerId: { $in: trainerIds } })
            .populate('trainerId', 'name email')
            .sort({ createdAt: -1 });

        const userSubscriptions = await Subscription.find({ userId: req.user.userId });
        const subscribedPlanIds = new Set(userSubscriptions.map(sub => sub.planId.toString()));

        const feedItems = plans.map(plan => ({
            id: plan._id,
            title: plan.title,
            description: plan.description,
            price: plan.price,
            durationDays: plan.durationDays,
            trainer: {
                id: plan.trainerId._id,
                name: plan.trainerId.name,
                email: plan.trainerId.email
            },
            isPurchased: subscribedPlanIds.has(plan._id.toString()),
            createdAt: plan.createdAt
        }));

        res.json({ feed: feedItems });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
