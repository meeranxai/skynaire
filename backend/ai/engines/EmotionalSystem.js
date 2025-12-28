
/**
 * EMOTIONAL RESPONSE SYSTEM (V2.0)
 * Adapts platform aesthetics and behavior to user's emotional state.
 */

class EmotionalSystem {
    constructor() {
        this.userStates = new Map();
    }

    /**
     * Analyze behavior to determine emotional state
     * @param {Object} interactionData - Click speed, scroll velocity, etc.
     */
    analyzeMood(userId, interactionData) {
        let mood = 'neutral';
        let intensity = 0.5;

        // 1. Detect Frustration (Rage Clicks / Rapid erratic movement)
        if (this.detectFrustration(interactionData)) {
            mood = 'frustrated';
            intensity = 0.8;
        }
        // 2. Detect Focus (Steady, linear scrolling)
        else if (this.detectFocus(interactionData)) {
            mood = 'focused';
            intensity = 0.6;
        }
        // 3. Detect Excitement (Rapid but engaging interactions)
        else if (this.detectExcitement(interactionData)) {
            mood = 'excited';
            intensity = 0.9;
        }

        this.updateUserState(userId, mood, intensity);

        return {
            mood,
            intensity,
            adaptation: this.getAdaptationStrategy(mood)
        };
    }

    detectFrustration(data) {
        // High click frequency in short time + stationary general area
        if (data.clickRate > 2.0) return true; // > 2 clicks per second
        return false;
    }

    detectFocus(data) {
        // Consistent scroll without erratic stops
        return data.scrollVelocity > 50 && data.scrollVelocity < 300;
    }

    detectExcitement(data) {
        // High engagement rate
        return data.engagementRate > 1.5;
    }

    getAdaptationStrategy(mood) {
        switch (mood) {
            case 'frustrated':
                return {
                    theme: 'calming', // Blue/Green hues, lower saturation
                    animations: 'reduced',
                    density: 'low',
                    message: "We're simplifying things for you."
                };
            case 'focused':
                return {
                    theme: 'minimal', // High contrast, low noise
                    animations: 'smooth',
                    density: 'medium'
                };
            case 'excited':
                return {
                    theme: 'vibrant', // Saturated, warm colors
                    animations: 'dynamic',
                    density: 'high'
                };
            default:
                return { theme: 'standard', animations: 'standard' };
        }
    }

    updateUserState(userId, mood, intensity) {
        this.userStates.set(userId, {
            mood,
            intensity,
            lastUpdate: Date.now()
        });
    }
}

module.exports = EmotionalSystem;
