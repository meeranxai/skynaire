const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');

// @route   GET /api/collections
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ message: 'UserId is required' });
        const collections = await Collection.find({ user: userId }).sort({ isDefault: -1, name: 1 });
        res.json(collections);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   POST /api/collections
router.post('/', async (req, res) => {
    try {
        const { userId, name, description, isPublic } = req.body;
        const newCol = new Collection({
            user: userId,
            name,
            description,
            isPublic
        });
        await newCol.save();
        res.status(201).json(newCol);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
