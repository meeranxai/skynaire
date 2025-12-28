import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { API_BASE_URL, getMediaUrl } from '../../../api/config';

const StoryViewer = ({ group, onClose, onStoryViewed }) => {
    const { currentUser } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [reply, setReply] = useState('');
    const story = group.stories[currentIndex];
    const progressTimer = useRef(null);
    const STORY_DURATION = 5000;

    const markAsViewed = async (storyId) => {
        if (!currentUser) return;
        try {
            await fetch(`${API_BASE_URL}/api/stories/${storyId}/view`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid })
            });
            if (onStoryViewed) onStoryViewed();
        } catch (err) {
            console.error('Error marking story as viewed:', err);
        }
    };

    useEffect(() => {
        if (progress >= 100) handleNext();
    }, [progress]);

    useEffect(() => {
        setProgress(0);
        if (progressTimer.current) clearInterval(progressTimer.current);
        markAsViewed(story._id);

        const startTime = Date.now();
        progressTimer.current = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const newProgress = (elapsedTime / STORY_DURATION) * 100;
            if (newProgress >= 100) {
                setProgress(100);
                clearInterval(progressTimer.current);
            } else {
                setProgress(newProgress);
            }
        }, 50);

        return () => clearInterval(progressTimer.current);
    }, [currentIndex]);

    const handleNext = () => {
        if (currentIndex < group.stories.length - 1) setCurrentIndex(currentIndex + 1);
        else onClose();
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    const handleSendReply = (e) => {
        e.preventDefault();
        // In a real app, this would send a message to group.userId
        alert(`Reply sent to ${group.userDisplayName}: ${reply}`);
        setReply('');
    };

    const handleArchive = async () => {
        if (!currentUser) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/stories/${story._id}/archive`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid })
            });
            if (res.ok) {
                if (onStoryViewed) onStoryViewed();
                handleNext();
            }
        } catch (err) {
            console.error('Error archiving story:', err);
        }
    };

    return (
        <div className="story-viewer-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: '#000', zIndex: 6000, display: 'flex',
            alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(20px)'
        }}>
            {/* Background Layer */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${getMediaUrl(story.mediaUrl)})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'blur(50px) brightness(0.4)', zIndex: -1
            }} />

            <div className="story-viewer-content" style={{
                width: '100%', maxWidth: '420px', height: '100dvh',
                position: 'relative', display: 'flex', flexDirection: 'column',
                overflow: 'hidden', background: '#000'
            }}>
                {/* Progress Indicators */}
                <div style={{ position: 'absolute', top: '12px', left: '8px', right: '8px', display: 'flex', gap: '4px', zIndex: 100 }}>
                    {group.stories.map((s, idx) => (
                        <div key={s._id} style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.25)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{
                                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
                                height: '100%', background: story.isCloseFriends ? '#10b981' : '#fff',
                                transition: idx === currentIndex ? 'none' : 'width 0.2s linear'
                            }} />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div style={{ position: 'absolute', top: '25px', left: '15px', right: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '2px', borderRadius: '50%', background: story.isCloseFriends ? '#10b981' : 'transparent' }}>
                            <img src={getMediaUrl(group.userAvatar)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid #fff' }} />
                        </div>
                        <div>
                            <span style={{ color: '#fff', fontWeight: '800', fontSize: '0.9rem', textShadow: '0 1px 4px rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                {group.userDisplayName}
                                {story.isCloseFriends && <i className="fas fa-star" style={{ color: '#10b981', fontSize: '0.7rem' }}></i>}
                            </span>
                            <span style={{ color: '#ccc', fontSize: '0.75rem' }}>{new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {currentUser?.uid === story.userId && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleArchive(); }}
                                style={{ color: '#fff', background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer' }}
                                title="Archive Story"
                            >
                                <i className="fas fa-archive"></i>
                            </button>
                        )}
                        <button style={{ color: '#fff', background: 'none', border: 'none', fontSize: '1.2rem' }}><i className="fas fa-ellipsis-h"></i></button>
                        <button onClick={onClose} style={{ color: '#fff', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
                    </div>
                </div>

                {/* Main Media Content */}
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {story.mediaType === 'video' ? (
                        <video src={getMediaUrl(story.mediaUrl)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} autoPlay muted playsInline />
                    ) : (
                        <img src={getMediaUrl(story.mediaUrl)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    )}

                    {/* Interactive Layers */}
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                        {story.stickers?.map((st, i) => (
                            st.type === 'poll' && (
                                <div key={i} style={{
                                    position: 'absolute',
                                    left: `${st.position.x}%`,
                                    top: `${st.position.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    background: 'white',
                                    padding: '12px 20px',
                                    borderRadius: '16px',
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                                    pointerEvents: 'auto',
                                    width: '180px',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '800', color: 'black' }}>{st.question}</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {st.options.map(opt => (
                                            <button key={opt} style={{ padding: '8px', background: '#f5f5f5', border: '1px solid #eee', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                    {/* Navigation Areas */}
                    <div onClick={handlePrev} style={{ position: 'absolute', top: 0, left: 0, width: '30%', height: '100%', zIndex: 10 }} />
                    <div onClick={handleNext} style={{ position: 'absolute', top: 0, right: 0, width: '70%', height: '100%', zIndex: 10 }} />
                </div>

                {/* Footer with Reply & Interactions */}
                <div style={{ padding: '15px 15px 30px', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', zIndex: 100 }}>
                    {story.caption && (
                        <p style={{ color: '#fff', fontSize: '0.95rem', textAlign: 'center', marginBottom: '15px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                            {story.caption}
                        </p>
                    )}
                    <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                type="text"
                                placeholder={`Message ${group.userDisplayName}...`}
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                style={{ width: '100%', background: 'none', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '25px', padding: '10px 15px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                                onFocus={() => { if (progressTimer.current) clearInterval(progressTimer.current); }}
                            />
                        </div>
                        <button type="submit" style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem' }}><i className="far fa-paper-plane"></i></button>
                        <button type="button" style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem' }}><i className="far fa-heart"></i></button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StoryViewer;
