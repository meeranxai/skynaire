# G-Network Messenger System

## Overview

A professional, feature-rich real-time messaging system integrated into the G-Network social media platform. Built with React, Socket.io, and MongoDB.

## Features

### 🎯 Core Messaging
- ✅ Real-time messaging with Socket.io
- ✅ One-on-one and group chats
- ✅ Message delivery and read receipts
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Message search within conversations
- ✅ Chat history with pagination

### 💬 Rich Message Types
- ✅ Text messages
- ✅ Image sharing
- ✅ File attachments
- ✅ Voice messages (with recording)
- ✅ Location sharing
- ✅ Contact sharing
- ✅ Polls
- ✅ GIFs and stickers

### ⚡ Advanced Features
- ✅ Message reactions (emoji)
- ✅ Reply to messages
- ✅ Forward messages
- ✅ Edit messages (within 15 minutes)
- ✅ Delete messages
- ✅ Pin messages
- ✅ Message threads
- ✅ Scheduled messages
- ✅ Disappearing messages

### 👥 Group Features
- ✅ Create group chats
- ✅ Add/remove participants
- ✅ Group admin controls
- ✅ Group moderators
- ✅ Custom group settings
- ✅ Group avatar and description

### 🎨 User Experience
- ✅ Modern, clean UI with glassmorphism
- ✅ Smooth animations and transitions
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support
- ✅ Keyboard shortcuts
- ✅ Accessibility features

## File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   └── Messages.jsx          # Main messenger component
│   ├── styles/
│   │   └── messenger.css         # Messenger styles
│   └── App.jsx                   # Routes configuration

backend/
├── routes/
│   └── chat.js                   # Chat API routes
├── models/
│   ├── Chat.js                   # Chat model
│   └── Message.js                # Message model
└── server.js                     # Socket.io configuration
```

## API Endpoints

### Chat Management
- `GET /api/chat/history/:userId` - Get user's chat list
- `GET /api/chat/:chatId/messages` - Get messages for a chat
- `GET /api/chat/:chatId/search?q=query` - Search messages in chat
- `POST /api/chat/:id/read` - Mark messages as read
- `POST /api/chat/:id/clear` - Clear chat history
- `DELETE /api/chat/:id` - Delete chat
- `POST /api/chat/:id/mute` - Mute/unmute chat
- `POST /api/chat/:id/archive` - Archive chat

### Messages
- `POST /api/chat/upload-media` - Upload media files
- `PUT /api/chat/message/:id/edit` - Edit message
- `DELETE /api/chat/message/:id` - Delete message
- `POST /api/chat/forward` - Forward messages
- `POST /api/chat/message/:id/react` - Add reaction
- `POST /api/chat/message/:id/pin` - Pin/unpin message

### Group Chats
- `POST /api/chat/groups/create` - Create group
- `PUT /api/chat/groups/:id/participants` - Add participants
- `DELETE /api/chat/groups/:id/participants` - Remove participants

### Special Message Types
- `POST /api/chat/location` - Send location
- `POST /api/chat/contact` - Send contact
- `POST /api/chat/poll` - Create poll
- `POST /api/chat/poll/:messageId/vote` - Vote on poll
- `POST /api/chat/schedule` - Schedule message

## Socket.io Events

### Client → Server
- `send_message` - Send a new message
- `typing` - User started typing
- `stop_typing` - User stopped typing
- `join_room` - Join chat room
- `leave_room` - Leave chat room

### Server → Client
- `receive_message` - New message received
- `user_typing` - Someone is typing
- `user_stopped_typing` - Someone stopped typing
- `message_read_update` - Messages marked as read
- `message_reaction_update` - Reaction added/removed
- `message_deleted` - Message deleted
- `message_updated` - Message edited
- `online_users` - Online users list updated
- `new_group_created` - Added to new group
- `group_updated` - Group info updated

## Usage

### Basic Setup

1. **Start the backend server**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Navigate to Messages**
   - Click on "Messages" in the sidebar
   - Or visit `/messages` directly

### Sending Messages

```javascript
// Text message
socket.emit('send_message', {
  chatId: 'chat_id',
  senderId: currentUser.uid,
  text: 'Hello!',
  timestamp: new Date()
});

// Image message
socket.emit('send_message', {
  chatId: 'chat_id',
  senderId: currentUser.uid,
  mediaUrl: '/uploads/image.jpg',
  mediaType: 'image',
  timestamp: new Date()
});
```

### Message Reactions

```javascript
// Add reaction
await fetch(`${API_URL}/api/chat/message/${messageId}/react`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ emoji: '❤️', userId: currentUser.uid })
});
```

## Styling

The messenger uses CSS custom properties for theming:

```css
--primary: #667eea;
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--bg-body: #f5f7fb;
--text-primary: #1a1a1a;
--text-secondary: #666;
```

### Key Design Elements

- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Gradients**: Vibrant purple gradient accents
- **Smooth Animations**: CSS transitions and keyframe animations
- **Micro-interactions**: Hover effects, button animations
- **Responsive Grid**: CSS Grid for layout
- **Flexbox**: For component alignment

## Mobile Experience

The messenger is fully responsive:

- **Mobile (< 768px)**: Stack layout, full-width chat
- **Tablet (768px - 1024px)**: 2-column layout
- **Desktop (> 1024px)**: 3-column layout with info sidebar

### Mobile Features
- Swipe gestures (future enhancement)
- Bottom sheet for media picker
- Optimized tap targets
- Reduced animations for performance

## Performance Optimizations

1. **Message Virtualization**: Load messages on scroll (pagination)
2. **Image Lazy Loading**: Images load as they enter viewport
3. **Debounced Typing**: Typing indicators debounced by 1s
4. **Socket Connection Pool**: Efficient socket management
5. **Optimistic UI Updates**: Instant feedback before server confirmation

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **ARIA Labels**: Proper ARIA attributes on all interactive elements
- **Focus Management**: Clear focus indicators
- **Screen Reader Support**: Semantic HTML and labels
- **Reduced Motion**: Respects `prefers-reduced-motion` setting

## Security

- **Authentication**: Firebase Auth required
- **Authorization**: Users can only access their chats
- **Input Sanitization**: All inputs sanitized server-side
- **File Upload Validation**: Type and size checks
- **Rate Limiting**: Socket event rate limiting (backend)

## Future Enhancements

- [ ] End-to-end encryption
- [ ] Video/audio calls
- [ ] Screen sharing
- [ ] Message translation
- [ ] Voice-to-text
- [ ] Smart replies (AI-powered)
- [ ] Message scheduling UI
- [ ] Broadcast channels
- [ ] Custom stickers
- [ ] Message analytics

## Troubleshooting

### Messages not sending
- Check if Socket.io is connected: `socket.connected`
- Verify backend is running on correct port
- Check browser console for errors

### Real-time updates not working
- Ensure socket listeners are set up in useEffect
- Verify room joining: `socket.emit('join_room', chatId)`
- Check server-side socket events

### Media upload fails
- Check file size limit (default: 10MB)
- Verify MIME type is allowed
- Ensure uploads directory exists and is writable

## Contributing

When adding new features:

1. Update both frontend and backend
2. Add proper error handling
3. Update this README
4. Test on mobile devices
5. Check accessibility
6. Add socket events if needed

## License

Part of the G-Network social media platform.

---

**Built with ❤️ for G-Network**
