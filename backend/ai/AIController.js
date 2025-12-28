/**
 * AI AUTONOMOUS CONTROLLER
 * Coordinates all AI agents and manages the autonomous design system
 */

const ObserverAgent = require('./observers/ObserverAgent');
const DesignerAgent = require('./designers/DesignerAgent');
const PredictiveEngine = require('./engines/PredictiveEngine');
const NeuralCore = require('./core/NeuralCore');
const ConsciousnessLayer = require('./core/ConsciousnessLayer');
const EventEmitter = require('events');

class AIController extends EventEmitter {
    constructor() {
        super();

        // Initialize agents
        this.observerAgent = new ObserverAgent();
        this.designerAgent = new DesignerAgent();
        this.predictiveEngine = new PredictiveEngine();

        // V3.0 Systems
        this.neuralCore = new NeuralCore();
        this.consciousness = new ConsciousnessLayer(this.neuralCore);

        // System state
        this.state = {
            enabled: process.env.AI_ENABLED === 'true',
            autonomyLevel: process.env.AI_AUTONOMY_LEVEL || 'medium',
            lastOptimization: null,
            totalOptimizations: 0,
            systemHealth: 'healthy'
        };

        // Configuration
        this.config = {
            microCycleInterval: 5 * 60 * 1000, // 5 minutes
            standardCycleInterval: 30 * 60 * 1000, // 30 minutes
            majorCycleInterval: 24 * 60 * 60 * 1000, // 24 hours
            enableRollback: process.env.AI_ENABLE_ROLLBACK !== 'false',
            userNotifications: process.env.AI_USER_NOTIFICATION !== 'false'
        };

        // Connect agents
        this.connectAgents();

        // Start autonomous cycles
        if (this.state.enabled) {
            this.startAutonomousCycles();
        }

        // V3 Neural Listeners
        this.neuralCore.on('dreamStateActive', (stats) => {
            // Log only in development or if synapses exist
            if (process.env.NODE_ENV !== 'production' && stats.synapses > 0) {
                console.log('[Neural Core] Consolidating memories in Dream State...', stats);
            }
        });

        console.log('[AI Controller] Initialized', {
            enabled: this.state.enabled,
            autonomy: this.state.autonomyLevel
        });
    }

    /**
     * Connect agents for collaboration
     */
    connectAgents() {
        // Observer → Designer pipeline
        this.observerAgent.on('analysis', async (analysis) => {
            console.log('[AI Controller] Received analysis from Observer');

            // Only proceed if autonomy allows
            if (this.shouldOptimize(analysis)) {
                await this.triggerOptimization(analysis);
            }
        });

        // Designer change notifications
        this.designerAgent.on('designChange', (change) => {
            console.log('[AI Controller] Design change applied:', change.changes.length, 'modifications');
            this.emit('systemUpdate', {
                type: 'design',
                change: change
            });
        });

        // Observer slow page alerts
        this.observerAgent.on('slowPage', (metric) => {
            console.log('[AI Controller] Slow page detected:', metric.page, metric.loadTime + 'ms');
            this.emit('performanceAlert', metric);
        });

        // Observer engagement events
        this.observerAgent.on('engagement', (event) => {
            // Could trigger real-time adjustments
            if (this.state.autonomyLevel === 'high' || this.state.autonomyLevel === 'full') {
                // Real-time micro-adjustments
            }
        });
    }

    /**
     * Determine if optimization should run
     */
    shouldOptimize(analysis) {
        // Always allow if full autonomy
        if (this.state.autonomyLevel === 'full') return true;

        // Check if issues are significant enough
        const hasHighFriction = analysis.frictionPoints && analysis.frictionPoints.length > 0;
        const hasSlowPages = analysis.avgLoadTime > 3000;
        const hasDropOffs = analysis.dropOffPages && analysis.dropOffPages.length > 0;
        const lowEngagement = analysis.clickRate < 0.1;

        // Low autonomy: only critical issues
        if (this.state.autonomyLevel === 'low') {
            return hasSlowPages || (hasHighFriction && hasDropOffs);
        }

        // Medium autonomy: significant issues
        if (this.state.autonomyLevel === 'medium') {
            return hasHighFriction || hasSlowPages || hasDropOffs || lowEngagement;
        }

        // High autonomy: any improvement opportunity
        if (this.state.autonomyLevel === 'high') {
            return true;
        }

        return false;
    }

