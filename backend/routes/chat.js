const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const chatMediaUpload = require('../middleware/upload');

// Chat Media Upload
router.post('/upload-media', chatMediaUpload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const mediaUrl = `/${req.file.path.replace(/\\/g, '/')}`;
        const mediaMetadata = {
            filename: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype
        };

        res.json({
            success: true,
            mediaUrl,
            mediaMetadata,
            mediaType: req.file.mimetype.startsWith('image/') ? 'image'
                : req.file.mimetype.startsWith('audio/') ? 'voice'
                    : 'file'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Group API Routes (Phase 6)
router.post('/groups/create', async (req, res) => {
    try {
        const { groupName, participants, adminId } = req.body;
        const io = req.app.get('socketio');

        if (!groupName || !participants || participants.length < 2) {
            return res.status(400).json({ error: 'Group name and at least 2 participants required' });
        }

        // Add admin to participants if not already there
        const allParticipants = [...new Set([...participants, adminId])];

        const newGroup = new Chat({
            participants: allParticipants,
            isGroup: true,
            groupName,
            groupAdmin: adminId,
            unreadCounts: new Map()
        });

        await newGroup.save();

        // Broadcast to all participants that they are in a new group
        // We iterate and emit to each user's room if they are online
        allParticipants.forEach(pId => {
            // Check if user is connected (optional optimization, but io.to is safe)
            if (io) io.to(pId).emit('new_group_created', newGroup);
        });

        res.json(newGroup);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/groups/:id/participants', async (req, res) => {
    try {
        const { chatId } = req.params;
        const { userIds, adminId } = req.body;

        const chat = await Chat.findById(req.params.id);
        if (!chat) return res.status(404).json({ error: 'Chat not found' });
        if (chat.groupAdmin !== adminId) return res.status(403).json({ error: 'Only admin can add participants' });

        // Add new members
        const newMembers = userIds.filter(id => !chat.participants.includes(id));
        if (newMembers.length === 0) return res.status(400).json({ error: 'Users already in group' });

        chat.participants.push(...newMembers);
        // Initialize unread counts for new members
        newMembers.forEach(id => chat.unreadCounts.set(id, 0));

        await chat.save();

        // Notify
        const io = req.app.get('socketio');
        if (io) {
            io.to(req.params.id).emit('group_updated', { type: 'add', participants: chat.participants });
            newMembers.forEach(id => io.to(id).emit('new_group_created', chat)); // Let them know they are added
        }

        res.json(chat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/groups/:id/participants', async (req, res) => {
    try {
        const { userId, adminId } = req.body;
        // usage: userId is the one to remove. If adminId matches groupAdmin, they can remove anyone. 
        // If userId matches requestor and they want to LEAVE, that's also valid.

        const chat = await Chat.findById(req.params.id);
        if (!chat) return res.status(404).json({ error: 'Chat not found' });

        const isSelf = userId === adminId; // If adminId passed is the user themselves (leaving)
        const isAdmin = chat.groupAdmin === adminId;

        if (!isSelf && !isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        chat.participants = chat.participants.filter(id => id !== userId);
        chat.unreadCounts.delete(userId);

        if (chat.participants.length === 0) {
            await Chat.findByIdAndDelete(req.params.id);
            // notify delete
        } else {
            await chat.save();
            const io = req.app.get('socketio');
            if (io) io.to(req.params.id).emit('group_updated', { type: 'remove', exitedId: userId, participants: chat.participants });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Message Reactions (Phase 6)
router.post('/message/:id/react', async (req, res) => {
    try {
        const { emoji, userId } = req.body;
        const messageId = req.params.id;
        const io = req.app.get('socketio');

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: 'Message not found' });

        // Remove existing reaction by this user if any
        message.reactions = message.reactions.filter(r => r.userId !== userId);

        // Add new reaction if emoji is provided (toggle behavior: empty emoji removes it)
        if (emoji) {
            message.reactions.push({ userId, emoji });
        }

        await message.save();

        // Broadcast reaction to the chat room
        if (io) {
            io.to(message.chatId.toString()).emit('message_reaction_update', {
                messageId: message._id,
                reactions: message.reactions
            });
        }

        res.json({ success: true, reactions: message.reactions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Chat Management (Phase 7)
router.post('/:id/clear', async (req, res) => {
    try {
        const { userId } = req.body;
        const chatId = req.params.id;
        const io = req.app.get('socketio');

        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(userId)) {
            return res.status(403).json({ error: 'Unauthorized or chat not found' });
        }

        await Message.deleteMany({ chatId });

        // Update last message
        chat.lastMessage = '';
        await chat.save();

        if (io) io.to(chatId).emit('chat_cleared', { chatId });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark messages read (Phase 8 - Real-time)
router.post('/:id/read', async (req, res) => {
    try {
        const { userId } = req.body;
        const chatId = req.params.id;
        const io = req.app.get('socketio');

        // Broadcast "messages read" so sender sees blue ticks
        if (io) io.to(chatId).emit('messages_read_update', { chatId, readerId: userId });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { userId } = req.body;
        const chatId = req.params.id;
        const io = req.app.get('socketio');

        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(userId)) {
            return res.status(403).json({ error: 'Unauthorized or chat not found' });
        }

        await Message.deleteMany({ chatId });
        await Chat.findByIdAndDelete(chatId);

        if (io) io.to(chatId).emit('chat_deleted', { chatId });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/mute', async (req, res) => {
    try {
        const { userId } = req.body;
        const chatId = req.params.id;
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ error: 'Chat not found' });

        const isMuted = chat.mutedBy.includes(userId);
        if (isMuted) {
            chat.mutedBy = chat.mutedBy.filter(id => id !== userId);
        } else {
            chat.mutedBy.push(userId);
        }

        await chat.save();
        res.json({ success: true, muted: !isMuted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/disappearing', async (req, res) => {
    try {
        const { userId } = req.body;
        const chatId = req.params.id;
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ error: 'Chat not found' });

        // Toggle: if current > 0, turn off (0). If 0, turn on (24h = 86400s)
        chat.disappearingTimer = chat.disappearingTimer > 0 ? 0 : 86400;

        await chat.save();
        res.json({ success: true, timer: chat.disappearingTimer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Routes for Chat History (Phase 1)
router.get('/unread-counts/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const chats = await Chat.find({ participants: userId, [`unreadCounts.${userId}`]: { $gt: 0 } });

        const counts = chats.map(c => ({
            chatId: c._id,
            count: c.unreadCounts.get(userId) || 0
        }));

        res.json(counts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/history/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        // Find chats where user is participant
        const chats = await Chat.find({ participants: userId }).sort({ lastMessageAt: -1 });
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get messages for a chat with pagination and search
router.get('/:chatId/messages', async (req, res) => {
    try {
        const { offset = 0, limit = 50 } = req.query;
        const messages = await Message.find({ chatId: req.params.chatId })
            .populate('replyTo', 'senderId text mediaType') // Populate quoted msg
            .sort({ timestamp: -1 }) // Latest first for pagination
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .lean();
        
        // Reverse to get chronological order for display
        res.json(messages.reverse());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Search Messages in a Chat
router.get('/:chatId/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) {
            return res.json([]);
        }

        const messages = await Message.find({
            chatId: req.params.chatId,
            text: { $regex: q, $options: 'i' }
        })
        .populate('replyTo', 'senderId text mediaType')
        .sort({ timestamp: -1 })
        .limit(20)
        .lean();

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit Message
router.put('/message/:id/edit', async (req, res) => {
    try {
        const { text, userId } = req.body;
        const messageId = req.params.id;
        const io = req.app.get('socketio');

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: 'Message not found' });
        if (message.senderId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        // Only allow editing text messages within 15 minutes
        const fifteenMinutes = 15 * 60 * 1000;
        if (Date.now() - new Date(message.timestamp).getTime() > fifteenMinutes) {
            return res.status(400).json({ error: 'Message too old to edit' });
        }

        message.text = text;
        message.edited = true;
        message.editedAt = new Date();
        await message.save();

        // Broadcast update to chat room
        if (io) {
            io.to(message.chatId.toString()).emit('message_updated', message);
        }

        res.json({ success: true, message });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Message
router.delete('/message/:id', async (req, res) => {
    try {
        const { userId } = req.body;
        const messageId = req.params.id;
        const io = req.app.get('socketio');

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: 'Message not found' });
        if (message.senderId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        await Message.findByIdAndDelete(messageId);

        // Broadcast deletion to chat room
        if (io) {
            io.to(message.chatId.toString()).emit('message_deleted', messageId);
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Forward Messages
router.post('/forward', async (req, res) => {
    try {
        const { messageIds, targetChatIds, senderId } = req.body;
        const io = req.app.get('socketio');

        const messages = await Message.find({ _id: { $in: messageIds } });
        const forwardedMessages = [];

        for (const targetChatId of targetChatIds) {
            for (const originalMessage of messages) {
                const forwardedMessage = new Message({
                    chatId: targetChatId,
                    senderId,
                    text: originalMessage.text,
                    mediaUrl: originalMessage.mediaUrl,
                    mediaType: originalMessage.mediaType,
                    mediaMetadata: originalMessage.mediaMetadata,
                    forwarded: true,
                    originalSender: originalMessage.senderId,
                    timestamp: new Date()
                });

                await forwardedMessage.save();
                forwardedMessages.push(forwardedMessage);

                // Update chat's last message
                const chat = await Chat.findById(targetChatId);
                if (chat) {
                    chat.lastMessage = originalMessage.mediaType !== 'text' 
                        ? `Forwarded a ${originalMessage.mediaType}` 
                        : `Forwarded: ${originalMessage.text}`;
                    chat.lastMessageAt = new Date();
                    await chat.save();
                }

                // Broadcast to target chat
                if (io) {
                    io.to(targetChatId).emit('receive_message', forwardedMessage);
                }
            }
        }

        res.json({ success: true, forwardedCount: forwardedMessages.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
// ============================================
// ADVANCED MESSAGING FEATURES
// ============================================

// Send Location Message
router.post('/location', async (req, res) => {
    try {
        const { chatId, senderId, latitude, longitude, address } = req.body;
        const io = req.app.get('socketio');

        const message = new Message({
            chatId,
            senderId,
            mediaType: 'location',
            mediaMetadata: {
                latitude,
                longitude,
                address
            }
        });

        await message.save();

        // Update chat
        const chat = await Chat.findById(chatId);
        if (chat) {
            chat.lastMessage = 'Shared location';
            chat.lastMessageAt = new Date();
            await chat.save();
        }

        // Broadcast
        if (io) {
            io.to(chatId).emit('receive_message', message);
        }

        res.json({ success: true, message });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send Contact Message
router.post('/contact', async (req, res) => {
    try {
        const { chatId, senderId, contactName, contactPhone, contactEmail } = req.body;
        const io = req.app.get('socketio');

        const message = new Message({
            chatId,
            senderId,
            mediaType: 'contact',
            text: `Contact: ${contactName}`,
            mediaMetadata: {
                contactName,
                contactPhone,
                contactEmail
            }
        });

        await message.save();

        // Update chat
        const chat = await Chat.findById(chatId);
        if (chat) {
            chat.lastMessage = `Shared contact: ${contactName}`;
            chat.lastMessageAt = new Date();
            await chat.save();
        }

        // Broadcast
        if (io) {
            io.to(chatId).emit('receive_message', message);
        }

        res.json({ success: true, message });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Poll
router.post('/poll', async (req, res) => {
    try {
        const { chatId, senderId, question, options, multipleChoice = false, expiresIn = 86400 } = req.body;
        const io = req.app.get('socketio');

        const expiresAt = new Date(Date.now() + (expiresIn * 1000));

        const message = new Message({
            chatId,
            senderId,
            mediaType: 'poll',
            text: question,
            mediaMetadata: {
                pollQuestion: question,
                pollOptions: options,
                pollVotes: [],
                pollMultipleChoice: multipleChoice,
                pollExpiresAt: expiresAt
            }
        });

        await message.save();

        // Update chat
        const chat = await Chat.findById(chatId);
        if (chat) {
            chat.lastMessage = `Poll: ${question}`;
            chat.lastMessageAt = new Date();
            await chat.save();
        }

        // Broadcast
        if (io) {
            io.to(chatId).emit('receive_message', message);
        }

        res.json({ success: true, message });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Vote on Poll
router.post('/poll/:messageId/vote', async (req, res) => {
    try {
        const { userId, optionIndex } = req.body;
        const messageId = req.params.messageId;
        const io = req.app.get('socketio');

        const message = await Message.findById(messageId);
        if (!message || message.mediaType !== 'poll') {
            return res.status(404).json({ error: 'Poll not found' });
        }

        // Check if poll has expired
        if (message.mediaMetadata.pollExpiresAt && new Date() > message.mediaMetadata.pollExpiresAt) {
            return res.status(400).json({ error: 'Poll has expired' });
        }

        // Remove existing vote if not multiple choice
        if (!message.mediaMetadata.pollMultipleChoice) {
            message.mediaMetadata.pollVotes = message.mediaMetadata.pollVotes.filter(
                vote => vote.userId !== userId
            );
        }

        // Add new vote
        message.mediaMetadata.pollVotes.push({
            userId,
            option: optionIndex,
            timestamp: new Date()
        });

        await message.save();

        // Broadcast update
        if (io) {
            io.to(message.chatId.toString()).emit('poll_updated', {
                messageId,
                votes: message.mediaMetadata.pollVotes
            });
        }

        res.json({ success: true, votes: message.mediaMetadata.pollVotes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Schedule Message
router.post('/schedule', async (req, res) => {
    try {
        const { chatId, senderId, text, mediaUrl, mediaType, scheduledFor } = req.body;

        const message = new Message({
            chatId,
            senderId,
            text,
            mediaUrl,
            mediaType: mediaType || 'text',
            scheduled: true,
            scheduledFor: new Date(scheduledFor)
        });

        await message.save();
        res.json({ success: true, message });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Scheduled Messages
router.get('/scheduled/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const messages = await Message.find({
            senderId: userId,
            scheduled: true,
            scheduledFor: { $gt: new Date() }
        }).populate('chatId', 'groupName participants isGroup').sort({ scheduledFor: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cancel Scheduled Message
router.delete('/scheduled/:messageId', async (req, res) => {
    try {
        const { userId } = req.body;
        const messageId = req.params.messageId;

        const message = await Message.findOne({
            _id: messageId,
            senderId: userId,
            scheduled: true
        });

        if (!message) {
            return res.status(404).json({ error: 'Scheduled message not found' });
        }

        await Message.findByIdAndDelete(messageId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Pin Message
router.post('/message/:id/pin', async (req, res) => {
    try {
        const { userId } = req.body;
        const messageId = req.params.id;
        const io = req.app.get('socketio');

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: 'Message not found' });

        const chat = await Chat.findById(message.chatId);
        if (!chat) return res.status(404).json({ error: 'Chat not found' });

        // Check permissions (admin/moderator for groups)
        if (chat.isGroup && chat.groupAdmin !== userId && !chat.groupModerators.includes(userId)) {
            return res.status(403).json({ error: 'Only admins can pin messages in groups' });
        }

        // Toggle pin status
        const isAlreadyPinned = chat.pinnedMessages.some(p => p.messageId.toString() === messageId);
        
        if (isAlreadyPinned) {
            chat.pinnedMessages = chat.pinnedMessages.filter(p => p.messageId.toString() !== messageId);
            message.pinned = false;
        } else {
            chat.pinnedMessages.push({
                messageId,
                pinnedBy: userId,
                pinnedAt: new Date()
            });
            message.pinned = true;
            message.pinnedAt = new Date();
        }

        await Promise.all([chat.save(), message.save()]);

        // Broadcast
        if (io) {
            io.to(message.chatId.toString()).emit('message_pinned', {
                messageId,
                pinned: message.pinned,
                pinnedBy: userId
            });
        }

        res.json({ success: true, pinned: message.pinned });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Pinned Messages
router.get('/:chatId/pinned', async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const chat = await Chat.findById(chatId).populate({
            path: 'pinnedMessages.messageId',
            model: 'Message'
        });

        if (!chat) return res.status(404).json({ error: 'Chat not found' });

        const pinnedMessages = chat.pinnedMessages
            .filter(p => p.messageId) // Filter out deleted messages
            .sort((a, b) => new Date(b.pinnedAt) - new Date(a.pinnedAt));

        res.json(pinnedMessages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Message Threads/Replies
router.post('/message/:id/thread', async (req, res) => {
    try {
        const { senderId, text, mediaUrl, mediaType } = req.body;
        const parentMessageId = req.params.id;
        const io = req.app.get('socketio');

        const parentMessage = await Message.findById(parentMessageId);
        if (!parentMessage) return res.status(404).json({ error: 'Parent message not found' });

        const threadMessage = new Message({
            chatId: parentMessage.chatId,
            senderId,
            text,
            mediaUrl,
            mediaType: mediaType || 'text',
            threadId: parentMessageId
        });

        await threadMessage.save();

        // Broadcast
        if (io) {
            io.to(parentMessage.chatId.toString()).emit('thread_message', {
                parentMessageId,
                message: threadMessage
            });
        }

        res.json({ success: true, message: threadMessage });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Thread Messages
router.get('/message/:id/thread', async (req, res) => {
    try {
        const parentMessageId = req.params.id;
        const messages = await Message.find({ threadId: parentMessageId })
            .sort({ timestamp: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Archive Chat
router.post('/:id/archive', async (req, res) => {
    try {
        const { userId } = req.body;
        const chatId = req.params.id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ error: 'Chat not found' });

        const isArchived = chat.archivedBy.includes(userId);
        if (isArchived) {
            chat.archivedBy = chat.archivedBy.filter(id => id !== userId);
        } else {
            chat.archivedBy.push(userId);
        }

        await chat.save();
        res.json({ success: true, archived: !isArchived });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Archived Chats
router.get('/archived/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const chats = await Chat.find({
            participants: userId,
            archivedBy: userId
        }).sort({ lastMessageAt: -1 });

        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Broadcast Messages (for channels/announcements)
router.post('/broadcast', async (req, res) => {
    try {
        const { senderId, text, mediaUrl, mediaType, targetChats } = req.body;
        const io = req.app.get('socketio');

        const broadcastMessages = [];

        for (const chatId of targetChats) {
            const message = new Message({
                chatId,
                senderId,
                text,
                mediaUrl,
                mediaType: mediaType || 'text',
                priority: 'high'
            });

            await message.save();
            broadcastMessages.push(message);

            // Update chat
            const chat = await Chat.findById(chatId);
            if (chat) {
                chat.lastMessage = text || `Sent a ${mediaType}`;
                chat.lastMessageAt = new Date();
                await chat.save();
            }

            // Broadcast
            if (io) {
                io.to(chatId).emit('receive_message', message);
            }
        }

        res.json({ success: true, messagesSent: broadcastMessages.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Message Translation
router.post('/message/:id/translate', async (req, res) => {
    try {
        const { targetLanguage } = req.body;
        const messageId = req.params.id;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: 'Message not found' });

        // Here you would integrate with a translation service like Google Translate
        // For now, we'll return a placeholder
        const translatedText = `[Translated to ${targetLanguage}] ${message.text}`;

        res.json({ 
            success: true, 
            originalText: message.text,
            translatedText,
            targetLanguage 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Message Statistics
router.get('/stats/:chatId', async (req, res) => {
    try {
        const chatId = req.params.chatId;
        
        const stats = await Message.aggregate([
            { $match: { chatId: new mongoose.Types.ObjectId(chatId) } },
            {
                $group: {
                    _id: '$senderId',
                    messageCount: { $sum: 1 },
                    mediaCount: { 
                        $sum: { 
                            $cond: [{ $ne: ['$mediaType', 'text'] }, 1, 0] 
                        } 
                    },
                    lastMessage: { $max: '$timestamp' }
                }
            },
            { $sort: { messageCount: -1 } }
        ]);

        const totalMessages = await Message.countDocuments({ chatId });
        const mediaMessages = await Message.countDocuments({ 
            chatId, 
            mediaType: { $ne: 'text' } 
        });

        res.json({
            totalMessages,
            mediaMessages,
            textMessages: totalMessages - mediaMessages,
            userStats: stats
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export Chat History
router.get('/:chatId/export', async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const { format = 'json', startDate, endDate } = req.query;

        let query = { chatId };
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const messages = await Message.find(query)
            .populate('replyTo', 'text senderId')
            .sort({ timestamp: 1 });

        const chat = await Chat.findById(chatId);

        const exportData = {
            chatInfo: {
                name: chat.isGroup ? chat.groupName : 'Direct Message',
                participants: chat.participants,
                isGroup: chat.isGroup,
                createdAt: chat.createdAt,
                exportedAt: new Date()
            },
            messages: messages.map(msg => ({
                id: msg._id,
                senderId: msg.senderId,
                text: msg.text,
                mediaType: msg.mediaType,
                mediaUrl: msg.mediaUrl,
                timestamp: msg.timestamp,
                edited: msg.edited,
                forwarded: msg.forwarded,
                replyTo: msg.replyTo
            }))
        };

        if (format === 'csv') {
            // Convert to CSV format
            const csv = messages.map(msg => 
                `"${msg.timestamp}","${msg.senderId}","${msg.text.replace(/"/g, '""')}","${msg.mediaType}"`
            ).join('\n');
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="chat-${chatId}.csv"`);
            res.send(`"Timestamp","Sender","Message","Type"\n${csv}`);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="chat-${chatId}.json"`);
            res.json(exportData);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Advanced Search with Filters
router.get('/:chatId/search/advanced', async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const { 
            q, 
            senderId, 
            mediaType, 
            startDate, 
            endDate, 
            hasMedia, 
            isForwarded,
            limit = 20 
        } = req.query;

        let query = { chatId };

        if (q) {
            query.text = { $regex: q, $options: 'i' };
        }

        if (senderId) {
            query.senderId = senderId;
        }

        if (mediaType) {
            query.mediaType = mediaType;
        }

        if (hasMedia === 'true') {
            query.mediaType = { $ne: 'text' };
        }

        if (isForwarded === 'true') {
            query.forwarded = true;
        }

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const messages = await Message.find(query)
            .populate('replyTo', 'senderId text mediaType')
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});