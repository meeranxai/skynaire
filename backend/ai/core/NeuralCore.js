
/**
 * NEURAL PLATFORM CORE (V3.0)
 * Simulates digital consciousness via synaptic connections and neuroplasticity.
 */

const EventEmitter = require('events');

class NeuralCore extends EventEmitter {
    constructor() {
        super();
        this.synapses = new Map(); // Connection strengths: "NodeA:NodeB" -> weigh
        this.neuronActivation = new Map(); // Current excitement level of nodes
        this.plasticityRate = 0.1; // Rate of rewiring
        this.decayRate = 0.05; // Rate of forgetting

        // Brain Regions (Clusters of functionality)
        this.regions = {
            analytical: { activity: 0, weight: 1.0 }, // Frontal
            emotional: { activity: 0, weight: 1.0 },  // Limbic
            creative: { activity: 0, weight: 1.0 }    // Occipital
        };

        // Start metabolism (background processing)
        this.startMetabolism();
    }

    /**
     * Stimulate the neural network with an event
     */
    stimulate(inputType, sourceId, targetId, intensity = 1.0) {
        const synapseKey = `${sourceId}:${targetId}`;

        // 1. Hebbian Learning: Fire together, wire together
        const currentWeight = this.synapses.get(synapseKey) || 0;
        const newWeight = Math.min(currentWeight + (this.plasticityRate * intensity), 10.0);
        this.synapses.set(synapseKey, newWeight);

        // 2. Activate Regions based on input type
        this.activateRegion(inputType, intensity);

        // 3. Propagate activation (Simulated)
        this.neuronActivation.set(targetId, (this.neuronActivation.get(targetId) || 0) + intensity);

        return {
            synapseStrength: newWeight,
            regionActivity: this.regions
        };
    }

    activateRegion(type, intensity) {
        if (['analytics', 'search', 'settings'].includes(type)) {
            this.regions.analytical.activity += intensity;
        } else if (['like', 'comment', 'chat', 'mood'].includes(type)) {
            this.regions.emotional.activity += intensity;
        } else if (['post', 'create', 'customize'].includes(type)) {
            this.regions.creative.activity += intensity;
        }
    }

    /**
     * Background "Metabolism" process
     * Handles decay, pruning, and dream cycles
     */
    startMetabolism() {
        setInterval(() => {
            // Memory Decay (Forgetting unused connections)
            for (const [key, weight] of this.synapses.entries()) {
                const newWeight = weight * (1 - this.decayRate);
                if (newWeight < 0.1) {
                    this.synapses.delete(key); // Pruning
                } else {
                    this.synapses.set(key, newWeight);
                }
            }

            // Region homeostasis (Return to baseline)
            for (const region of Object.values(this.regions)) {
                region.activity *= 0.9;
            }

            // Check for "Dream State" (Low activity)
            const totalActivity = Object.values(this.regions).reduce((sum, r) => sum + r.activity, 0);
            if (totalActivity < 0.5) {
                // Reduced frequency of dream state emission
                if (Math.random() < 0.1) { // Only emit 10% of the time when activity is low
                    this.emit('dreamStateActive', { synapses: this.synapses.size });
                }
            }

        }, 30000); // Increased to 30 seconds
    }

    getNetworkTopology() {
        return {
            connectionCount: this.synapses.size,
            activeRegions: this.regions,
            strongestPathways: Array.from(this.synapses.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
        };
    }
}

module.exports = NeuralCore;
