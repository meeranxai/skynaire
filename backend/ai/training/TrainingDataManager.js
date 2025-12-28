
/**
 * TRAINING DATA MANAGER
 * Manages chatbot learning data with AI-powered improvements
 */

const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class TrainingDataManager {
    constructor() {
        this.dataPath = path.join(__dirname, 'data', 'conversations.json');
        this.data = null;
        this.loadData();

        // AI for generating better responses
        const geminiKey = process.env.GEMINI_API_KEY || 'AIzaSyCdDUQWRXHAMS-b3vz0vCFuRe-5fBdFSSQ';
        try {
            this.genAI = new GoogleGenerativeAI(geminiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        } catch (e) {
            console.warn('[TrainingDataManager] AI not available for training');
        }
    }

    async loadData() {
        try {
            const raw = await fs.readFile(this.dataPath, 'utf-8');
            this.data = JSON.parse(raw);
            console.log(`[TrainingDataManager] Loaded ${this.data.conversations.length} conversations`);
        } catch (error) {
            console.error('[TrainingDataManager] Failed to load data:', error.message);
            this.data = {
                version: "1.0",
                lastUpdated: new Date().toISOString(),
                conversations: [],
                approvedPatterns: [],
                rejectedPatterns: []
            };
        }
    }

    async saveData() {
        try {
            this.data.lastUpdated = new Date().toISOString();
            await fs.writeFile(this.dataPath, JSON.stringify(this.data, null, 2));
            console.log('[TrainingDataManager] Data saved successfully');
        } catch (error) {
            console.error('[TrainingDataManager] Failed to save data:', error);
        }
    }

    /**
     * Add a new conversation for training
     */
    async addConversation(question, answer, metadata = {}) {
        const conversation = {
            id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            question: question.trim(),
            answer: answer.trim(),
            timestamp: new Date().toISOString(),
            approved: metadata.autoApprove || false,
            helpful: metadata.helpful || null,
            userId: metadata.userId || 'anonymous',
            feedback: metadata.feedback || null
        };

        this.data.conversations.push(conversation);
        await this.saveData();

        console.log(`[TrainingDataManager] Added conversation: "${question.substring(0, 50)}..."`);
        return conversation;
    }

    /**
     * Learn from user feedback
     */
    async recordFeedback(conversationId, isHelpful, feedback = null) {
        const conv = this.data.conversations.find(c => c.id === conversationId);
        if (conv) {
            conv.helpful = isHelpful;
            conv.feedback = feedback;

            // Auto-approve if marked helpful
            if (isHelpful) {
                conv.approved = true;
            }

            await this.saveData();
            return true;
        }
        return false;
    }

    /**
     * Get all pending conversations (for admin review)
     */
    getPendingConversations() {
        return this.data.conversations.filter(c => !c.approved);
    }

    /**
     * Get approved conversations (active training data)
     */
    getApprovedConversations() {
        return this.data.conversations.filter(c => c.approved);
    }

    /**
     * Approve/Reject conversation
     */
    async moderateConversation(conversationId, approve) {
        const conv = this.data.conversations.find(c => c.id === conversationId);
        if (conv) {
            if (approve) {
                conv.approved = true;
            } else {
                // Remove from training data
                this.data.conversations = this.data.conversations.filter(c => c.id !== conversationId);
            }
            await this.saveData();
            return true;
        }
        return false;
    }

    /**
     * Use AI to find similar questions in training data
     */
    findSimilarQuestions(question, threshold = 0.5) {
        const approved = this.getApprovedConversations();
        const lower = question.toLowerCase();

        // Simple keyword matching (can be enhanced with embeddings)
        const matches = approved.filter(conv => {
            const convLower = conv.question.toLowerCase();
            const commonWords = lower.split(' ').filter(word =>
                word.length > 3 && convLower.includes(word)
            );
            return commonWords.length >= 2;
        });

        return matches.slice(0, 5); // Top 5 matches
    }

    /**
     * AI-Powered Response Generation from Training Data
     */
    async generateResponseFromTraining(question) {
        const similar = this.findSimilarQuestions(question);

        if (similar.length === 0) return null;

        try {
            if (!this.model) return similar[0].answer; // Fallback to direct match

            const prompt = `
                You are a chatbot learning from past conversations.
                
                Similar past Q&As:
                ${similar.map(s => `Q: ${s.question}\nA: ${s.answer}`).join('\n\n')}
                
                New Question: "${question}"
                
                Generate a helpful, concise response based on the patterns above. Be friendly and use emojis.
                Keep it under 150 words.
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.warn('[TrainingDataManager] AI generation failed, using direct match');
            return similar[0].answer;
        }
    }

    /**
     * Get training statistics
     */
    getStats() {
        return {
            total: this.data.conversations.length,
            approved: this.data.conversations.filter(c => c.approved).length,
            pending: this.data.conversations.filter(c => !c.approved).length,
            helpful: this.data.conversations.filter(c => c.helpful === true).length,
            notHelpful: this.data.conversations.filter(c => c.helpful === false).length,
            lastUpdated: this.data.lastUpdated
        };
    }
}

module.exports = new TrainingDataManager();
