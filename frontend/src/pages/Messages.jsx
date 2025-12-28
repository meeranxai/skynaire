import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import '../styles/messenger.css';

const Messages = () => {
    const { currentUser } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [showChatInfo, setShowChatInfo] = useState(false);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [isRecordingVoice, setIsRecordingVoice] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const voiceRecorderRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Fetch chat history
    useEffect(() => {
        if (currentUser?.uid) {
            fetchChatHistory();
        }
    }, [currentUser]);

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', handleReceiveMessage);
        socket.on('user_typing', handleUserTyping);
        socket.on('user_stopped_typing', handleUserStoppedTyping);
        socket.on('message_read_update', handleMessageRead);
        socket.on('message_reaction_update', handleReactionUpdate);
        socket.on('message_deleted', handleMessageDeleted);
        socket.on('message_updated', handleMessageUpdated);
        socket.on('online_users', setOnlineUsers);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('user_typing', handleUserTyping);
            socket.off('user_stopped_typing', handleUserStoppedTyping);
            socket.off('message_read_update', handleMessageRead);
            socket.off('message_reaction_update', handleReactionUpdate);
            socket.off('message_deleted', handleMessageDeleted);
            socket.off('message_updated', handleMessageUpdated);
            socket.off('online_users', setOnlineUsers);
        };
    }, [socket]);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchChatHistory = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/history/${currentUser.uid}`);

            // Handle rate limiting and errors
            if (!response.ok) {
                if (response.status === 429) {
                    console.warn('Rate limited - chat history');
                    setChats([]); // Set empty array instead of crashing
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Ensure data is an array before setting state
            setChats(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching chat history:', error);
            setChats([]); // Prevent undefined errors
        }
    };

    const fetchMessages = async (chatId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${chatId}/messages`);

            // Handle rate limiting and errors
            if (!response.ok) {
                if (response.status === 429) {
                    console.warn('Rate limited - messages');
                    setMessages([]);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Ensure data is an array
            setMessages(Array.isArray(data) ? data : []);

            // Mark as read (ignore if rate limited)
            try {
                await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${chatId}/read`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUser.uid })
                });
            } catch (readError) {
                // Silently fail on read receipt
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([]); // Prevent undefined errors
        }
    };

    const handleChatSelect = async (chat) => {
        setSelectedChat(chat);
        await fetchMessages(chat._id);
        if (socket) {
            socket.emit('join_room', chat._id);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !mediaPreview) return;
        if (!socket) {
            console.warn('Socket not connected. Message not sent.');
            return;
        }

        const messageData = {
            chatId: selectedChat._id,
            senderId: currentUser.uid,
            text: newMessage,
            replyTo: replyingTo?._id || null,
            timestamp: new Date()
        };

        if (mediaPreview) {
            messageData.mediaUrl = mediaPreview.url;
            messageData.mediaType = mediaPreview.type;
            messageData.mediaMetadata = mediaPreview.metadata;
        }

        // Emit via socket
        socket.emit('send_message', messageData);

        // Add to local state optimistically
        setMessages(prev => [...prev, messageData]);
        setNewMessage('');
        setReplyingTo(null);
        setMediaPreview(null);

        // Stop typing indicator
        socket.emit('stop_typing', { chatId: selectedChat._id, userId: currentUser.uid });
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!socket) return; // Add safety check

        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing', { chatId: selectedChat._id, userId: currentUser.uid });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            if (socket) {
                socket.emit('stop_typing', { chatId: selectedChat._id, userId: currentUser.uid });
            }
        }, 1000);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/upload-media`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            setMediaPreview({
                url: data.mediaUrl,
                type: data.mediaType,
                metadata: data.mediaMetadata
            });
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleVoiceRecord = async () => {
        if (!isRecordingVoice) {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                const audioChunks = [];

                mediaRecorder.addEventListener('dataavailable', event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener('stop', async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const formData = new FormData();
                    formData.append('file', audioBlob, 'voice-message.webm');

                    try {
                        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/upload-media`, {
                            method: 'POST',
                            body: formData
                        });
                        const data = await response.json();

                        setMediaPreview({
                            url: data.mediaUrl,
                            type: 'voice',
                            metadata: data.mediaMetadata
                        });
                    } catch (error) {
                        console.error('Error uploading voice:', error);
                    }

                    stream.getTracks().forEach(track => track.stop());
                });

                voiceRecorderRef.current = mediaRecorder;
                mediaRecorder.start();
                setIsRecordingVoice(true);
            } catch (error) {
                console.error('Error accessing microphone:', error);
            }
        } else {
            // Stop recording
            voiceRecorderRef.current?.stop();
            setIsRecordingVoice(false);
        }
    };

    const handleReaction = async (messageId, emoji) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/chat/message/${messageId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emoji, userId: currentUser.uid })
            });
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/chat/message/${messageId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid })
            });
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleSearchMessages = async (query) => {
        if (!query.trim() || !selectedChat) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/chat/${selectedChat._id}/search?q=${encodeURIComponent(query)}`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching messages:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Socket event handlers
    const handleReceiveMessage = (message) => {
        if (message.chatId === selectedChat?._id) {
            setMessages(prev => [...prev, message]);
        }

        // Update chat list
        setChats(prev => prev.map(chat =>
            chat._id === message.chatId
                ? { ...chat, lastMessage: message.text, lastMessageAt: message.timestamp }
                : chat
        ));
    };

    const handleUserTyping = ({ chatId, userId }) => {
        if (chatId === selectedChat?._id && userId !== currentUser.uid) {
            setTypingUsers(prev => [...new Set([...prev, userId])]);
        }
    };

    const handleUserStoppedTyping = ({ chatId, userId }) => {
        if (chatId === selectedChat?._id) {
            setTypingUsers(prev => prev.filter(id => id !== userId));
        }
    };

    const handleMessageRead = ({ chatId, readerId }) => {
        if (chatId === selectedChat?._id) {
            setMessages(prev => prev.map(msg =>
                msg.senderId === currentUser.uid ? { ...msg, read: true } : msg
            ));
        }
    };

    const handleReactionUpdate = ({ messageId, reactions }) => {
        setMessages(prev => prev.map(msg =>
            msg._id === messageId ? { ...msg, reactions } : msg
        ));
    };

    const handleMessageDeleted = (messageId) => {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
    };

    const handleMessageUpdated = (updatedMessage) => {
        setMessages(prev => prev.map(msg =>
            msg._id === updatedMessage._id ? updatedMessage : msg
        ));
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (diffInDays === 1) {
            return 'Yesterday';
        } else if (diffInDays < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const isUserOnline = (userId) => {
        return onlineUsers.includes(userId);
    };

    const getOtherParticipant = (chat) => {
        if (chat.isGroup) return null;
        return chat.participants.find(p => p !== currentUser.uid);
    };

    const filteredChats = chats.filter(chat => {
        if (!searchQuery.trim()) return true;
        const otherUser = getOtherParticipant(chat);
        return (
            chat.groupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            otherUser?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div className="messenger-container">
            {/* Sidebar - Chat List */}
            <div className={`messenger-sidebar ${selectedChat ? 'hidden-mobile' : ''}`}>
                <div className="messenger-sidebar-header">
                    <h2 className="messenger-title">Messages</h2>
                    <div className="messenger-actions">
                        <button className="icon-btn" title="Home" onClick={() => navigate('/')}>
                            <i className="fas fa-home"></i>
                        </button>
                        <button className="icon-btn" title="New Message">
                            <i className="fas fa-edit"></i>
                        </button>
                        <button className="icon-btn" title="Settings">
                            <i className="fas fa-cog"></i>
                        </button>
                    </div>
                </div>

                <div className="messenger-search">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="messenger-chat-list">
                    {filteredChats.map(chat => {
                        const otherUser = getOtherParticipant(chat);
                        const isOnline = otherUser && isUserOnline(otherUser);

                        return (
                            <div
                                key={chat._id}
                                className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                                onClick={() => handleChatSelect(chat)}
                            >
                                <div className="chat-avatar-container">
                                    <div className="chat-avatar">
                                        {chat.isGroup ? (
                                            <i className="fas fa-users"></i>
                                        ) : (
                                            <i className="fas fa-user"></i>
                                        )}
                                    </div>
                                    {isOnline && <span className="online-indicator"></span>}
                                </div>

                                <div className="chat-info">
                                    <div className="chat-top">
                                        <h4 className="chat-name">
                                            {chat.isGroup ? chat.groupName : `User ${otherUser}`}
                                        </h4>
                                        <span className="chat-time">
                                            {formatTime(chat.lastMessageAt)}
                                        </span>
                                    </div>
                                    <div className="chat-bottom">
                                        <p className="chat-last-message">
                                            {chat.lastMessage || 'No messages yet'}
                                        </p>
                                        {chat.unreadCounts && chat.unreadCounts[currentUser.uid] > 0 && (
                                            <span className="unread-badge">
                                                {chat.unreadCounts[currentUser.uid]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Chat Area */}
            {selectedChat ? (
                <div className="messenger-main">
                    {/* Chat Header */}
                    <div className="messenger-chat-header">
                        <button
                            className="back-btn mobile-only"
                            onClick={() => setSelectedChat(null)}
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>

                        <div className="chat-header-info">
                            <div className="chat-avatar">
                                {selectedChat.isGroup ? (
                                    <i className="fas fa-users"></i>
                                ) : (
                                    <i className="fas fa-user"></i>
                                )}
                            </div>
                            <div className="chat-header-text">
                                <h3>{selectedChat.isGroup ? selectedChat.groupName : `User ${getOtherParticipant(selectedChat)}`}</h3>
                                <span className="chat-status">
                                    {typingUsers.length > 0 ? (
                                        <span className="typing-indicator">typing...</span>
                                    ) : isUserOnline(getOtherParticipant(selectedChat)) ? (
                                        'Online'
                                    ) : (
                                        'Offline'
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="chat-header-actions">
                            <button className="icon-btn" title="Call">
                                <i className="fas fa-phone"></i>
                            </button>
                            <button className="icon-btn" title="Video Call">
                                <i className="fas fa-video"></i>
                            </button>
                            <button
                                className="icon-btn"
                                title="Chat Info"
                                onClick={() => setShowChatInfo(!showChatInfo)}
                            >
                                <i className="fas fa-info-circle"></i>
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="messenger-messages">
                        {messages.map((message, index) => {
                            const isOwnMessage = message.senderId === currentUser.uid;
                            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

                            return (
                                <div
                                    key={message._id || index}
                                    className={`message ${isOwnMessage ? 'own' : 'other'} ${selectedMessages.includes(message._id) ? 'selected' : ''}`}
                                >
                                    {!isOwnMessage && showAvatar && (
                                        <div className="message-avatar">
                                            <i className="fas fa-user"></i>
                                        </div>
                                    )}

                                    <div className="message-content">
                                        {message.replyTo && (
                                            <div className="message-reply-preview">
                                                <i className="fas fa-reply"></i>
                                                <span>{message.replyTo.text || 'Media'}</span>
                                            </div>
                                        )}

                                        {message.mediaType === 'image' && (
                                            <div className="message-media">
                                                <img src={message.mediaUrl} alt="Shared" />
                                            </div>
                                        )}

                                        {message.mediaType === 'voice' && (
                                            <div className="message-voice">
                                                <audio controls src={message.mediaUrl}></audio>
                                            </div>
                                        )}

                                        {message.text && (
                                            <div className="message-text">
                                                {message.text}
                                                {message.edited && <span className="edited-badge">edited</span>}
                                            </div>
                                        )}

                                        <div className="message-meta">
                                            <span className="message-time">{formatTime(message.timestamp)}</span>
                                            {isOwnMessage && (
                                                <span className="message-status">
                                                    <i className={`fas fa-check${message.read ? '-double' : ''}`}></i>
                                                </span>
                                            )}
                                        </div>

                                        {message.reactions && message.reactions.length > 0 && (
                                            <div className="message-reactions">
                                                {message.reactions.map((reaction, idx) => (
                                                    <span key={idx} className="reaction">
                                                        {reaction.emoji}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="message-actions">
                                        <button
                                            className="message-action-btn"
                                            onClick={() => handleReaction(message._id, '❤️')}
                                            title="React"
                                        >
                                            <i className="far fa-smile"></i>
                                        </button>
                                        <button
                                            className="message-action-btn"
                                            onClick={() => setReplyingTo(message)}
                                            title="Reply"
                                        >
                                            <i className="fas fa-reply"></i>
                                        </button>
                                        {isOwnMessage && (
                                            <button
                                                className="message-action-btn"
                                                onClick={() => handleDeleteMessage(message._id)}
                                                title="Delete"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="messenger-input-area">
                        {replyingTo && (
                            <div className="reply-preview">
                                <i className="fas fa-reply"></i>
                                <span>Replying to: {replyingTo.text || 'Media'}</span>
                                <button onClick={() => setReplyingTo(null)}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        )}

                        {mediaPreview && (
                            <div className="media-preview">
                                {mediaPreview.type === 'image' && (
                                    <img src={mediaPreview.url} alt="Preview" />
                                )}
                                {mediaPreview.type === 'voice' && (
                                    <div className="voice-preview">
                                        <i className="fas fa-microphone"></i>
                                        <span>Voice message</span>
                                    </div>
                                )}
                                <button onClick={() => setMediaPreview(null)}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        )}

                        <form className="message-input-form" onSubmit={handleSendMessage}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                                style={{ display: 'none' }}
                            />

                            <button
                                type="button"
                                className="input-action-btn"
                                onClick={() => fileInputRef.current?.click()}
                                title="Attach File"
                            >
                                <i className="fas fa-paperclip"></i>
                            </button>

                            <input
                                type="text"
                                className="message-input"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={handleTyping}
                            />

                            <button
                                type="button"
                                className="input-action-btn"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                title="Emoji"
                            >
                                <i className="far fa-smile"></i>
                            </button>

                            <button
                                type="button"
                                className={`input-action-btn ${isRecordingVoice ? 'recording' : ''}`}
                                onClick={handleVoiceRecord}
                                title={isRecordingVoice ? 'Stop Recording' : 'Record Voice'}
                            >
                                <i className="fas fa-microphone"></i>
                            </button>

                            <button type="submit" className="send-btn" disabled={!newMessage.trim() && !mediaPreview}>
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="messenger-empty">
                    <div className="empty-state">
                        <i className="fas fa-comments"></i>
                        <h3>Select a conversation</h3>
                        <p>Choose a chat from the sidebar to start messaging</p>
                    </div>
                </div>
            )}

            {/* Chat Info Sidebar */}
            {showChatInfo && selectedChat && (
                <div className="messenger-info-sidebar">
                    <div className="info-header">
                        <h3>Chat Info</h3>
                        <button onClick={() => setShowChatInfo(false)}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="info-content">
                        <div className="info-section">
                            <div className="info-avatar-large">
                                {selectedChat.isGroup ? (
                                    <i className="fas fa-users"></i>
                                ) : (
                                    <i className="fas fa-user"></i>
                                )}
                            </div>
                            <h4>{selectedChat.isGroup ? selectedChat.groupName : `User ${getOtherParticipant(selectedChat)}`}</h4>
                        </div>

                        <div className="info-section">
                            <h5>Actions</h5>
                            <button className="info-action-btn">
                                <i className="fas fa-bell-slash"></i>
                                <span>Mute Notifications</span>
                            </button>
                            <button className="info-action-btn">
                                <i className="fas fa-search"></i>
                                <span>Search in Conversation</span>
                            </button>
                            <button className="info-action-btn danger">
                                <i className="fas fa-trash"></i>
                                <span>Delete Chat</span>
                            </button>
                        </div>

                        {selectedChat.isGroup && (
                            <div className="info-section">
                                <h5>Participants ({selectedChat.participants?.length})</h5>
                                {selectedChat.participants?.map((userId, idx) => (
                                    <div key={idx} className="participant-item">
                                        <div className="participant-avatar">
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <span>User {userId}</span>
                                        {isUserOnline(userId) && <span className="online-dot"></span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
