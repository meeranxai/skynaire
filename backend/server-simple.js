const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Simple in-memory storage (replace with MongoDB later)
let posts = [];
let users = [];
let chats = [];

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Socket.io setup
const io = socketIo(server, {
    cors: corsOptions
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Posts API
app.get('/api/posts', (req, res) => {
    res.json(posts.reverse());
});

app.post('/api/posts', (req, res) => {
    const { content, author, image } = req.body;
    
    const newPost = {
        _id: Date.now().toString(),
        content: content || '',
        author: author || 'Anonymous',
        image: image || null,
        createdAt: new Date().toISOString(),
        likes: [],
        comments: [],
        shares: 0
    };
    
    posts.push(newPost);
    
    // Emit to all connected clients
    io.emit('newPost', newPost);
    
    res.status(201).json(newPost);
});

app.post('/api/posts/:id/like', (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    
    const post = posts.find(p => p._id === id);
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    
    const likeIndex = post.likes.indexOf(userId || 'anonymous');
    if (likeIndex > -1) {
        post.likes.splice(likeIndex, 1);
    } else {
        post.likes.push(userId || 'anonymous');
    }
    
    io.emit('postUpdated', post);
    res.json(post);
});

app.post('/api/posts/:id/comment', (req, res) => {
    const { id } = req.params;
    const { content, author } = req.body;
    
    const post = posts.find(p => p._id === id);
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    
    const comment = {
        _id: Date.now().toString(),
        content: content || '',
        author: author || 'Anonymous',
        createdAt: new Date().toISOString()
    };
    
    post.comments.push(comment);
    
    io.emit('postUpdated', post);
    res.json(comment);
});

// Users API
app.get('/api/users', (req, res) => {
    res.json(users);
});

app.post('/api/users', (req, res) => {
    const { username, email, displayName } = req.body;
    
    const newUser = {
        _id: Date.now().toString(),
        username: username || `user${Date.now()}`,
        email: email || '',
        displayName: displayName || username || 'User',
        bio: '',
        profilePicture: null,
        followers: [],
        following: [],
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    res.status(201).json(newUser);
});

app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const user = users.find(u => u._id === id || u.username === id);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
});

// Chat API
app.get('/api/chats', (req, res) => {
    res.json(chats);
});

app.post('/api/chats', (req, res) => {
    const { message, sender, recipient } = req.body;
    
    const newMessage = {
        _id: Date.now().toString(),
        message: message || '',
        sender: sender || 'Anonymous',
        recipient: recipient || 'all',
        timestamp: new Date().toISOString(),
        read: false
    };
    
    chats.push(newMessage);
    
    // Emit to specific user or all
    if (recipient && recipient !== 'all') {
        io.to(recipient).emit('newMessage', newMessage);
    } else {
        io.emit('newMessage', newMessage);
    }
    
    res.status(201).json(newMessage);
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });
    
    socket.on('sendMessage', (data) => {
        const message = {
            _id: Date.now().toString(),
            message: data.message,
            sender: data.sender,
            recipient: data.recipient,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        chats.push(message);
        
        if (data.recipient && data.recipient !== 'all') {
            socket.to(data.recipient).emit('newMessage', message);
        } else {
            socket.broadcast.emit('newMessage', message);
        }
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Simple G-Network Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌 Socket.io enabled`);
    console.log(`💾 Using in-memory storage (no database required)`);
});

module.exports = app;