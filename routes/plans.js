const express = require('express');
const FitnessPlan = require('../models/FitnessPlan');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, requireRole('TRAINER'), async (req, res) => {
    try {
        const { title, description, price, durationDays } = req.body;

        if (!title || !description || price === undefined || !durationDays) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const plan = new FitnessPlan({
            title,
            description,
            price,
            durationDays,
            trainerId: req.user.userId
        });

        await plan.save();

        res.status(201).json({
            message: 'Plan created successfully',
            plan
        });
    } catch (error) {
        console.error('Create Plan Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:planId', authenticate, requireRole('TRAINER'), async (req, res) => {
    try {
        const { planId } = req.params;
        const { title, description, price, durationDays } = req.body;

        const plan = await FitnessPlan.findById(planId);

        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        if (plan.trainerId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'You can only edit your own plans' });
        }

        if (title) plan.title = title;
        if (description) plan.description = description;
        if (price !== undefined) plan.price = price;
        if (durationDays) plan.durationDays = durationDays;

        plan.updatedAt = Date.now();
        await plan.save();

        res.json({
            message: 'Plan updated successfully',
            plan
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:planId', authenticate, requireRole('TRAINER'), async (req, res) => {
    try {
        const { planId } = req.params;

        const plan = await FitnessPlan.findById(planId);

        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        if (plan.trainerId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'You can only delete your own plans' });
        }

        await FitnessPlan.findByIdAndDelete(planId);

        res.json({ message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const plans = await FitnessPlan.find().populate('trainerId', 'name email');

        const previewPlans = plans.map(plan => ({
            id: plan._id,
            title: plan.title,
            price: plan.price,
            trainerName: plan.trainerId.name,
            durationDays: plan.durationDays,
            createdAt: plan.createdAt
        }));

        res.json({ plans: previewPlans });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:planId', authenticate, async (req, res) => {
    try {
        const { planId } = req.params;

        const plan = await FitnessPlan.findById(planId).populate('trainerId', 'name email');

        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        const subscription = await Subscription.findOne({
            userId: req.user.userId,
            planId: planId
        });

        if (subscription || req.user.role === 'TRAINER') {
            return res.json({ plan });
        }

        res.json({
            plan: {
                id: plan._id,
                title: plan.title,
                price: plan.price,
                trainerName: plan.trainerId.name,
                durationDays: plan.durationDays,
                message: 'Subscribe to view full details'
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/:planId/subscribe', authenticate, requireRole('USER'), async (req, res) => {
    try {
        const { planId } = req.params;

        const plan = await FitnessPlan.findById(planId);
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        const existingSubscription = await Subscription.findOne({
            userId: req.user.userId,
            planId: planId
        });

        if (existingSubscription) {
            return res.status(400).json({ error: 'Already subscribed to this plan' });
        }

        const subscription = new Subscription({
            userId: req.user.userId,
            planId: planId
        });

        await subscription.save();

        res.status(201).json({
            message: 'Subscription successful',
            subscription
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
