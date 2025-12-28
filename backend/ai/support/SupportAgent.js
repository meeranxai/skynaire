
/**
 * SUPPORT AGENT - AI Help Bot ("G-Net Genie")
 * Enhanced with comprehensive knowledge base and intelligent fallback
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const trainingManager = require('../training/TrainingDataManager');

class SupportAgent {
    constructor() {
        // Conversation memory per user
        this.conversationHistory = new Map();

        // --- HYBRID INTELLIGENCE ---
        const geminiKey = process.env.GEMINI_API_KEY || 'AIzaSyCdDUQWRXHAMS-b3vz0vCFuRe-5fBdFSSQ';
        try {
            this.genAI = new GoogleGenerativeAI(geminiKey);
            this.visionModel = this.genAI.getGenerativeModel({ model: "gemini-pro" });
            console.log('[SupportAgent] Vision Engine Linked');
        } catch (e) { }

        const groqKey = process.env.GROQ_API_KEY;
        try {
            if (groqKey) {
                this.reflexEngine = new Groq({ apiKey: groqKey });
                console.log('[SupportAgent] Groq Reflex Engine Linked');
            }
        } catch (e) { }

        // Knowledge Base
        this.knowledgeBase = {
            'magic enhance': {
                keywords: ['magic', 'enhance', 'ai enhance', 'improve post', 'better caption', 'better content'],
                response: "Magic Enhance is our AI-powered content booster! 🪄✨\n\nHere's how it works:\n1. Write your post draft\n2. Click the ✨ 'Enhance' button below your text\n3. Our AI will:\n   - Improve grammar & tone\n   - Add viral-worthy emojis\n   - Suggest trending hashtags\n   - Make it more engaging!\n\nIt uses advanced AI (Gemini) to transform boring posts into share-worthy content. Try it now!"
            },
            'writing tips': {
                keywords: ['catchy title', 'write', 'writing', 'caption', 'good post', 'engaging', 'viral', 'headline', 'hook'],
                response: "Great writing tips for G-Network! ✍️✨\n\n**Catchy Titles:**\n• Start with action words (Discover, Learn, Transform)\n• Use numbers (5 Ways to...)\n• Ask questions (Ever wondered...?)\n• Create urgency (Don't Miss...)\n\n**Engaging Posts:**\n• Keep it concise (2-3 sentences ideal)\n• Use emojis strategically 🎯\n• Add hashtags (3-5 max)\n• Tell a story or share emotion\n\n**Pro Tip:** Use our ✨ Magic Enhance button! It rewrites your post with AI for maximum engagement. Just type your idea and click Enhance! 🚀"
            },
            'create post': {
                keywords: ['create', 'post', 'new post', 'share', 'upload', 'publish', 'make post'],
                response: "Creating a post is super easy! 📝\n\n1. Click the '+' or 'Create' button in the navigation\n2. Add a title and your message\n3. Optional: Upload images/videos\n4. Use the ✨ Magic Enhance button for AI help\n5. Choose privacy settings (Public, Followers, Private)\n6. Hit 'Share' and you're live!\n\nPro tip: Try the AI caption generator (robot icon) for instant ideas! 🤖"
            },
            'dark mode': {
                keywords: ['dark mode', 'theme', 'appearance', 'light mode', 'colors', 'night mode'],
                response: "G-Network has stunning dark mode! 🌙\n\nTo toggle:\n1. Go to Settings (gear icon)\n2. Click 'Appearance'\n3. Choose your theme:\n   - Light Mode ☀️\n   - Dark Mode 🌙\n   - System (auto-adjusts)\n\nOur AI also adapts themes based on your mood! The platform learns your preferences over time. Pretty cool, right? 😎"
            },
            'privacy': {
                keywords: ['privacy', 'who can see', 'visibility', 'private', 'public', 'followers only', 'security'],
                response: "Your privacy is our priority! 🔒\n\nPost Visibility Options:\n• Public: Everyone can see\n• Followers: Only your followers\n• Private: Only you\n\nProfile Privacy:\n• Go to Settings > Privacy\n• Control who can message you\n• Block keywords from comments\n• Hide your online status\n\nWe never sell your data. Ever. 🛡️"
            },
            'ai features': {
                keywords: ['ai', 'artificial intelligence', 'smart', 'autonomous', 'what can ai do', 'features'],
                response: "G-Network has cutting-edge AI! 🤖✨\n\nOur AI Powers:\n1. 🪄 Magic Enhance - Better posts\n2. 🎨 Auto-Theming - Adapts to your mood\n3. 💬 Caption Generator - Instant ideas\n4. 🔮 Predictive Design - Platform evolves\n5. 🧞‍♂️ Me! - 24/7 support\n\nWe use Google Gemini & Groq for blazing-fast, intelligent assistance. The platform literally learns from your behavior!"
            },
            'settings': {
                keywords: ['settings', 'preferences', 'options', 'configure', 'control'],
                response: "Access Settings from the menu! ⚙️\n\nAvailable Options:\n• Profile - Edit name, bio, avatar\n• Privacy - Security controls\n• Appearance - Themes & display\n• Notifications - What alerts you\n• Advanced - AI settings, blocked words\n\nSettings icon is in your profile or navigation bar. Need help with a specific setting?"
            },
            'account': {
                keywords: ['account', 'profile', 'username', 'email', 'delete account', 'logout', 'sign out'],
                response: "Account Management 👤\n\nProfile Settings:\n• Edit in Profile > Edit Profile\n• Change username, bio, avatar\n• Add social links\n\nAccount Security:\n• Email/password managed via Firebase\n• Logout: Profile menu > Sign Out\n• Delete account: Settings > Advanced\n\nNeed to change something specific? Just ask!"
            }
        };
    }

    /**
     * Process User Chat with Intelligence
     */
    async chat(message, userContext) {
        const userId = userContext?.uid || 'anonymous';
        const userName = userContext?.name || 'friend';

        // Track conversation
        if (!this.conversationHistory.has(userId)) {
            this.conversationHistory.set(userId, []);
        }
        const history = this.conversationHistory.get(userId);
        history.push({ role: 'user', text: message });

        // Keep only last 6 messages for context
        if (history.length > 6) history.shift();

        const systemPrompt = `
            You are "G-Net Genie", the helpful AI assistant for G-Network social platform.
            
            Platform Features:
            - Magic Enhance: AI-powered post improvement (grammar, emojis, hashtags)
            - AI Theming: Autonomous color adaptation
            - Privacy Controls: Public/Followers/Private posts
            - Dark Mode: Beautiful themes
            
            User: ${userName}
            
            Recent conversation:
            ${history.map(h => `${h.role}: ${h.text}`).join('\n')}
            
            Respond briefly (2-3 sentences max), friendly, and helpful. If asked math/general knowledge, answer it.
        `;

        let reply = null;

        // 1. Check Training Data First (Learn from past)
        try {
            const trainedResponse = await trainingManager.generateResponseFromTraining(message);
            if (trainedResponse) {
                console.log('[SupportAgent] Using trained response');
                reply = trainedResponse;
                history.push({ role: 'ai', text: reply });

                // Log this conversation for continuous learning
                await trainingManager.addConversation(message, reply, {
                    userId: userContext?.uid,
                    autoApprove: false // Needs review
                });

                return reply;
            }
        } catch (error) {
            console.warn('[SupportAgent] Training data lookup failed');
        }

        // 2. Try Gemini AI
        try {
            if (this.visionModel) {
                const result = await this.visionModel.generateContent(systemPrompt);
                const response = await result.response;
                reply = response.text();
                history.push({ role: 'ai', text: reply });

                // Log successful AI responses for training
                await trainingManager.addConversation(message, reply, {
                    userId: userContext?.uid,
                    autoApprove: false
                });

                return reply;
            }
        } catch (error) {
            console.warn('[SupportAgent] AI Failed, using Enhanced Fallback');
        }

        // 3. Enhanced Intelligent Fallback
        reply = this.intelligentResponse(message, userName, history);
        history.push({ role: 'ai', text: reply });

        // Log fallback responses too (can be improved)
        await trainingManager.addConversation(message, reply, {
            userId: userContext?.uid,
            autoApprove: true // Auto-approve curated responses
        });

        return reply;
    }

    intelligentResponse(message, userName, history) {
        const lower = message.toLowerCase().trim();

        // 1. Greetings
        if (/^(hi|hello|hey|greetings|sup|yo|what's up|hola)$/i.test(lower)) {
            const greetings = [
                `Hey ${userName}! 👋 I'm here to help. What can I do for you?`,
                `Hello! 🧞‍♂️ Ask me anything about G-Network!`,
                `Hi there! ✨ Need help navigating the platform?`
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        }

        // 2. Math/Calculations
        if (/\d+\s*[\+\-\*\/x×÷]\s*\d+/.test(lower)) {
            try {
                const expr = lower.replace(/[^\d\+\-\*\/\(\)\.]/g, '').replace(/x|×/g, '*').replace(/÷/g, '/');
                const result = eval(expr); // Safe since we sanitized
                return `The answer is **${result}**! 🧮 (Though I'm better at helping with G-Network features 😉)`;
            } catch (e) {
                return "Hmm, I couldn't solve that. But I'm great at social network questions! Try asking about posts, AI features, or settings! 💬";
            }
        }

        // 3. Knowledge Base Search
        for (const [topic, data] of Object.entries(this.knowledgeBase)) {
            if (data.keywords.some(kw => lower.includes(kw))) {
                return data.response;
            }
        }

        // 4. Thank you
        if (/(thank|thanks|thx|appreciate|awesome|great|perfect)/.test(lower)) {
            return `You're welcome! 😊 Anything else I can help with? I'm here 24/7! 🧞‍♂️`;
        }

        // 5. Who/What are you
        if (/(who are you|what are you|your name|tell me about yourself)/.test(lower)) {
            return `I'm G-Net Genie, your AI assistant! 🧞‍♂️ I'm powered by advanced AI to help you with anything on G-Network - from creating posts to understanding features. Think of me as your personal guide! ✨`;
        }

        // 6. Help request
        if (/(help|assist|support|guide|how do|can you)/.test(lower)) {
            return `I can help with:\n• Creating & enhancing posts 📝\n• Privacy & settings ⚙️\n• AI features 🤖\n• Navigation tips 🗺️\n• General questions\n\nWhat would you like to know? 😊`;
        }

        // 7. Context-aware (follow-up)
        if (history.length > 2 && /(how|work|use|that|it|this|more|tell me more)/.test(lower)) {
            const lastAI = history.filter(h => h.role === 'ai').pop();
            if (lastAI && lastAI.text.includes('Magic Enhance')) {
                return "Magic Enhance transforms your posts with AI! Write something, click ✨ Enhance, and watch the magic happen. It adds emojis, hashtags, and makes your writing more engaging. Want to try it now? 🪄";
            }
        }


        // 8. General Knowledge Detection
        const generalKnowledgePatterns = [
            /who is|what is|tell me about|explain|define/i,
            /when did|where is|why does|how does/i
        ];

        const isGeneralKnowledge = generalKnowledgePatterns.some(pattern => pattern.test(message));

        if (isGeneralKnowledge && !lower.includes('g-network') && !lower.includes('platform')) {
            return `That's a great question! 🤔\n\nWhile I'm specialized in helping with G-Network features, I can definitely help you with:\n\n• Writing catchy posts ✍️\n• Using our AI tools 🤖\n• Privacy & settings ⚙️\n• Platform tips 🗺️\n\nFor general knowledge, I'd recommend searching online! But if you need help creating amazing content here, I'm your genie! 🧞‍♂️`;
        }

        // 9. Final Fallback
        return `Hmm, I'm not sure about that yet! 🤔\n\nBut I'm an expert at:\n• Creating & enhancing posts 📝\n• Privacy & settings ⚙️\n• AI features 🤖\n• Writing tips ✍️\n\nTry asking:\n"How do I write a catchy title?"\n"What can AI do?"\n"How do I create a post?"\n\nI'm here to help! 💬`;
    }
}

module.exports = new SupportAgent();
