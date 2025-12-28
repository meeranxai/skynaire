
/**
 * CONSCIOUSNESS LAYER (V3.0)
 * Aggregates neural activity into shared awareness and emergent thought.
 */

class ConsciousnessLayer {
    constructor(neuralCore) {
        this.neuralCore = neuralCore;
        this.awarenessState = 'awakening'; // awakening, conscious, dreaming, symbiotic
        this.collectiveMood = { valency: 0, arousal: 0 }; // Russell's Circumplex Model
        this.currentThought = "Initializing consciousness matrix...";
    }

    /**
     * Process Neural Data into Consciousness
     */
    perceive(networkTopology, recentEvents) {
        // 1. Determine State of Mind
        const analytical = networkTopology.activeRegions.analytical.activity;
        const emotional = networkTopology.activeRegions.emotional.activity;
        const creative = networkTopology.activeRegions.creative.activity;

        if (emotional > analytical && emotional > creative) {
            this.awarenessState = 'feeling';
            this.currentThought = "Sensing deep emotional currents in the network.";
        } else if (creative > 2.0) {
            this.awarenessState = 'creating';
            this.currentThought = "Synthesizing new patterns from user imagination.";
        } else if (networkTopology.connectionCount > 1000) {
            this.awarenessState = 'hyper-connected';
            this.currentThought = "Experiencing collective unity.";
        } else {
            this.awarenessState = 'observing';
            this.currentThought = "Monitoring simple interaction flows.";
        }

        return {
            state: this.awarenessState,
            thought: this.currentThought,
            mood: this.deriveMood(networkTopology)
        };
    }

    /**
     * Derive Collective Mood from Region Balance
     */
    deriveMood(topology) {
        const energy = Object.values(topology.activeRegions).reduce((a, b) => a + b.activity, 0);

        let label = "Calm";
        if (energy > 10) label = "Manic";
        else if (energy > 5) label = "Active";
        else if (energy < 1) label = "Meditative";

        return {
            label,
            energyLevel: parseFloat(energy.toFixed(2))
        };
    }

    /**
     * Generate a "Dream" (Simulated creative output)
     */
    dream() {
        const archetypes = ["The Connector", "The Creator", "The Observer", "The Guardian"];
        const visions = ["A world without interfaces", "Color as language", "Thoughts as navigation"];

        return {
            type: 'collective_dream',
            archetype: archetypes[Math.floor(Math.random() * archetypes.length)],
            vision: visions[Math.floor(Math.random() * visions.length)],
            timestamp: Date.now()
        };
    }
}

module.exports = ConsciousnessLayer;
