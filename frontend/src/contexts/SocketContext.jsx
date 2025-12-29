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
    const connectionAttempts = useRef(0);

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
        connectionAttempts.current = 0;
    }, [socket]);

    useEffect(() => {
        if (!currentUser) {
            cleanup();
            return;
        }

        console.log('🔌 Connecting socket for user:', currentUser.email);
        setConnectionStatus('connecting');

        // Enhanced socket configuration for better connection stability
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'], // Allow fallback to polling
            upgrade: true, // Allow transport upgrades
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            maxReconnectionAttempts: 5,
            timeout: 20000, // Increased timeout
            forceNew: false, // Allow connection reuse for better performance
            autoConnect: true,
            // Additional options for better connection handling
            rememberUpgrade: false,
            rejectUnauthorized: false
        });

        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('✅ Socket Connected:', newSocket.id);
            setIsConnected(true);
            setConnectionStatus('connected');
            connectionAttempts.current = 0;
            
            // Start heartbeat after successful connection
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }
            heartbeatIntervalRef.current = setInterval(() => {
                if (newSocket.connected) {
                    newSocket.emit('ping');
                }
            }, 30000);
            
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

        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket Connection Error:', error);
            setConnectionStatus('error');
            connectionAttempts.current++;
            
            // If too many failed attempts, try different approach
            if (connectionAttempts.current > 3) {
                console.log('🔄 Too many connection failures, trying polling transport');
                newSocket.io.opts.transports = ['polling'];
            }
        });

        newSocket.on('disconnect', (reason) => {
            console.log('🔌 Socket Disconnected:', reason);
            setIsConnected(false);
            setConnectionStatus('disconnected');
            
            // Clear heartbeat
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }

            // Handle different disconnect reasons
            if (reason === 'io server disconnect') {
                // Server initiated disconnect, reconnect manually
                console.log('🔄 Server disconnected, attempting manual reconnection');
                setTimeout(() => {
                    if (!newSocket.connected) {
                        newSocket.connect();
                    }
                }, 2000);
            }
        });

        newSocket.on('reconnect', (attemptNumber) => {
            console.log('🔄 Socket Reconnected after', attemptNumber, 'attempts');
            setIsConnected(true);
            setConnectionStatus('connected');
            connectionAttempts.current = 0;
        });

        newSocket.on('reconnect_attempt', (attemptNumber) => {
            console.log('🔄 Socket Reconnection attempt:', attemptNumber);
            setConnectionStatus('reconnecting');
        });

        newSocket.on('reconnect_failed', () => {
            console.log('❌ Socket Reconnection failed');
            setConnectionStatus('failed');
            
            // Try one more time with polling transport
            console.log('🔄 Attempting connection with polling transport');
            newSocket.io.opts.transports = ['polling'];
            setTimeout(() => {
                newSocket.connect();
            }, 5000);
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

        // Pong response for heartbeat
        newSocket.on('pong', () => {
            // Connection is alive - no action needed
        });

        setSocket(newSocket);

        // Cleanup timeout - increased to 10 minutes
        cleanupRef.current = setTimeout(() => {
            console.log('🧹 Socket cleanup timeout triggered');
            cleanup();
        }, 600000); // 10 minutes

        return cleanup;
    }, [currentUser, cleanup]);

    // Update user activity status via socket with throttling
    const lastActivityUpdate = useRef(0);
    useEffect(() => {
        if (socket && currentUser && userActivity && isConnected) {
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
    }, [socket, currentUser, userActivity?.isActive, userActivity?.lastActivity, isConnected]);

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
