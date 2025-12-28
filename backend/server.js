const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

const Chat = require('./models/Chat');
const Message = require('./models/Message');
const User = require('./models/User');

const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

require('dotenv').config();

const app = express();
const server = http.createServer(app);

// ================================
// SECURITY & MIDDLEWARE
// ================================

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Request logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================================
// SOCKET.IO SETUP
// ================================
const io = new Server(server, {
    cors: corsOptions,
    pingTimeout: 60000,
    pingInterval: 25000
});
app.set('socketio', io);

// ================================
// DATABASE CONNECTION
// ================================
connectDB();

// ================================
// HEALTH CHECK
// ================================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// ================================
// API ROUTES
// ================================
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/autonomous', require('./routes/autonomous'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/reels', require('./routes/reels'));

// ================================
// SOCKET.IO LOGIC
// ================================
io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    // User comes online
    socket.on('user_online', async (userData) => {
        try {
            const { firebaseUid, displayName, email, photoURL } = userData;

            let user = await User.findOne({ firebaseUid });
            if (!user) {
                console.log(`User ${firebaseUid} not found in DB yet, skipping presence update...`);
                return;
            }

            user.isOnline = true;
            if (!user.socketIds) user.socketIds = [];
            if (!user.socketIds.includes(socket.id)) {
                user.socketIds.push(socket.id);
            }
            user.lastSeen = new Date();
            await user.save();

            socket.join(firebaseUid);

            io.emit('user_presence_changed', {
                firebaseUid,
                displayName,
                photoURL,
                isOnline: true
            });

            console.log(`User ${displayName} (${firebaseUid}) is online`);
        } catch (err) {
            console.error('Error in user_online:', err);
        }
    });

    // WebRTC Signaling
    socket.on("call_user", ({ userToCall, signalData, from, name }) => {
        io.to(userToCall).emit("call_user", { signal: signalData, from, name });
    });

    socket.on("answer_call", (data) => {
        io.to(data.to).emit("call_accepted", data.signal);
    });

    socket.on("ice_candidate", ({ target, candidate }) => {
        io.to(target).emit("ice_candidate", { candidate });
    });

    socket.on("end_call", ({ to }) => {
        io.to(to).emit("call_ended");
    });

    // Typing Status
    socket.on('typing', async (data) => {
        try {
            const user = await User.findOne({ firebaseUid: data.senderId });
            socket.to(data.chatId).emit('display_typing', {
                chatId: data.chatId,
                senderId: data.senderId,
                senderName: user ? user.displayName : 'Someone',
                isTyping: data.isTyping
            });
        } catch (err) {
            socket.to(data.chatId).emit('display_typing', data);
        }
    });

    // Join rooms
    socket.on('join_personal_room', async (uid) => {
        socket.join(uid);
        console.log(`User ${uid} joined personal room`);

        const chats = await Chat.find({ participants: uid });
        chats.forEach(chat => {
            socket.join(chat._id.toString());
        });
    });

    socket.on('join_chat', (chatId) => {
        socket.join(chatId);
        console.log(`Socket ${socket.id} joined chat room ${chatId}`);
    });

    // Send Message
    socket.on('send_message', async (data) => {
        console.log("Message received:", data);

        try {
            let chat;

            if (!data.chatId) {
                chat = await Chat.findOne({
                    participants: { $all: [data.senderId, data.recipientId] }
                });

                if (!chat) {
                    chat = new Chat({
                        participants: [data.senderId, data.recipientId],
                        lastMessage: data.text
                    });
                    await chat.save();
                }
            } else {
                chat = await Chat.findById(data.chatId);
            }

            if (!chat) return;

            // Check for blocks
            if (!chat.isGroup) {
                const recipientId = data.recipientId || chat.participants.find(p => p !== data.senderId);
                const users = await User.find({ firebaseUid: { $in: [recipientId, data.senderId] } });
                const recipient = users.find(u => u.firebaseUid === recipientId);
                const sender = users.find(u => u.firebaseUid === data.senderId);

                if (recipient && recipient.blockedUsers.includes(data.senderId)) {
                    return socket.emit('error', { message: 'You are blocked by this user.' });
                }
                if (sender && sender.blockedUsers.includes(recipientId)) {
                    return socket.emit('error', { message: 'You have blocked this user.' });
                }
            }

            const newMessage = new Message({
                chatId: chat._id,
                senderId: data.senderId,
                text: data.text,
                mediaUrl: data.mediaUrl,
                mediaType: data.mediaType || 'text',
                replyTo: data.replyTo || null,
                timestamp: new Date()
            });

            await newMessage.save();
            await newMessage.populate('replyTo', 'senderId text mediaType');

            chat.lastMessage = data.mediaType && data.mediaType !== 'text' ? `Sent a ${data.mediaType}` : data.text;
            chat.lastMessageTimestamp = new Date();
            chat.unreadCounts.set(data.senderId, 0);

            chat.participants.forEach(p => {
                if (p !== data.senderId) {
                    const current = chat.unreadCounts.get(p) || 0;
                    chat.unreadCounts.set(p, current + 1);
                }
            });

            await chat.save();

            io.to(chat._id.toString()).emit('receive_message', newMessage);

            chat.participants.forEach(p => {
                if (p !== data.senderId) {
                    io.to(p).emit('notification', {
                        type: 'message',
                        senderName: data.senderId,
                        text: data.text || `Sent a ${data.mediaType}`,
                        chatId: chat._id
                    });

                    io.to(p).emit('chat_list_update', {
                        chatId: chat._id,
                        lastMessage: chat.lastMessage,
                        timestamp: chat.lastMessageTimestamp,
                        unreadCount: chat.unreadCounts.get(p)
                    });
                }
            });

            socket.emit('message_sent', { chatId: chat._id, message: newMessage });

            if (!chat.isGroup) {
                const recipientId = data.recipientId || chat.participants.find(p => p !== data.senderId);
                io.to(recipientId).emit('receive_message_individual', newMessage);
            }

            socket.to(data.senderId).emit('message_sent_sync', { chatId: chat._id, message: newMessage });

        } catch (err) {
            console.error("Socket Message Error:", err);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Mark messages as read
    socket.on('mark_messages_read', async (data) => {
        try {
            const result = await Message.updateMany(
                {
                    chatId: data.chatId,
                    senderId: { $ne: data.userId },
                    read: false
                },
                { read: true }
            );

            if (result.modifiedCount > 0) {
                io.to(data.chatId).emit('messages_read_update', {
                    chatId: data.chatId,
                    readBy: data.userId
                });
            }
        } catch (err) {
            console.error('Error marking messages read:', err);
        }
    });

    // Clear unread count
    socket.on('clear_unread_count', async (data) => {
        try {
            const chat = await Chat.findById(data.chatId);
            if (chat && chat.unreadCounts) {
                chat.unreadCounts.set(data.userId, 0);
                await chat.save();

                socket.emit('unread_count_updated', {
                    chatId: data.chatId,
                    count: 0
                });
            }
        } catch (err) {
            console.error('Error clearing unread count:', err);
        }
    });

    // Reels social features
    socket.on('join_reel', ({ reelId, user }) => {
        if (!reelId) return;
        socket.join(`reel_${reelId}`);
        socket.to(`reel_${reelId}`).emit('reel_viewer_joined', user);
    });

    socket.on('leave_reel', ({ reelId, userId }) => {
        if (!reelId) return;
        socket.leave(`reel_${reelId}`);
        socket.to(`reel_${reelId}`).emit('reel_viewer_left', { userId });
    });

    socket.on('send_reaction', ({ reelId, reaction, user }) => {
        socket.to(`reel_${reelId}`).emit('reel_reaction', { reaction, user });
    });

    // Disconnect
    socket.on('disconnect', async () => {
        console.log('User Disconnected:', socket.id);

        try {
            const user = await User.findOne({ socketIds: socket.id });
            if (user) {
                user.socketIds = user.socketIds.filter(id => id !== socket.id);

                if (user.socketIds.length === 0) {
                    user.isOnline = false;
                    user.lastSeen = new Date();

                    io.emit('user_presence_changed', {
                        firebaseUid: user.firebaseUid,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        isOnline: false
                    });
                    console.log(`User ${user.displayName} went offline`);
                }

                await user.save();
            }
        } catch (err) {
            console.error('Error in disconnect:', err);
        }
    });
});

// ================================
// ERROR HANDLERS
// ================================
app.use(notFound);
app.use(errorHandler);

// ================================
// GRACEFUL SHUTDOWN
// ================================
const PORT = process.env.PORT || 5000;

const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    server.close(() => {
        console.log('HTTP server closed');

        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
        console.error('Forcing shutdown after timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled rejection handler
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥', err);
    gracefulShutdown('UNHANDLED REJECTION');
});

// ================================
// START SERVER
// ================================
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌 Socket.io enabled`);
});

module.exports = { app, server, io };
