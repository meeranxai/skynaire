/**
 * DESIGNER AGENT - Autonomous UI Design & Optimization
 * Uses Gemini AI to make intelligent design decisions
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const EventEmitter = require('events');
const EmotionalSystem = require('../engines/EmotionalSystem');

class DesignerAgent extends EventEmitter {
    constructor() {
        super();

        // --- HYBRID INTELLIGENCE CORE ---

        // 1. VISION ENGINE (Google Gemini) - For Creativity & Strategy
        const geminiKey = process.env.GEMINI_API_KEY || 'AIzaSyCdDUQWRXHAMS-b3vz0vCFuRe-5fBdFSSQ';
        try {
            this.genAI = new GoogleGenerativeAI(geminiKey);
            this.visionModel = this.genAI.getGenerativeModel({ model: "gemini-pro" });
            console.log('[DesignerAgent] Vision Engine (Gemini) Initialized');
        } catch (e) { console.error('Gemini Init Failed', e); }

        // 2. REFLEX ENGINE (Groq) - For Speed & Real-time Analysis
        const groqKey = process.env.GROQ_API_KEY || 'gsk_dummy_key_for_dev_startup';
        try {
            this.reflexEngine = new Groq({ apiKey: groqKey });
            console.log('[DesignerAgent] Reflex Engine (Groq) Initialized');
        } catch (e) { console.error('Groq Init Failed', e); }

        this.designHistory = [];
        this.userThemes = new Map();
        this.currentPlatformTheme = this.getDefaultTheme();

        // Configuration
        this.config = {
            maxChangesPerHour: 3,
            changeVelocity: 'gradual', // instant, gradual, slow
            brandPreservation: true,
            accessibilityFirst: true,
            optimizationCycle: 30 * 60 * 1000, // 30 minutes
        };

        // Change tracking
        this.changes = {
            lastHour: [],
            history: []
        };

        // V2.0 Systems
        this.emotionalSystem = new EmotionalSystem();

        // Start optimization cycle
        this.startOptimizationCycle();
    }

    /**
     * V2.0: Generative Feature Creation
     * Proposes new features based on "unarticulated user needs"
     * POWERED BY: Google Gemini Vision Engine
     */
    async generateFeatureProposal(observerData) {
        try {
            if (!this.visionModel) throw new Error("Vision Engine offline");

            const prompt = `
                Act as a visionary product designer for a social network.
                Analyze this user behavior context: "Users are seeking more serendipitous connections."
                Propose ONE innovative, futuristic feature in JSON format with fields: name, reasoning, estimatedImpact (Low/Medium/High).
                Do not include markdown formatting.
            `;

            const result = await this.visionModel.generateContent(prompt);
            const response = await result.response;
            const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const proposal = JSON.parse(text);

            return {
                id: `feat-${Date.now()}`,
                name: proposal.name || "Emergent Feature",
                type: 'Generative (Vision Engine)',
                status: 'Prototype',
                reasoning: proposal.reasoning || "AI identified a unique opportunity pattern.",
                estimatedImpact: proposal.estimatedImpact || "High",
                timestamp: Date.now()
            };

        } catch (error) {
            console.warn("[Designer] Vision Engine failed, using fallback:", error.message);
            // Fallback to randomized concepts
            const concepts = [
                "Serendipity Engine", "Mood-Based Clusters", "Predictive Collaboration",
                "Auto-Evolving Hashtags", "Visual Soundscapes"
            ];
            const concept = concepts[Math.floor(Math.random() * concepts.length)];

            return {
                id: `feat-${Date.now()}`,
                name: concept,
                type: 'Generative',
                status: 'Prototype',
                reasoning: 'Gap analysis detected opportunity for higher engagement (Fallback).',
                estimatedImpact: 'High',
                timestamp: Date.now()
            };
        }
    }

    /**
     * V2.0: Emotional Adaptation Logic
     * POWERED BY: Groq Reflex Engine (Fast) + Heuristics
     */
    async determineEmotionalResponse(userInteractionData) {
        // HYBRID: Try Reflex Engine (Groq) first for <100ms response
        if (this.reflexEngine && process.env.GROQ_API_KEY) { // Only if active
            try {
                const completion = await this.reflexEngine.chat.completions.create({
                    messages: [{ role: "user", content: "Classify user mood based on interaction velocity: Rapid typing, chaotic scrolling. Options: Frustrated, Excited, Focused, Bored. Return ONLY the word." }],
                    model: "mixtral-8x7b-32768",
                    temperature: 0.1
                });
                const mood = completion.choices[0]?.message?.content?.trim() || "Mixed";

                return {
                    mood: mood.toLowerCase(),
                    intensity: 0.8,
                    adaptation: this.emotionalSystem.getAdaptationStrategy(mood.toLowerCase()),
                    source: 'Groq Reflex Engine'
                };
            } catch (e) {
                // Ignore and fall back
            }
        }

        return this.emotionalSystem.analyzeMood('system-wide', userInteractionData);
    }

    /**
     * Get default platform theme
     */
    getDefaultTheme() {
        return {
            colors: {
                primaryHue: 250,
                saturation: 70,
                lightness: 60,
                accentHue: 160,
                neutralHue: 220
            },
            spacing: {
                factor: 1.0,
                unit: 8
            },
            typography: {
                scale: 1.0,
                primaryFont: 'Inter',
                codeFont: 'JetBrains Mono'
            },
            layout: {
                maxWidth: 1400,
                sidebarWidth: 280,
                borderRadius: 12,
                contentDensity: 'comfortable' // compact, comfortable, spacious
            },
            effects: {
                animationSpeed: 0.3,
                blurStrength: 4,
                shadowIntensity: 0.1
            },
            mode: 'auto', // light, dark, auto
            timestamp: Date.now()
        };
    }

    /**
     * Analyze user behavior and generate design recommendations
     */
    async analyzeAndRecommend(observerData) {
        try {
            const prompt = this.constructAnalysisPrompt(observerData);

            // Use Groq for fast analysis of structured data
            const response = await this.reflexEngine.chat.completions.create({
                model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 2000,
                response_format: { type: 'json_object' }
            });

            const recommendations = JSON.parse(response.choices[0].message.content);

            console.log('[Designer Agent] AI Recommendations (Reflex):', recommendations);

            return recommendations;
        } catch (error) {
            console.error('[Designer Agent] AI Analysis Error:', error);
            return this.getFallbackRecommendations(observerData);
        }
    }

    /**
     * Construct prompt for AI analysis
     */
    constructAnalysisPrompt(data) {
        return `You are an expert UI/UX designer for a social media platform called G-Network. Analyze the following user behavior data and provide design recommendations.

**User Behavior Data:**
- Total Interactions: ${data.totalInteractions}
- Click Rate: ${(data.clickRate * 100).toFixed(1)}%
- Engagement Rate: ${data.totalEngagements} engagements
- Average Load Time: ${data.avgLoadTime}ms
- Active Sessions: ${data.activeSessions}
- Overall Sentiment: ${data.overallSentiment}
- Friction Points: ${JSON.stringify(data.frictionPoints)}
- Drop-off Pages: ${JSON.stringify(data.dropOffPages)}
- Device Breakdown: ${JSON.stringify(data.deviceBreakdown)}
- Top Features Used: ${JSON.stringify(data.topFeatures)}

**Current Time:** ${new Date().getHours()}:00 (${this.getTimeOfDay()})

**Task:** Based on this data, provide design optimization recommendations in the following JSON format:

{
  "priority": "high|medium|low",
  "changes": [
    {
      "category": "colors|spacing|typography|layout|performance",
      "recommendation": "specific change to make",
      "reasoning": "why this change will help",
      "expectedImpact": "predicted improvement",
      "implementation": "how to implement"
    }
  ],
  "themeAdjustments": {
    "primaryHue": 0-360,
    "saturation": 0-100,
    "lightness": 0-100
  },
  "urgentIssues": ["list of urgent problems to fix"],
  "overallStrategy": "brief strategy description"
}

**Guidelines:**
1. Focus on data-driven decisions
2. Preserve brand consistency
3. Ensure accessibility (WCAG 2.1)
4. Optimize for the detected sentiment
5. Address friction points immediately
6. Consider time of day for color adjustments
7. Maximize engagement while maintaining usability

Provide your response as valid JSON only.`;
    }

    /**
     * Get time of day for context
     */
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }

    /**
     * Fallback recommendations (if AI fails)
     */
    getFallbackRecommendations(data) {
        const recommendations = {
            priority: 'medium',
            changes: [],
            themeAdjustments: {},
            urgentIssues: [],
            overallStrategy: 'Applying heuristic-based optimizations'
        };

        // Check for slow performance
        if (data.avgLoadTime > 3000) {
            recommendations.urgentIssues.push('High page load times detected');
            recommendations.changes.push({
                category: 'performance',
                recommendation: 'Enable image lazy loading and optimize bundle size',
                reasoning: 'Load time exceeds 3 seconds',
                expectedImpact: '30-40% faster loads',
                implementation: 'Configure webpack code splitting and image optimization'
            });
        }

        // Check for high friction
        if (data.frictionPoints && data.frictionPoints.length > 0) {
            recommendations.priority = 'high';
            data.frictionPoints.forEach(fp => {
                recommendations.changes.push({
                    category: 'layout',
                    recommendation: `Redesign or reposition element: ${fp.element}`,
                    reasoning: `High friction score: ${(fp.frictionScore * 100).toFixed(1)}%`,
                    expectedImpact: 'Reduced user frustration',
                    implementation: 'Improve button visibility and responsiveness'
                });
            });
        }

        // Time-based color adjustments
        const hour = new Date().getHours();
        if (hour >= 21 || hour < 6) {
            recommendations.themeAdjustments = {
                primaryHue: 240,
                saturation: 50,
                lightness: 40
            };
            recommendations.changes.push({
                category: 'colors',
                recommendation: 'Switch to night mode colors',
                reasoning: 'Current time is late evening/night',
                expectedImpact: 'Reduced eye strain',
                implementation: 'Adjust CSS variables for darker palette'
            });
        }

        return recommendations;
    }

    /**
     * Apply design changes autonomously
     */
    async applyChanges(recommendations) {
        // Check change velocity limits
        if (!this.canMakeChanges()) {
            console.log('[Designer Agent] Change limit reached, deferring changes');
            return { applied: false, reason: 'Rate limit exceeded' };
        }

        const appliedChanges = [];

        // Apply theme adjustments
        if (recommendations.themeAdjustments && Object.keys(recommendations.themeAdjustments).length > 0) {
            const themeChange = this.applyThemeAdjustments(recommendations.themeAdjustments);
            appliedChanges.push(themeChange);
        }

        // Apply individual changes
        if (recommendations.changes) {
            recommendations.changes.forEach(change => {
                if (change.category === 'colors') {
                    this.adjustColors(change);
                    appliedChanges.push({ type: 'color', detail: change.recommendation });
                } else if (change.category === 'spacing') {
                    this.adjustSpacing(change);
                    appliedChanges.push({ type: 'spacing', detail: change.recommendation });
                } else if (change.category === 'typography') {
                    this.adjustTypography(change);
                    appliedChanges.push({ type: 'typography', detail: change.recommendation });
                }
            });
        }

        // Record changes
        this.recordChanges(appliedChanges, recommendations);

        // Emit event
        this.emit('designChange', {
            timestamp: Date.now(),
            changes: appliedChanges,
            recommendations: recommendations
        });

        console.log('[Designer Agent] Applied', appliedChanges.length, 'changes');

        return {
            applied: true,
            count: appliedChanges.length,
            changes: appliedChanges
        };
    }

    /**
     * Check if we can make more changes this hour
     */
    canMakeChanges() {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        this.changes.lastHour = this.changes.lastHour.filter(c => c.timestamp > oneHourAgo);

        return this.changes.lastHour.length < this.config.maxChangesPerHour;
    }

    /**
     * Apply theme adjustments
     */
    applyThemeAdjustments(adjustments) {
        if (adjustments.primaryHue !== undefined) {
            this.currentPlatformTheme.colors.primaryHue = adjustments.primaryHue;
        }
        if (adjustments.saturation !== undefined) {
            this.currentPlatformTheme.colors.saturation = adjustments.saturation;
        }
        if (adjustments.lightness !== undefined) {
            this.currentPlatformTheme.colors.lightness = adjustments.lightness;
        }

        this.currentPlatformTheme.timestamp = Date.now();

        return {
            type: 'theme',
            theme: this.currentPlatformTheme,
            timestamp: Date.now()
        };
    }

    /**
     * Adjust colors
     */
    adjustColors(change) {
        // Implementation would modify theme colors
        console.log('[Designer Agent] Color adjustment:', change.recommendation);
    }

    /**
     * Adjust spacing
     */
    adjustSpacing(change) {
        // Implementation would modify spacing values
        console.log('[Designer Agent] Spacing adjustment:', change.recommendation);
    }

    /**
     * Adjust typography
     */
    adjustTypography(change) {
        // Implementation would modify typography
        console.log('[Designer Agent] Typography adjustment:', change.recommendation);
    }

    /**
     * Record changes
     */
    recordChanges(changes, recommendations) {
        const record = {
            timestamp: Date.now(),
            changes: changes,
            recommendations: recommendations,
            id: `change-${Date.now()}`
        };

        this.changes.lastHour.push(record);
        this.changes.history.push(record);

        // Keep last 100 in history
        if (this.changes.history.length > 100) {
            this.changes.history = this.changes.history.slice(-100);
        }

        this.designHistory.push(record);
    }

    /**
     * Get personalized theme for user
     */
    getPersonalizedTheme(userId, userPreferences) {
        if (this.userThemes.has(userId)) {
            return this.userThemes.get(userId);
        }

        // Generate personalized theme based on preferences
        const personalTheme = { ...this.currentPlatformTheme };

        // Customize based on user preferences
        if (userPreferences) {
            if (userPreferences.preferredColors) {
                personalTheme.colors.primaryHue = userPreferences.preferredColors.hue || personalTheme.colors.primaryHue;
            }
            if (userPreferences.textSize) {
                personalTheme.typography.scale = userPreferences.textSize;
            }
            if (userPreferences.darkMode !== undefined) {
                personalTheme.mode = userPreferences.darkMode ? 'dark' : 'light';
            }
        }

        this.userThemes.set(userId, personalTheme);
        return personalTheme;
    }

    /**
     * Start continuous optimization cycle
     */
    startOptimizationCycle() {
        setInterval(() => {
            console.log('[Designer Agent] Optimization cycle check');
            this.emit('cycleStart');
        }, this.config.optimizationCycle);

        console.log('[Designer Agent] Started - Optimization every 30 minutes');
    }

    /**
     * Get current theme (for API)
     */
    getCurrentTheme() {
        return this.currentPlatformTheme;
    }

    /**
     * Rollback to previous design
     */
    rollback(changeId) {
        const change = this.changes.history.find(c => c.id === changeId);
        if (!change) {
            return { success: false, error: 'Change not found' };
        }

        // Find the theme before this change
        const index = this.changes.history.indexOf(change);
        if (index > 0) {
            const previousChange = this.changes.history[index - 1];
            this.currentPlatformTheme = { ...previousChange.theme };

            console.log('[Designer Agent] Rolled back to:', previousChange.id);

            return { success: true, theme: this.currentPlatformTheme };
        }

        return { success: false, error: 'No previous state available' };
    }

    /**
     * Get stats
     */
    getStats() {
        return {
            totalChanges: this.designHistory.length,
            changesThisHour: this.changes.lastHour.length,
            userThemes: this.userThemes.size,
            currentTheme: this.currentPlatformTheme,
            canMakeChanges: this.canMakeChanges()
        };
    }
}

module.exports = DesignerAgent;
