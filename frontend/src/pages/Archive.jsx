import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL, getMediaUrl } from '../api/config';
import ProfileGridItem from '../components/profile/ProfileGridItem';

const Archive = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('posts');
    const [archivedPosts, setArchivedPosts] = useState([]);
    const [archivedStories, setArchivedStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchArchivedContent();
        }
    }, [currentUser, activeTab]);

    const fetchArchivedContent = async () => {
        setLoading(true);
        try {
            if (activeTab === 'posts') {
                const res = await fetch(`${API_BASE_URL}/api/posts/archived?userId=${currentUser.uid}`);
                const data = await res.json();
                setArchivedPosts(Array.isArray(data) ? data : []);
            } else {
                const res = await fetch(`${API_BASE_URL}/api/stories/archive/${currentUser.uid}`);
                const data = await res.json();
                setArchivedStories(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Error fetching archive:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnarchive = async (id, type) => {
        try {
            const url = type === 'post'
                ? `${API_BASE_URL}/api/posts/${id}/archive`
                : `${API_BASE_URL}/api/stories/${id}/archive`;

            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid })
            });

            if (res.ok) {
                fetchArchivedContent();
            }
        } catch (err) {
            console.error('Unarchive error:', err);
        }
    };

    return (
        <div className="archive-page" style={{
            maxWidth: '935px',
            margin: '0 auto',
            padding: 'var(--space-8) var(--space-4)',
            minHeight: '100vh'
        }}>
            <header style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: 'var(--space-10)',
                gap: 'var(--space-2)'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--surface-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--space-3)',
                    border: '1px solid var(--border-light)'
                }}>
                    <i className="fas fa-archive" style={{ fontSize: '1.8rem', color: 'var(--text-secondary)' }}></i>
                </div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-primary)' }}>Archive</h1>
                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Only you can see what you've archived.</p>
            </header>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'var(--space-10)',
                borderBottom: '1px solid var(--border-light)',
                marginBottom: 'var(--space-8)'
            }}>
                <button
                    onClick={() => setActiveTab('posts')}
                    style={{
                        padding: '15px 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'posts' ? '2px solid var(--text-primary)' : '2px solid transparent',
                        color: activeTab === 'posts' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <i className="fas fa-th"></i> POSTS
                </button>
                <button
                    onClick={() => setActiveTab('stories')}
                    style={{
                        padding: '15px 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'stories' ? '2px solid var(--text-primary)' : '2px solid transparent',
                        color: activeTab === 'stories' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <i className="fas fa-history"></i> STORIES
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <div className="loading-spinner"></div>
                </div>
            ) : (
                <div className="archive-grid">
                    {activeTab === 'posts' ? (
                        archivedPosts.length > 0 ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: 'var(--space-6)'
                            }}>
                                {archivedPosts.map(post => (
                                    <div key={post._id} className="archive-item-container" style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                        <ProfileGridItem post={post} />
                                        <div className="archive-item-overlay" style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'rgba(0,0,0,0.3)',
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            pointerEvents: 'none'
                                        }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUnarchive(post._id, 'post');
                                                }}
                                                className="btn btn-sm"
                                                style={{
                                                    background: '#fff',
                                                    color: '#000',
                                                    fontWeight: '700',
                                                    pointerEvents: 'auto'
                                                }}
                                            >
                                                Show on Profile
                                            </button>
                                        </div>
                                        <style>{`
                                            .archive-item-container:hover .archive-item-overlay { opacity: 1; }
                                        `}</style>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon="fa-th" title="No Archived Posts" message="When you archive posts, they will appear here." />
                        )
                    ) : (
                        archivedStories.length > 0 ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                gap: 'var(--space-6)'
                            }}>
                                {archivedStories.map(story => (
                                    <div key={story._id} style={{
                                        position: 'relative',
                                        aspectRatio: '9/16',
                                        background: '#111',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: 'var(--shadow-md)',
                                        border: '1px solid var(--border-light)'
                                    }}>
                                        {story.mediaType === 'video' ? (
                                            <video src={getMediaUrl(story.mediaUrl)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <img src={getMediaUrl(story.mediaUrl)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '12px',
                                            background: 'linear-gradient(rgba(0,0,0,0.6), transparent)',
                                            color: '#fff',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ fontSize: '10px', fontWeight: '800' }}>{new Date(story.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                            <button
                                                onClick={() => handleUnarchive(story._id, 'story')}
                                                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                                                title="Unarchive"
                                            >
                                                <i className="fas fa-undo" style={{ fontSize: '0.8rem' }}></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon="fa-history" title="No Archived Stories" message="Stories you've shared will appear here after they disappear from your profile." />
                        )
                    )}
                </div>
            )}
        </div>
    );
};

const EmptyState = ({ icon, title, message }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 20px',
        textAlign: 'center'
    }}>
        <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '2px solid var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-6)'
        }}>
            <i className={`fas ${icon}`} style={{ fontSize: '2rem' }}></i>
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: 'var(--space-2)' }}>{title}</h3>
        <p style={{ color: 'var(--text-tertiary)', maxWidth: '280px' }}>{message}</p>
    </div>
);

export default Archive;
