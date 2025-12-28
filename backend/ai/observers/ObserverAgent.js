/**
 * OBSERVER AGENT - User Behavior Tracking & Analysis
 * Continuously monitors user interactions and engagement patterns
 */

const EventEmitter = require('events');

class ObserverAgent extends EventEmitter {
    constructor() {
        super();
        this.userSessions = new Map();
        this.interactions = [];
        this.engagements = [];
        this.performanceMetrics = [];
        this.heatmapData = new Map();
        this.frictionPoints = new Map();

        // Configuration
        this.config = {
            batchSize: 100,
            analysisInterval: 5 * 60 * 1000, // 5 minutes
            frictionThreshold: 0.3, // 30% drop-off
            slowLoadThreshold: 3000, // 3 seconds
        };

        // Start analysis cycle
        this.startAnalysisCycle();
    }

    /**
     * Track user interaction event
     */
    trackInteraction(data) {
        const event = {
            userId: data.userId,
            sessionId: data.sessionId,
            type: data.type, // click, scroll, hover, keypress
            target: data.target, // element identifier
            coordinates: data.coordinates, // x, y positions
            timestamp: Date.now(),
            page: data.page,
            device: data.device,
            viewport: data.viewport
        };

        this.interactions.push(event);

        // Update heatmap
        this.updateHeatmap(event);

        // Update session
        this.updateSession(data.userId, data.sessionId);

        // Trim if too large
        if (this.interactions.length > 10000) {
            this.interactions = this.interactions.slice(-5000);
        }

        return event;
    }

    /**
     * Track engagement event
     */
    trackEngagement(data) {
        const event = {
            userId: data.userId,
            type: data.type, // like, comment, share, follow, post
            targetId: data.targetId,
            targetType: data.targetType, // post, user, story
            timestamp: Date.now(),
            sentiment: data.sentiment, // positive, neutral, negative
            context: data.context
        };

        this.engagements.push(event);

        // Emit for real-time processing
        this.emit('engagement', event);

        // Trim if too large
        if (this.engagements.length > 10000) {
            this.engagements = this.engagements.slice(-5000);
        }

        return event;
    }

    /**
     * Track performance metrics
     */
    trackPerformance(data) {
        const metric = {
            userId: data.userId,
            page: data.page,
            loadTime: data.loadTime,
            fcp: data.fcp, // First Contentful Paint
            lcp: data.lcp, // Largest Contentful Paint
            fid: data.fid, // First Input Delay
            cls: data.cls, // Cumulative Layout Shift
            ttfb: data.ttfb, // Time to First Byte
            timestamp: Date.now(),
            device: data.device,
            connection: data.connection
        };

        this.performanceMetrics.push(metric);

        // Detect slow pages
        if (metric.loadTime > this.config.slowLoadThreshold) {
            this.emit('slowPage', metric);
        }

        // Trim if too large
        if (this.performanceMetrics.length > 5000) {
            this.performanceMetrics = this.performanceMetrics.slice(-2500);
        }

        return metric;
    }

    /**
     * Update user session
     */
    updateSession(userId, sessionId) {
        const key = `${userId}-${sessionId}`;

        if (!this.userSessions.has(key)) {
            this.userSessions.set(key, {
                userId,
                sessionId,
                startTime: Date.now(),
                lastActivity: Date.now(),
                interactions: 0,
                engagements: 0,
                pagesVisited: new Set(),
                featuresUsed: new Set()
            });
        }

        const session = this.userSessions.get(key);
        session.lastActivity = Date.now();
        session.interactions++;

        return session;
    }

    /**
     * Update heatmap data
     */
    updateHeatmap(event) {
        if (event.type === 'click' || event.type === 'hover') {
            const key = `${event.page}-${Math.floor(event.coordinates.x / 50)}-${Math.floor(event.coordinates.y / 50)}`;

            if (!this.heatmapData.has(key)) {
                this.heatmapData.set(key, {
                    page: event.page,
                    x: Math.floor(event.coordinates.x / 50) * 50,
                    y: Math.floor(event.coordinates.y / 50) * 50,
                    clicks: 0,
                    hovers: 0
                });
            }

            const heatpoint = this.heatmapData.get(key);
            if (event.type === 'click') heatpoint.clicks++;
            if (event.type === 'hover') heatpoint.hovers++;
        }
    }

