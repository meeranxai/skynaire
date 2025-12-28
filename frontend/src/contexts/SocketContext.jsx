import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../api/config';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState({});

    useEffect(() => {
        if (!currentUser) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnectionAttempts: 5
        });

        newSocket.on('connect', () => {
            // console.log('Socket Connected:', newSocket.id);
            // Announce presence
            newSocket.emit('user_online', {
                firebaseUid: currentUser.uid,
                displayName: currentUser.displayName,
                email: currentUser.email,
                photoURL: currentUser.photoURL
            });
            // Join personal room for notifications
            newSocket.emit('join_personal_room', currentUser.uid);
        });

        newSocket.on('user_presence_changed', (data) => {
            setOnlineUsers(prev => ({
                ...prev,
                [data.firebaseUid]: data.isOnline
            }));
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [currentUser]);

    const sendMessage = useCallback((chatId, recipientId, text, mediaUrl = null, mediaType = 'text', replyTo = null) => {
        if (!socket || !currentUser) return;

        socket.emit('send_message', {
            chatId,
            senderId: currentUser.uid,
            recipientId,
            text,
            mediaUrl,
            mediaType,
            replyTo
        });
    }, [socket, currentUser]);

    const sendTyping = useCallback((chatId, isTyping) => {
        if (!socket || !currentUser) return;
        socket.emit('typing', {
            chatId,
            senderId: currentUser.uid,
            isTyping
        });
    }, [socket, currentUser]);

    const markRead = useCallback((chatId) => {
        if (!socket || !currentUser || !chatId) return;
        socket.emit('mark_messages_read', {
            chatId,
            userId: currentUser.uid
        });
        socket.emit('clear_unread_count', {
            chatId,
            userId: currentUser.uid
        });
    }, [socket, currentUser]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, sendMessage, sendTyping, markRead }}>
            {children}
        </SocketContext.Provider>
    );
};
