import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../api/config';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        console.error('❌ useSocket called outside SocketProvider');
        // Return safe defaults instead of throwing
        return { 
            socket: null, 
            onlineUsers: {},
            isConnected: false,
            connectionStatus: 'disconnected'
        };
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const { currentUser, userActivity } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    
    // Memory leak prevention
    const cleanupRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const heartbeatIntervalRef = useRef(null);

    // Cleanup function to prevent memory leaks
    const cleanup = useCallback(() => {
        if (cleanupRef.current) {
            clearTimeout(cleanupRef.current);
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
        }
        
        if (socket) {
            socket.removeAllListeners();
            socket.disconnect();
        }
        
        setSocket(null);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        setOnlineUsers({});
    }, [socket]);

    useEffect(() => {
        if (!currentUser) {
            cleanup();
            return;
        }

        console.log('🔌 Connecting socket for user:', currentUser.email);
        setConnectionStatus('connecting');

        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnectionAttempts: 3, // Reduced from 5
            reconnectionDelay: 2000, // Increased delay
            timeout: 8000, // Reduced timeout
            forceNew: true // Prevent connection reuse
        });

        // Heartbeat to prevent connection hanging
        const startHeartbeat = () => {
            heartbeatIntervalRef.current = setInterval(() => {
                if (newSocket.connected) {
                    newSocket.emit('ping');
                }
            }, 30000); // Every 30 seconds
        };

        newSocket.on('connect', () => {
            console.log('✅ Socket Connected:', newSocket.id);
            setIsConnected(true);
            setConnectionStatus('connected');
            startHeartbeat();
            
            // Announce presence with full user data
            newSocket.emit('user_online', {
                firebaseUid: currentUser.uid,
                displayName: currentUser.displayName,
                email: currentUser.email,
                photoURL: currentUser.photoURL,
                isActive: userActivity?.isActive || true,
                lastActivity: userActivity?.lastActivity || new Date(),
                sessionStart: userActivity?.sessionStart || new Date()
            });
            
            // Join personal room for notifications
            newSocket.emit('join_personal_room', currentUser.uid);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('🔌 Socket Disconnected:', reason);
            setIsConnected(false);
            setConnectionStatus('disconnected');
            
            // Clear heartbeat
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }
        });

        newSocket.on('reconnect', (attemptNumber) => {
            console.log('🔄 Socket Reconnected after', attemptNumber, 'attempts');
            setIsConnected(true);
            setConnectionStatus('connected');
            startHeartbeat();
        });

        newSocket.on('reconnect_attempt', (attemptNumber) => {
            console.log('🔄 Socket Reconnection attempt:', attemptNumber);
            setConnectionStatus('reconnecting');
        });

        newSocket.on('reconnect_failed', () => {
            console.log('❌ Socket Reconnection failed');
            setConnectionStatus('failed');
            cleanup(); // Clean up on failure
        });

        // Handle user presence updates with memory optimization
        newSocket.on('user_presence_changed', (data) => {
            setOnlineUsers(prev => {
                // Limit online users to prevent memory bloat
                let updatedUsers = { ...prev };
                if (Object.keys(updatedUsers).length > 100) {
                    // Keep only last 50 users
                    const entries = Object.entries(updatedUsers);
                    const limited = Object.fromEntries(entries.slice(-50));
                    updatedUsers = limited;
                }
                
                updatedUsers[data.firebaseUid] = {
                    isOnline: data.isOnline,
                    isActive: data.isActive,
                    lastSeen: data.lastSeen,
                    displayName: data.displayName,
                    photoURL: data.photoURL
                };
                return updatedUsers;
            });
        });

        // Handle online users list with memory limits
        newSocket.on('online_users_list', (users) => {
            console.log('📋 Online users list received:', users.length, 'users');
            const usersMap = {};
            // Limit to first 50 users to prevent memory issues
            const limitedUsers = users.slice(0, 50);
            limitedUsers.forEach(user => {
                usersMap[user.firebaseUid] = {
                    isOnline: user.isOnline,
                    isActive: user.isActive,
                    lastSeen: user.lastSeen,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                };
            });
            setOnlineUsers(usersMap);
        });

        // Handle connection errors
        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket Connection Error:', error);
            setConnectionStatus('error');
        });

        // Pong response for heartbeat
        newSocket.on('pong', () => {
            // Connection is alive
        });

        setSocket(newSocket);

        // Cleanup timeout
        cleanupRef.current = setTimeout(() => {
            console.log('🧹 Socket cleanup timeout triggered');
            cleanup();
        }, 300000); // 5 minutes max connection

        return cleanup;
    }, [currentUser, cleanup]);

    // Update user activity status via socket with throttling
    const lastActivityUpdate = useRef(0);
    useEffect(() => {
        if (socket && currentUser && userActivity) {
            const now = Date.now();
            // Throttle activity updates to every 5 seconds
            if (now - lastActivityUpdate.current > 5000) {
                socket.emit('user_activity_update', {
                    firebaseUid: currentUser.uid,
                    isActive: userActivity.isActive,
                    lastActivity: userActivity.lastActivity
                });
                lastActivityUpdate.current = now;
            }
        }
    }, [socket, currentUser, userActivity?.isActive, userActivity?.lastActivity]);

    const sendMessage = useCallback((chatId, recipientId, text, mediaUrl = null, mediaType = 'text', replyTo = null) => {
        if (!socket || !currentUser || !isConnected) {
            console.warn('⚠️ Cannot send message: socket not connected');
            return false;
        }

        socket.emit('send_message', {
            chatId,
            senderId: currentUser.uid,
            recipientId,
            text,
            mediaUrl,
            mediaType,
            replyTo,
            timestamp: new Date()
        });
        return true;
    }, [socket, currentUser, isConnected]);

    const sendTyping = useCallback((chatId, isTyping) => {
        if (!socket || !currentUser || !isConnected) return false;
        
        socket.emit('typing', {
            chatId,
            senderId: currentUser.uid,
            isTyping,
            timestamp: new Date()
        });
        return true;
    }, [socket, currentUser, isConnected]);

    const markRead = useCallback((chatId) => {
        if (!socket || !currentUser || !chatId || !isConnected) return false;
        
        socket.emit('mark_messages_read', {
            chatId,
            userId: currentUser.uid,
            timestamp: new Date()
        });
        
        socket.emit('clear_unread_count', {
            chatId,
            userId: currentUser.uid
        });
        return true;
    }, [socket, currentUser, isConnected]);

    const updatePresence = useCallback((status) => {
        if (!socket || !currentUser || !isConnected) return false;
        
        socket.emit('update_presence', {
            firebaseUid: currentUser.uid,
            status, // 'online', 'away', 'busy', 'offline'
            timestamp: new Date()
        });
        return true;
    }, [socket, currentUser, isConnected]);

    const value = {
        socket,
        onlineUsers,
        isConnected,
        connectionStatus,
        sendMessage,
        sendTyping,
        markRead,
        updatePresence
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
