import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { getMediaUrl } from '../../api/config';

const SocialOverlay = ({ reelId, currentUser, isActive }) => {
    const socket = useSocket();
    const [viewers, setViewers] = useState([]); // List of active viewer avatars
    const [reactions, setReactions] = useState([]); // Floating reaction objects

    // Join/Leave Logic
    useEffect(() => {
        if (!socket || !isActive || !currentUser || !reelId) return;

        const userPayload = {
            userId: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL
        };

        socket.emit('join_reel', { reelId, user: userPayload });

        // Listen for others
        socket.on('reel_viewer_joined', (user) => {
            setViewers(prev => {
                if (prev.find(v => v.userId === user.userId)) return prev;
                return [...prev, user].slice(-5); // Keep last 5
            });
        });

        socket.on('reel_viewer_left', ({ userId }) => {
            setViewers(prev => prev.filter(v => v.userId !== userId));
        });

        socket.on('reel_reaction', ({ reaction, user }) => {
            addFloatingReaction(reaction.type, user);
        });

        return () => {
            socket.emit('leave_reel', { reelId, userId: currentUser.uid });
            socket.off('reel_viewer_joined');
            socket.off('reel_viewer_left');
            socket.off('reel_reaction');
        };
    }, [socket, isActive, reelId, currentUser]);

    // Cleanup reactions periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setReactions(prev => prev.filter(r => Date.now() - r.id < 2000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const addFloatingReaction = (type, user) => {
        const id = Date.now() + Math.random();
        setReactions(prev => [...prev, { id, type, user, left: Math.random() * 80 + 10 }]);
    };

    if (!isActive) return null;

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 15, overflow: 'hidden' }}>
            {/* Live Viewers Top Left */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', marginLeft: '10px' }}>
                    {viewers.map((v, i) => (
                        <img
                            key={v.userId}
                            src={getMediaUrl(v.photoURL) || '/default-avatar.png'}
                            style={{
                                width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #fff',
                                marginLeft: i === 0 ? 0 : '-8px', zIndex: 5 - i
                            }}
                            alt={v.displayName}
                        />
                    ))}
                    {viewers.length > 0 && (
                        <div style={{
                            marginLeft: '8px', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '12px',
                            color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center'
                        }}>
                            is watching
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Reactions Zone */}
            {reactions.map(r => (
                <div key={r.id} style={{
                    position: 'absolute',
                    bottom: '100px',
                    left: `${r.left}%`,
                    fontSize: '30px',
                    animation: 'floatUp 2s ease-out forwards',
                    opacity: 0
                }}>
                    {r.type === 'heart' ? '❤️' : r.type === 'laugh' ? '😂' : '🔥'}
                    {/* Small avatar check */}
                    {r.user && (
                        <img
                            src={getMediaUrl(r.user.photoURL)}
                            style={{ width: '15px', height: '15px', borderRadius: '50%', position: 'absolute', bottom: -5, right: -5 }}
                        />
                    )}
                </div>
            ))}

            <style>{`
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(0.5); opacity: 1; }
                    100% { transform: translateY(-200px) scale(1.5); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default SocialOverlay;
