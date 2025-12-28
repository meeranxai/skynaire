import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL, getMediaUrl } from '../api/config';
import { formatDistanceToNow } from 'date-fns';
import { NavLink } from 'react-router-dom';

const Notifications = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchNotifications();
        }
    }, [currentUser]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/notifications/${currentUser.uid}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error("Error fetching notifications", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        try {
            await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: 'PUT' });
        } catch (err) {
            console.error("Error marking as read", err);
        }
    };

    const markAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            await fetch(`${API_BASE_URL}/api/notifications/read-all/${currentUser.uid}`, { method: 'PUT' });
        } catch (err) {
            console.error("Error marking all read", err);
        }
    };

    const handleRequestAction = async (notif, action) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/follow-request/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    requesterId: notif.sender
                })
            });
            if (res.ok) {
                // Remove the notification after action
                setNotifications(prev => prev.filter(n => n._id !== notif._id));
                // Also mark as read in backend
                handleMarkAsRead(notif._id);
            }
        } catch (err) {
            console.error("Error handling follow request", err);
        }
    };

    if (loading) {
        return (
            <main className="feed-container">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <i className="fas fa-circle-notch fa-spin fa-2x" style={{ color: 'var(--primary)' }}></i>
                </div>
            </main>
        );
    }

    return (
        <main className="feed-container">
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: 'var(--text-xl)', margin: 0 }}>Notifications</h2>
                    <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
                        Mark all as read
                    </button>
                </div>

                <div className="card-body" style={{ padding: 0 }}>
                    {notifications.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <i className="far fa-bell" style={{ fontSize: '3rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <ul className="list-none">
                            {notifications.map(notif => (
                                <li
                                    key={notif._id}
                                    className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                                    style={{
                                        padding: 'var(--space-4)',
                                        borderBottom: '1px solid var(--border-light)',
                                        background: notif.isRead ? 'transparent' : 'var(--primary-50)',
                                        transition: 'background 0.2s',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-4)'
                                    }}
                                    onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                                >
                                    <div className="avatar" style={{ flexShrink: 0 }}>
                                        <img
                                            src={getMediaUrl(notif.senderAvatar) || "https://ui-avatars.com/api/?name=" + (notif.senderName || "User")}
                                            alt=""
                                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
                                            <NavLink to={`/profile/${notif.sender}`} style={{ color: 'inherit', fontWeight: 'bold', textDecoration: 'none', transition: 'color 0.2s' }} className="hover-primary">
                                                {notif.senderName}
                                            </NavLink> {notif.content}
                                        </p>
                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                        </span>

                                        {notif.type === 'follow_request' && (
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    style={{ padding: '6px 15px', fontSize: '12px' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRequestAction(notif, 'accept');
                                                    }}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ padding: '6px 15px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRequestAction(notif, 'reject');
                                                    }}
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {!notif.isRead && (
                                        <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', flexShrink: 0 }}></div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Notifications;
