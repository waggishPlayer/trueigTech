require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plans');
const trainerRoutes = require('./routes/trainers');
const feedRoutes = require('./routes/feed');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/auth', authRoutes);
app.use('/plans', planRoutes);
app.use('/trainers', trainerRoutes);
app.use('/feed', feedRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'FitPlanHub API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
