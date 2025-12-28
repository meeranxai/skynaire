import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { API_BASE_URL, getMediaUrl } from '../../api/config';
import { useAuth } from '../../contexts/AuthContext';

const UserListModal = ({ isOpen, onClose, title, type, targetUid }) => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followStates, setFollowStates] = useState({}); // { userId: status }

    useEffect(() => {
        if (isOpen && targetUid) {
            fetchUsers();
        }
    }, [isOpen, targetUid, type]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${targetUid}/${type}?requesterId=${currentUser?.uid}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);

                // Initialize follow states
                const states = {};
                data.forEach(user => {
                    states[user.firebaseUid] = user.isFollowing ? 'following' : (user.hasRequested ? 'requested' : 'none');
                });
                setFollowStates(states);
            }
        } catch (err) {
            console.error("Error fetching user list", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowClick = async (e, userId) => {
        e.preventDefault();
        e.stopPropagation();

        const currentStatus = followStates[userId];
        const isUnfollowing = currentStatus === 'following' || currentStatus === 'requested';
        const endpoint = isUnfollowing ? '/api/users/unfollow' : '/api/users/follow';

        // Optimistic update
        setFollowStates(prev => ({
            ...prev,
            [userId]: isUnfollowing ? 'none' : 'following'
        }));

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    targetUid: userId
                })
            });
            const data = await response.json();
            if (data.success) {
                setFollowStates(prev => ({
                    ...prev,
                    [userId]: data.status || (isUnfollowing ? 'none' : 'following')
                }));
            } else {
                // Revert on error
                setFollowStates(prev => ({ ...prev, [userId]: currentStatus }));
            }
        } catch (error) {
            setFollowStates(prev => ({ ...prev, [userId]: currentStatus }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay active" onClick={onClose} style={{ zIndex: 1100 }}>
            <div className="card" onClick={e => e.stopPropagation()} style={{
                width: '100%',
                maxWidth: '450px',
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '24px',
                background: 'var(--background-elevated)',
                backdropFilter: 'blur(20px)'
            }}>
                <div className="modal-header" style={{
                    padding: '20px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-body" style={{ overflowY: 'auto', padding: '10px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <i className="fas fa-circle-notch fa-spin" style={{ color: 'var(--primary)', fontSize: '24px' }}></i>
                        </div>
                    ) : users.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-tertiary)' }}>
                            <i className="fas fa-users" style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.2 }}></i>
                            <p style={{ fontSize: '16px', fontWeight: 600 }}>No {title.toLowerCase()} yet.</p>
                        </div>
                    ) : (
                        <div className="user-list">
                            {users.map(user => {
                                const status = followStates[user.firebaseUid];
                                const isSelf = currentUser?.uid === user.firebaseUid;

                                return (
                                    <NavLink
                                        key={user.firebaseUid}
                                        to={`/profile/${user.firebaseUid}`}
                                        onClick={onClose}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px',
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            borderRadius: '16px',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                        className="user-list-item-hover"
                                    >
                                        <div style={{ position: 'relative' }}>
                                            <img
                                                src={getMediaUrl(user.photoURL) || '/images/default-avatar.png'}
                                                alt={user.displayName}
                                                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid transparent', transition: 'border-color 0.2s' }}
                                                className="list-avatar"
                                            />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, fontSize: '15px' }}>{user.displayName}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {user.bio || `@${user.firebaseUid.substring(0, 8)}`}
                                            </div>
                                        </div>

                                        {!isSelf && (
                                            <button
                                                onClick={(e) => handleFollowClick(e, user.firebaseUid)}
                                                className={`btn-follow-toggle-sm ${status !== 'none' ? 'following' : ''}`}
                                                style={{
                                                    padding: '8px 16px',
                                                    fontSize: '12px',
                                                    borderRadius: '24px',
                                                    border: '1px solid ' + (status === 'none' ? 'var(--primary)' : 'var(--border-color)'),
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    background: status === 'none' ? 'var(--primary)' : 'transparent',
                                                    color: status === 'none' ? 'white' : 'var(--text-primary)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {status === 'following' ? 'Following' : status === 'requested' ? 'Requested' : 'Follow'}
                                            </button>
                                        )}
                                    </NavLink>
                                );
                            })}
                            <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: 'var(--text-tertiary)', opacity: 0.6 }}>
                                End of list
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .user-list-item-hover:hover {
                    background: var(--surface-100);
                    transform: translateX(4px);
                }
                .user-list-item-hover:hover .list-avatar {
                    border-color: var(--primary);
                }
                .modal-overlay {
                    backdrop-filter: blur(10px) brightness(0.8);
                }
            `}</style>
        </div>
    );
};

export default UserListModal;
