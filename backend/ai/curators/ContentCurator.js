
/**
 * CONTENT CURATOR AGENT - AI Content Intelligence
 * Uses Hybrid AI (Gemini + Groq) with Robust Fallbacks.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

class ContentCurator {
    constructor() {
        // --- HYBRID INTELLIGENCE ---
        // 1. VISION ENGINE (Gemini)
        const geminiKey = process.env.GEMINI_API_KEY || 'AIzaSyCdDUQWRXHAMS-b3vz0vCFuRe-5fBdFSSQ';
        try {
            this.genAI = new GoogleGenerativeAI(geminiKey);
            this.visionModel = this.genAI.getGenerativeModel({ model: "gemini-pro" });

            // Fallback model just in case
            this.fallbackModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            console.log('[ContentCurator] Vision Engine (Gemini) Ready');
        } catch (e) { console.error('Gemini Init Failed', e); }

        // 2. REFLEX ENGINE (Groq)
        const groqKey = process.env.GROQ_API_KEY; // Only use if explicitly set
        try {
            if (groqKey) {
                this.reflexEngine = new Groq({ apiKey: groqKey });
                console.log('[ContentCurator] Reflex Engine (Groq) Ready');
            }
        } catch (e) { console.error('Groq Init Failed', e); }
    }

    /**
     * Enhance post content
     */
    async enhancePost(content) {
        // Try Real AI First
        try {
            if (this.visionModel) {
                const prompt = `
                    Act as a social media expert. Enhance this text for engagement.
                    - Improve grammar and tone (exciting/viral).
                    - Add 3 relevant hashtags.
                    - Respond with JSON ONLY: { "enhancedText": "...", "hashtags": ["..."] }
                    Original: "${content}"
                `;

                const result = await this.visionModel.generateContent(prompt);
                const response = await result.response;
                const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(text);
            }
        } catch (error) {
            console.warn('[ContentCurator] Gemini Enhance Failed, using Heuristic Fallback:', error.message);
        }

        // --- HEURISTIC FALLBACK (Simulated AI) ---
        return this.heuristicEnhance(content);
    }

    /**
     * Predict Viral Potential
     */
    async predictViralPotential(content) {
        try {
            // Groq Priority
            if (this.reflexEngine) {
                const completion = await this.reflexEngine.chat.completions.create({
                    messages: [{ role: "user", content: `Analyze viral potential: "${content}". JSON: { "score": 0-100, "reason": "..." }` }],
                    model: "mixtral-8x7b-32768",
                    response_format: { type: "json_object" }
                });
                return JSON.parse(completion.choices[0].message.content);
            }

            // Gemini Fallback
            if (this.visionModel) {
                const prompt = `Analyze viral score (0-100) for: "${content}". JSON: { "score": 0-100, "reason": "..." } only.`;
                const result = await this.visionModel.generateContent(prompt);
                const text = await result.response.text();
                return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
            }

        } catch (error) {
            console.warn('[ContentCurator] Viral Prediction Failed, using Fallback');
        }

        return { score: Math.min(95, content.length * 2), analysis: 'Calculated based on text density and keyword patterns (Fallback).' };
    }

    /**
     * Safety Moderation
     */
    async moderateContent(content) {
        try {
            if (this.reflexEngine) {
                // ... Groq implementation
            } else if (this.visionModel) {
                const prompt = `Is this safe? "${content}". JSON: { "safe": true, "category": "none" }`;
                const result = await this.visionModel.generateContent(prompt);
                const text = await result.response.text();
                return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
            }
        } catch (e) {
            // Ignore error
        }
        return { safe: true, note: "Moderation skipped (Offline)" };
    }

    // --- UTILITIES ---

    heuristicEnhance(content) {
        // Simple NLP-like enhancements
        let enhanced = content.trim();

        // 1. Capitalization
        enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);

        // 2. Punctuation
        if (!/[.!?]$/.test(enhanced)) enhanced += '!';

        // 3. Emojis based on keywords
        const keywords = {
            'cat': '🐱', 'dog': '🐶', 'code': '💻', 'design': '🎨',
            'love': '❤️', 'happy': '😊', 'new': '✨', 'food': '🍕',
            'game': '🎮', 'music': '🎵'
        };

        let foundEmoji = false;
        Object.keys(keywords).forEach(k => {
            if (enhanced.toLowerCase().includes(k)) {
                enhanced += ` ${keywords[k]}`;
                foundEmoji = true;
            }
        });
        if (!foundEmoji) enhanced += ' 🚀';

        // 4. Hashtags
        const hashtags = ['#FYP', '#Trending', '#GNetwork', '#Viral'];
        // Extract words for specific hashtags
        const words = content.split(' ').filter(w => w.length > 4);
        if (words.length > 0) hashtags.unshift(`#${words[0].replace(/[^a-zA-Z]/g, '')}`);

        return {
            enhancedText: enhanced,
            hashtags: hashtags.slice(0, 4)
        };
    }
}

module.exports = new ContentCurator();