    /**
     * Trigger autonomous optimization
     */
    async triggerOptimization(analysis) {
        try {
            console.log('[AI Controller] Starting optimization cycle...');

            // Get AI recommendations
            const recommendations = await this.designerAgent.analyzeAndRecommend(analysis);

            // Apply changes if appropriate
            if (recommendations.priority === 'high' || this.state.autonomyLevel !== 'low') {
                const result = await this.designerAgent.applyChanges(recommendations);

                if (result.applied) {
                    this.state.lastOptimization = Date.now();
                    this.state.totalOptimizations++;

                    // Notify
                    this.emit('optimizationComplete', {
                        timestamp: Date.now(),
                        analysis: analysis,
                        recommendations: recommendations,
                        result: result
                    });

                    console.log('[AI Controller] Optimization complete:', result.count, 'changes applied');
                } else {
                    console.log('[AI Controller] Optimization deferred:', result.reason);
                }
            } else {
                console.log('[AI Controller] Optimization skipped: low priority and low autonomy');
            }

        } catch (error) {
            console.error('[AI Controller] Optimization failed:', error);
            this.state.systemHealth = 'degraded';
        }
    }

    /**
     * Start autonomous optimization cycles
     */
    startAutonomousCycles() {
        // Micro-cycle (5 minutes)
        setInterval(() => {
            console.log('[AI Controller] Micro-cycle: Quick analysis');
            const analysis = this.observerAgent.analyzePatterns();

            // Micro-cycles only handle critical issues
            if (analysis.avgLoadTime > 5000 || (analysis.frictionPoints && analysis.frictionPoints[0]?.frictionScore > 0.5)) {
                this.triggerOptimization(analysis);
            }
        }, this.config.microCycleInterval);

        // Standard cycle (30 minutes)
        setInterval(async () => {
            console.log('[AI Controller] Standard cycle: Full optimization');
            const analysis = this.observerAgent.analyzePatterns();
            await this.triggerOptimization(analysis);
        }, this.config.standardCycleInterval);

        // Major cycle (24 hours)
        setInterval(() => {
            console.log('[AI Controller] Major cycle: Platform-wide analysis');
            this.performMajorCycle();
        }, this.config.majorCycleInterval);

        console.log('[AI Controller] Autonomous cycles started:', {
            micro: '5min',
            standard: '30min',
            major: '24h'
        });
    }

    /**
     * Perform major platform analysis
     */
    async performMajorCycle() {
        try {
            // Get comprehensive analysis
            const analysis = this.observerAgent.analyzePatterns();

            // Get AI recommendations with deeper analysis
            const recommendations = await this.designerAgent.analyzeAndRecommend({
                ...analysis,
                cycleType: 'major',
                historicalData: this.getHistoricalMetrics()
            });

            // Apply changes more aggressively in major cycles
            if (recommendations.changes && recommendations.changes.length > 0) {
                await this.designerAgent.applyChanges(recommendations);
            }

            // Emit major cycle complete
            this.emit('majorCycleComplete', {
                timestamp: Date.now(),
                analysis: analysis,
                recommendations: recommendations
            });

            console.log('[AI Controller] Major cycle complete');

        } catch (error) {
            console.error('[AI Controller] Major cycle failed:', error);
        }
    }

    /**
     * Get historical metrics
     */
    getHistoricalMetrics() {
        return {
            totalOptimizations: this.state.totalOptimizations,
            lastOptimization: this.state.lastOptimization,
            observerStats: this.observerAgent.getStats(),
            designerStats: this.designerAgent.getStats()
        };
    }