    /**
     * Analyze user behavior patterns
     */
    analyzePatterns() {
        const now = Date.now();
        const last5Minutes = now - (5 * 60 * 1000);

        // Recent interactions
        const recentInteractions = this.interactions.filter(i => i.timestamp > last5Minutes);
        const recentEngagements = this.engagements.filter(e => e.timestamp > last5Minutes);
        const recentPerformance = this.performanceMetrics.filter(p => p.timestamp > last5Minutes);

        // Calculate metrics
        const analysis = {
            timestamp: now,
            period: '5minutes',

            // Interaction metrics
            totalInteractions: recentInteractions.length,
            clickRate: recentInteractions.filter(i => i.type === 'click').length / Math.max(recentInteractions.length, 1),
            scrollDepth: this.calculateScrollDepth(recentInteractions),
            hoverPatterns: this.analyzeHoverPatterns(recentInteractions),

            // Engagement metrics
            totalEngagements: recentEngagements.length,
            likeRate: recentEngagements.filter(e => e.type === 'like').length,
            commentRate: recentEngagements.filter(e => e.type === 'comment').length,
            shareRate: recentEngagements.filter(e => e.type === 'share').length,
            postCreationRate: recentEngagements.filter(e => e.type === 'post').length,

            // Performance metrics
            avgLoadTime: recentPerformance.reduce((sum, p) => sum + p.loadTime, 0) / Math.max(recentPerformance.length, 1),
            avgFCP: recentPerformance.reduce((sum, p) => sum + (p.fcp || 0), 0) / Math.max(recentPerformance.length, 1),
            avgLCP: recentPerformance.reduce((sum, p) => sum + (p.lcp || 0), 0) / Math.max(recentPerformance.length, 1),
            avgCLS: recentPerformance.reduce((sum, p) => sum + (p.cls || 0), 0) / Math.max(recentPerformance.length, 1),

            // Session metrics
            activeSessions: Array.from(this.userSessions.values()).filter(s => s.lastActivity > last5Minutes).length,
            avgSessionDuration: this.calculateAvgSessionDuration(),

            // Friction detection
            frictionPoints: this.detectFrictionPoints(recentInteractions),
            dropOffPages: this.detectDropOffPages(),

            // Device breakdown
            deviceBreakdown: this.analyzeDeviceDistribution(recentInteractions),

            // Popular features
            topFeatures: this.identifyTopFeatures(recentInteractions),

            // Sentiment
            overallSentiment: this.analyzeSentiment(recentEngagements)
        };

        // Emit analysis
        this.emit('analysis', analysis);

        return analysis;
    }

    /**
     * Calculate scroll depth
     */
    calculateScrollDepth(interactions) {
        const scrollEvents = interactions.filter(i => i.type === 'scroll');
        if (scrollEvents.length === 0) return 0;

        const depths = scrollEvents.map(e => e.coordinates?.y || 0);
        return depths.reduce((sum, d) => sum + d, 0) / depths.length;
    }

