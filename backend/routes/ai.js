/**
 * AI Service Monitoring Dashboard Route
 * Provides real-time metrics and health status for AI intelligence service
 */

const express = require('express');
const router = express.Router();
const ContentIntelligenceService = require('../services/aiIntelligence');

// @route   GET /api/ai/health
// @desc    Health check for AI service
// @access  Admin
router.get('/health', async (req, res) => {
    try {
        const health = await ContentIntelligenceService.healthCheck();
        res.json(health);
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
});

// @route   GET /api/ai/metrics
// @desc    Get AI service performance metrics
// @access  Admin
router.get('/metrics', (req, res) => {
    try {
        const metrics = ContentIntelligenceService.getMetrics();
        res.json({
            success: true,
            metrics,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/ai/analyze
// @desc    Direct AI analysis endpoint (for testing)
// @access  Private
router.post('/analyze', async (req, res) => {
    try {
        const { description, features } = req.body;

        const analysis = await ContentIntelligenceService.analyzeImage(
            null,
            description,
            { features: features || ['all'] }
        );

        res.json({
            success: true,
            analysis
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// @route   POST /api/ai/cache/clear
// @desc    Clear AI analysis cache
// @access  Admin
router.post('/cache/clear', (req, res) => {
    try {
        ContentIntelligenceService.clearCache();
        res.json({
            success: true,
            message: 'AI cache cleared successfully'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