    /**
     * Track interaction (public API)
     */
    trackInteraction(data) {
        if (!this.state.enabled) return null;

        // V2: Predictive Engine Process
        if (data.type === 'page_view' || data.type === 'click') {
            const prediction = this.predictiveEngine.processSignal(data.userId, data.page, data.type);
            if (prediction) {
                this.emit('prediction', prediction);
            }
        }

        // V3: Neural Stimulation
        this.neuralCore.stimulate(data.type, 'user-' + data.userId, data.page || 'global');

        return this.observerAgent.trackInteraction(data);
    }

    /**
     * Track engagement (public API)
     */
    trackEngagement(data) {
        if (!this.state.enabled) return null;
        return this.observerAgent.trackEngagement(data);
    }

    /**
     * Track performance (public API)
     */
    trackPerformance(data) {
        if (!this.state.enabled) return null;
        return this.observerAgent.trackPerformance(data);
    }

    /**
     * Get current platform theme (public API)
     */
    getCurrentTheme() {
        return this.designerAgent.getCurrentTheme();
    }

    /**
     * Get personalized theme for user (public API)
     */
    getPersonalizedTheme(userId, userPreferences) {
        return this.designerAgent.getPersonalizedTheme(userId, userPreferences);
    }

    /**
     * Get system status (public API)
     */
    getStatus() {
        return {
            enabled: this.state.enabled,
            autonomyLevel: this.state.autonomyLevel,
            systemHealth: this.state.systemHealth,
            lastOptimization: this.state.lastOptimization,
            totalOptimizations: this.state.totalOptimizations,
            observer: this.observerAgent.getStats(),
            designer: this.designerAgent.getStats(),
            // V2 Stats
            predictive: {
                activeContexts: this.predictiveEngine.userContexts.size,
                learnedPatterns: this.predictiveEngine.transitionMatrix.size
            },
            // V3 Stats
            neural: this.neuralCore.getNetworkTopology(),
            consciousness: this.consciousness.perceive(this.neuralCore.getNetworkTopology())
        };
    }

    /**
     * Get change history (public API)
     */
    getChangeHistory(limit = 10) {
        return this.designerAgent.designHistory.slice(-limit).reverse();
    }

    /**
     * Rollback a change (public API)
     */
    rollbackChange(changeId) {
        return this.designerAgent.rollback(changeId);
    }

    /**
     * Manual optimization trigger (public API)
     */
    async manualOptimize() {
        console.log('[AI Controller] Manual optimization triggered');
        const analysis = this.observerAgent.analyzePatterns();
        return await this.triggerOptimization(analysis);
    }

    /**
     * Set autonomy level (public API)
     */
    setAutonomyLevel(level) {
        if (['low', 'medium', 'high', 'full'].includes(level)) {
            this.state.autonomyLevel = level;
            console.log('[AI Controller] Autonomy level set to:', level);
            return { success: true, level: level };
        }
        return { success: false, error: 'Invalid autonomy level' };
    }

    /**
     * Enable/disable system (public API)
     */
    setEnabled(enabled) {
        this.state.enabled = enabled;

        if (enabled && !this.cyclesStarted) {
            this.startAutonomousCycles();
            this.cyclesStarted = true;
        }

        console.log('[AI Controller] System', enabled ? 'enabled' : 'disabled');
        return { success: true, enabled: enabled };
    }

    /**
     * Get insights (public API)
     */
    getInsights() {
        const analysis = this.observerAgent.analyzePatterns();

        return {
            timestamp: Date.now(),
            engagement: {
                total: analysis.totalEngagements,
                sentiment: analysis.overallSentiment,
                topFeatures: analysis.topFeatures
            },
            performance: {
                avgLoadTime: analysis.avgLoadTime,
                avgFCP: analysis.avgFCP,
                avgLCP: analysis.avgLCP
            },
            users: {
                activeSessions: analysis.activeSessions,
                avgSessionDuration: analysis.avgSessionDuration,
                deviceBreakdown: analysis.deviceBreakdown
            },
            issues: {
                frictionPoints: analysis.frictionPoints,
                dropOffPages: analysis.dropOffPages
            }
        };
    }
}

// Export singleton instance
const aiController = new AIController();
module.exports = aiController;
