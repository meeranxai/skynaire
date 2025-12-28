import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { API_BASE_URL } from '../api/config';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const { socket } = useSocket();

    // Message Unread Logic
    const [chatUnreadMap, setChatUnreadMap] = useState({});
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);

    // General Notification Unread Logic
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

    // Initial Fetch
    useEffect(() => {
        if (!currentUser) {
            setChatUnreadMap({});
            setUnreadMessageCount(0);
            setUnreadNotificationCount(0);
            return;
        }

        const fetchCounts = async () => {
            try {
                // 1. Fetch Chat Unread Map
                // expect [{ chatId: "...", unreadCount: 5 }, ...]
                const chatRes = await fetch(`${API_BASE_URL}/api/chat/unread-counts/${currentUser.uid}`);
                if (chatRes.ok) {
                    const chats = await chatRes.json();
                    const map = {};
                    let total = 0;
                    chats.forEach(c => {
                        map[c.chatId] = c.count;
                        total += c.count;
                    });
                    setChatUnreadMap(map);
                    setUnreadMessageCount(total);
                }

                // 2. Fetch General Notification Count
                // expect { count: 3 }
                const notifRes = await fetch(`${API_BASE_URL}/api/notifications/unread-count/${currentUser.uid}`);
                if (notifRes.ok) {
                    const data = await notifRes.json();
                    setUnreadNotificationCount(data.count);
                }

            } catch (err) {
                console.error("Error fetching unread counts:", err);
            }
        };

        fetchCounts();
    }, [currentUser]);

    // Socket Listeners
    useEffect(() => {
        if (!socket || !currentUser) return;

        // 1. Chat Updates
        const handleChatUpdate = (data) => {
            // data: { chatId, unreadCount, ... }
            setChatUnreadMap(prev => {
                const newMap = { ...prev, [data.chatId]: data.unreadCount };
                const total = Object.values(newMap).reduce((a, b) => a + b, 0);
                setUnreadMessageCount(total);
                return newMap;
            });
        };

        const handleUnreadCleared = (data) => {
            // data: { chatId, count: 0 }
            setChatUnreadMap(prev => {
                const newMap = { ...prev, [data.chatId]: 0 };
                const total = Object.values(newMap).reduce((a, b) => a + b, 0);
                setUnreadMessageCount(total);
                return newMap;
            });
        };

        const handleMessagesRead = (data) => {
            // If WE read messages, unread count should clear. 
            // Usually 'unread_count_updated' or 'chat_list_update' covers this.
        };

        // 2. General Notifications (Likes, Follows, etc)
        const handleNotification = (notif) => {
            if (notif.type === 'message') return; // Messages handled by chat logic

            setUnreadNotificationCount(prev => prev + 1);
        };

        socket.on('chat_list_update', handleChatUpdate);
        socket.on('unread_count_updated', handleUnreadCleared);
        socket.on('notification', handleNotification);

        return () => {
            socket.off('chat_list_update', handleChatUpdate);
            socket.off('unread_count_updated', handleUnreadCleared);
            socket.off('notification', handleNotification);
        };
    }, [socket, currentUser]);

    // Cleanup or manual refresh
    const refreshNotifications = async () => {
        // Re-fetch logic if needed
        if (!currentUser) return;
        try {
            const notifRes = await fetch(`${API_BASE_URL}/api/notifications/unread-count/${currentUser.uid}`);
            if (notifRes.ok) {
                const data = await notifRes.json();
                setUnreadNotificationCount(data.count);
            }
        } catch (e) { console.error(e) }
    };

    return (
        <NotificationContext.Provider value={{ unreadMessageCount, unreadNotificationCount, refreshNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};
