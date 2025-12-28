
/**
 * PREDICTIVE INTENT ENGINE (V2.0)
 * Anticipates user needs before they are explicitly expressed.
 */

const EventEmitter = require('events');

class PredictiveEngine extends EventEmitter {
    constructor() {
        super();
        this.userContexts = new Map(); // Store recent user history
        this.transitionMatrix = new Map(); // Store page transition probabilities
    }

    /**
     * Update user context and generate prediction
     * @param {string} userId - User ID
     * @param {string} currentPath - Current page path
     * @param {string} interactionType - Click, scroll, etc.
     */
    processSignal(userId, currentPath, interactionType) {
        // 1. Update Transition Matrix (Learning)
        this.learnPattern(userId, currentPath);

        // 2. Generate Prediction
        const prediction = this.predictNextAction(userId, currentPath);

        return prediction;
    }

    /**
     * Learn from user movement (Simple Markov Chain)
     */
    learnPattern(userId, currentPath) {
        const lastPath = this.getLastPath(userId);
        if (lastPath && lastPath !== currentPath) {
            const key = `${lastPath}->${currentPath}`;
            this.transitionMatrix.set(key, (this.transitionMatrix.get(key) || 0) + 1);
        }
        this.setLastPath(userId, currentPath);
    }

    /**
     * Predict next likely action/page
     */
    predictNextAction(userId, currentPath) {
        // Find all transitions from currentPath
        const candidates = [];
        for (const [key, count] of this.transitionMatrix.entries()) {
            if (key.startsWith(`${currentPath}->`)) {
                const target = key.split('->')[1];
                candidates.push({ target, count });
            }
        }

        if (candidates.length === 0) return null;

        // Calculate probabilities
        const total = candidates.reduce((sum, c) => sum + c.count, 0);
        const topCandidate = candidates.sort((a, b) => b.count - a.count)[0];

        const confidence = topCandidate.count / total;

        // Threshold for prediction
        if (confidence > 0.4) { // 40% confidence
            return {
                type: 'optimization',
                action: 'preload_route',
                target: topCandidate.target,
                confidence: parseFloat(confidence.toFixed(2)),
                reason: `User frequently navigates from ${currentPath} to ${topCandidate.target}`
            };
        }

        return null;
    }

    getLastPath(userId) {
        return this.userContexts.get(userId)?.lastPath;
    }

    setLastPath(userId, path) {
        const context = this.userContexts.get(userId) || {};
        context.lastPath = path;
        context.lastUpdate = Date.now();
        this.userContexts.set(userId, context);
    }
}

module.exports = PredictiveEngine;
