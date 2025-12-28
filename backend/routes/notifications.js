const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Notification API Routes (Phase 12)
router.get('/:userId', async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id/read', async (req, res) => {
    try {
        const notif = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.json(notif);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/read-all/:userId', async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.params.userId, isRead: false },
            { isRead: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/unread-count/:userId', async (req, res) => {
    try {
        const count = await Notification.countDocuments({ recipient: req.params.userId, isRead: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
