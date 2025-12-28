const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Post = require('../models/Post');
const User = require('../models/User');

// @route   POST /api/reports
// @desc    Submit a new report
router.post('/', async (req, res) => {
    try {
        const {
            reporter, reporterName,
            targetId, targetType, targetOwnerId,
            reasonCategory, description
        } = req.body;

        if (!reporter || !targetId || !reasonCategory) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newReport = new Report({
            reporter,
            reporterName,
            targetId,
            targetType,
            targetOwnerId,
            reasonCategory,
            description
        });

        await newReport.save();

        // Optional: Auto-flag content logic (e.g., if > 5 reports, hide content pending review)
        // For now, just save report.

        // If it's a post, we might want to flag it in the post model (as 'isModerated' or similar)
        // if the severity is high, but let's stick to accumulating reports for now.

        res.status(201).json({ message: "Report submitted successfully", reportId: newReport._id });
    } catch (err) {
        console.error("Report Error:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
