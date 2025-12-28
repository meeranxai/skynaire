/**
 * AI AUTONOMOUS SYSTEM API ROUTES
 * Public endpoints for the autonomous AI design system
 */

const express = require('express');
const router = express.Router();
const aiController = require('../ai/AIController');
const contentCurator = require('../ai/curators/ContentCurator');
const supportAgent = require('../ai/support/SupportAgent');
const trainingManager = require('../ai/training/TrainingDataManager');

// ============================================
// TRACKING ENDPOINTS
// ============================================

// @route   POST /api/autonomous/track/interaction
// @desc    Track user interaction event
router.post('/track/interaction', (req, res) => {
    try {
        const event = aiController.trackInteraction(req.body);
        res.json({ success: true, event });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/autonomous/track/engagement
// @desc    Track user engagement event
router.post('/track/engagement', (req, res) => {
    try {
        const event = aiController.trackEngagement(req.body);
        res.json({ success: true, event });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/autonomous/track/performance
// @desc    Track performance metrics
router.post('/track/performance', (req, res) => {
    try {
        const metric = aiController.trackPerformance(req.body);
        res.json({ success: true, metric });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================
// THEME & PERSONALIZATION
// ============================================

// @route   GET /api/autonomous/theme/platform
// @desc    Get current platform theme
router.get('/theme/platform', (req, res) => {
    try {
        const theme = aiController.getCurrentTheme();
        res.json({ success: true, theme });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   GET /api/autonomous/theme/user/:userId
// @desc    Get personalized theme for user
router.get('/theme/user/:userId', (req, res) => {
    try {
        const userPreferences = req.query.preferences ? JSON.parse(req.query.preferences) : null;
        const theme = aiController.getPersonalizedTheme(req.params.userId, userPreferences);
        res.json({ success: true, theme });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================
// INSIGHTS & ANALYTICS
// ============================================

// @route   GET /api/autonomous/insights
// @desc    Get platform insights
router.get('/insights', (req, res) => {
    try {
        const insights = aiController.getInsights();
        res.json({ success: true, insights });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   GET /api/autonomous/status
// @desc    Get AI system status
router.get('/status', (req, res) => {
    try {
        const status = aiController.getStatus();
        res.json({ success: true, status });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================
// CONTROL ENDPOINTS
// ============================================

// @route   POST /api/autonomous/optimize
// @desc    Manually trigger optimization
router.post('/optimize', async (req, res) => {
    try {
        await aiController.manualOptimize();
        res.json({ success: true, message: 'Optimization triggered' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   GET /api/autonomous/changes
// @desc    Get recent changes
router.get('/changes', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const changes = aiController.getChangeHistory(limit);
        res.json({ success: true, changes });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/autonomous/rollback/:changeId
// @desc    Rollback a specific change
router.post('/rollback/:changeId', (req, res) => {
    try {
        const result = aiController.rollbackChange(req.params.changeId);
        res.json({ success: result.success, ...result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/autonomous/settings/autonomy
// @desc    Set autonomy level
router.post('/settings/autonomy', (req, res) => {
    try {
        const { level } = req.body;
        const result = aiController.setAutonomyLevel(level);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/autonomous/settings/enabled
// @desc    Enable/disable system
router.post('/settings/enabled', (req, res) => {
    try {
        const { enabled } = req.body;
        const result = aiController.setEnabled(enabled);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================
// DASHBOARD DATA
// ============================================

// @route   GET /api/autonomous/dashboard
// @desc    Get comprehensive dashboard data
router.get('/dashboard', (req, res) => {
    try {
        const status = aiController.getStatus();
        const insights = aiController.getInsights();
        const changes = aiController.getChangeHistory(5);

        res.json({
            success: true,
            dashboard: {
                system: status,
                insights: insights,
                recentChanges: changes,
                timestamp: Date.now()
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/autonomous/support/chat
// @desc    Process support chat (Gemini)
router.post('/support/chat', async (req, res) => {
    try {
        const { message, userContext } = req.body;
        const reply = await supportAgent.chat(message, userContext);
        res.json({ success: true, reply });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================
// AI CONTENT INTELLIGENCE ROUTES
// ============================================

// @route   POST /api/autonomous/content/enhance
// @desc    Enhance post content (Gemini)
router.post('/content/enhance', async (req, res) => {
    try {
        const result = await contentCurator.enhancePost(req.body.content);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/autonomous/content/analyze
// @desc    Analyze viral potential (Groq)
router.post('/content/analyze', async (req, res) => {
    try {
        const result = await contentCurator.predictViralPotential(req.body.content);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/autonomous/content/moderate
// @desc    Fast safety check (Groq)
router.post('/content/moderate', async (req, res) => {
    try {
        const result = await contentCurator.moderateContent(req.body.content);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================
// CHATBOT TRAINING SYSTEM ROUTES
// ============================================

// @route   POST /api/autonomous/training/feedback
// @desc    Record user feedback on chatbot response
router.post('/training/feedback', async (req, res) => {
    try {
        const { conversationId, helpful, feedback } = req.body;
        const success = await trainingManager.recordFeedback(conversationId, helpful, feedback);
        res.json({ success });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   GET /api/autonomous/training/stats
// @desc    Get training data statistics
router.get('/training/stats', (req, res) => {
    try {
        const stats = trainingManager.getStats();
        res.json({ success: true, stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   GET /api/autonomous/training/pending
// @desc    Get pending conversations for review (Admin only)
router.get('/training/pending', (req, res) => {
    try {
        const pending = trainingManager.getPendingConversations();
        res.json({ success: true, pending });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/autonomous/training/moderate
// @desc    Approve or reject a conversation (Admin only)
router.post('/training/moderate', async (req, res) => {
    try {
        const { conversationId, approve } = req.body;
        const success = await trainingManager.moderateConversation(conversationId, approve);
        res.json({ success });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