    /**
     * Analyze hover patterns
     */
    analyzeHoverPatterns(interactions) {
        const hovers = interactions.filter(i => i.type === 'hover');
        const elementsHovered = {};

        hovers.forEach(h => {
            const key = h.target;
            elementsHovered[key] = (elementsHovered[key] || 0) + 1;
        });

        return Object.entries(elementsHovered)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([element, count]) => ({ element, count }));
    }

    /**
     * Detect friction points
     */
    detectFrictionPoints(interactions) {
        const clicksByElement = {};
        const errorProne = [];

        interactions.forEach(i => {
            if (i.type === 'click') {
                const key = i.target;
                if (!clicksByElement[key]) {
                    clicksByElement[key] = { total: 0, repeated: 0 };
                }
                clicksByElement[key].total++;

                // Check for rapid repeated clicks (frustration indicator)
                const recentClicks = interactions.filter(x =>
                    x.target === key &&
                    x.timestamp > (i.timestamp - 2000) &&
                    x.timestamp < i.timestamp
                );

                if (recentClicks.length > 2) {
                    clicksByElement[key].repeated++;
                }
            }
        });

        // Identify high-friction elements
        Object.entries(clicksByElement).forEach(([element, data]) => {
            const frictionScore = data.repeated / Math.max(data.total, 1);
            if (frictionScore > this.config.frictionThreshold) {
                errorProne.push({ element, frictionScore, clicks: data.total });
            }
        });

        return errorProne.sort((a, b) => b.frictionScore - a.frictionScore).slice(0, 5);
    }

    /**
     * Detect drop-off pages
     */
    detectDropOffPages() {
        const pageSessions = {};

        this.userSessions.forEach(session => {
            session.pagesVisited.forEach(page => {
                if (!pageSessions[page]) {
                    pageSessions[page] = { visits: 0, bounces: 0 };
                }
                pageSessions[page].visits++;

                // Consider bounce if session < 30 seconds
                if (session.lastActivity - session.startTime < 30000) {
                    pageSessions[page].bounces++;
                }
            });
        });

        return Object.entries(pageSessions)
            .map(([page, data]) => ({
                page,
                visits: data.visits,
                bounceRate: data.bounces / Math.max(data.visits, 1)
            }))
            .filter(p => p.bounceRate > 0.5)
            .sort((a, b) => b.bounceRate - a.bounceRate)
            .slice(0, 5);
    }

    /**
     * Calculate average session duration
     */
    calculateAvgSessionDuration() {
        const sessions = Array.from(this.userSessions.values());
        if (sessions.length === 0) return 0;

        const durations = sessions.map(s => s.lastActivity - s.startTime);
        return durations.reduce((sum, d) => sum + d, 0) / durations.length;
    }

    /**
     * Analyze device distribution
     */
    analyzeDeviceDistribution(interactions) {
        const devices = {};
        interactions.forEach(i => {
            const device = i.device || 'unknown';
            devices[device] = (devices[device] || 0) + 1;
        });

        const total = interactions.length || 1;
        return Object.entries(devices).map(([device, count]) => ({
            device,
            count,
            percentage: (count / total) * 100
        }));
    }

    /**
     * Identify top features
     */
    identifyTopFeatures(interactions) {
        const features = {};
        interactions.forEach(i => {
            const feature = this.extractFeature(i.target);
            if (feature) {
                features[feature] = (features[feature] || 0) + 1;
            }
        });

        return Object.entries(features)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([feature, count]) => ({ feature, count }));
    }

    /**
     * Extract feature from target
     */
    extractFeature(target) {
        if (!target) return 'unknown';

        // Extract feature from element identifier
        if (target.includes('like')) return 'like';
        if (target.includes('comment')) return 'comment';
        if (target.includes('share')) return 'share';
        if (target.includes('post')) return 'post';
        if (target.includes('profile')) return 'profile';
        if (target.includes('message')) return 'message';
        if (target.includes('notification')) return 'notification';
        if (target.includes('search')) return 'search';

        return 'other';
    }

    /**
     * Analyze sentiment
     */
    analyzeSentiment(engagements) {
        if (engagements.length === 0) return 'neutral';

        const sentiments = engagements
            .filter(e => e.sentiment)
            .map(e => e.sentiment);

        if (sentiments.length === 0) return 'neutral';

        const positive = sentiments.filter(s => s === 'positive').length;
        const negative = sentiments.filter(s => s === 'negative').length;
        const neutral = sentiments.filter(s => s === 'neutral').length;

        if (positive > negative && positive > neutral) return 'positive';
        if (negative > positive && negative > neutral) return 'negative';
        return 'neutral';
    }

    /**
     * Start continuous analysis cycle
     */
    startAnalysisCycle() {
        setInterval(() => {
            const analysis = this.analyzePatterns();
            console.log('[Observer Agent] Analysis complete:', {
                interactions: analysis.totalInteractions,
                engagements: analysis.totalEngagements,
                activeSessions: analysis.activeSessions,
                sentiment: analysis.overallSentiment
            });
        }, this.config.analysisInterval);

        console.log('[Observer Agent] Started - Analysis every 5 minutes');
    }

    /**
     * Get current statistics
     */
    getStats() {
        return {
            totalInteractions: this.interactions.length,
            totalEngagements: this.engagements.length,
            totalSessions: this.userSessions.size,
            heatmapPoints: this.heatmapData.size,
            performanceMetrics: this.performanceMetrics.length
        };
    }

    /**
     * Get heatmap for a page
     */
    getHeatmap(page) {
        const heatmap = [];
        this.heatmapData.forEach((value, key) => {
            if (value.page === page) {
                heatmap.push(value);
            }
        });
        return heatmap;
    }
}

module.exports = ObserverAgent;
