import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getMediaUrl } from '../../api/config';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ users: [], posts: [] });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

    // Search function
    const performSearch = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults({ users: [], posts: [] });
            return;
        }

        setLoading(true);
        try {
            const [usersRes, postsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(searchQuery)}`),
                fetch(`${API_BASE_URL}/api/posts/search?q=${encodeURIComponent(searchQuery)}`)
            ]);

            const users = usersRes.ok ? await usersRes.json() : [];
            const posts = postsRes.ok ? await postsRes.json() : [];

            setResults({
                users: Array.isArray(users) ? users : users.users || [],
                posts: Array.isArray(posts) ? posts : posts.posts || []
            });
        } catch (error) {
            console.error('Search failed:', error);
            setResults({ users: [], posts: [] });
        } finally {
            setLoading(false);
        }
    };

    // Debounce the search with useEffect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            performSearch(query);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`);
        onClose();
    };

    const handlePostClick = (postId) => {
        navigate(`/?post=${postId}`);
        onClose();
    };

    if (!isOpen) return null;

    const filteredUsers = activeTab === 'all' || activeTab === 'users' ? results.users : [];
    const filteredPosts = activeTab === 'all' || activeTab === 'posts' ? results.posts : [];

    return (
        <div className="global-search-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            {/* Search Header */}
            <div style={{
                padding: '20px',
                background: 'var(--background-elevated)',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
            }}>
                <button onClick={onClose} style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '8px'
                }}>
                    <i className="fas fa-arrow-left"></i>
                </button>

                <div style={{
                    flex: 1,
                    position: 'relative'
                }}>
                    <i className="fas fa-search" style={{
                        position: 'absolute',
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-tertiary)'
                    }}></i>
                    <input
                        type="text"
                        placeholder="Search users, posts, hashtags..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '12px 15px 12px 45px',
                            background: 'var(--bg-secondary)',
                            border: '2px solid var(--border-light)',
                            borderRadius: '25px',
                            fontSize: '16px',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && query.trim()) {
                                navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
                                onClose();
                            }
                        }}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '20px',
                padding: '15px 20px',
                background: 'var(--background-elevated)',
                borderBottom: '1px solid var(--border-light)'
            }}>
                {['all', 'users', 'posts'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{

                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                            background: activeTab === tab ? 'var(--primary-light)' : 'transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Results */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                background: 'var(--bg-body)'
            }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px' }}></i>
                        <div style={{ marginTop: '10px' }}>Searching...</div>
                    </div>
                ) : !query.trim() ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
                        <i className="fas fa-search" style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }}></i>
                        <div style={{ fontSize: '18px' }}>Start typing to search</div>
                        <div style={{ fontSize: '14px', marginTop: '5px' }}>Find users, posts, and more</div>
                    </div>
                ) : (
                    <>
                        {/* Users */}
                        {filteredUsers.length > 0 && (
                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: 'var(--text-tertiary)',
                                    marginBottom: '15px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Users ({filteredUsers.length})
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {filteredUsers.slice(0, 5).map(user => (
                                        <div
                                            key={user.uid}
                                            onClick={() => handleUserClick(user.uid)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '12px',
                                                background: 'var(--background-elevated)',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                border: '1px solid var(--border-light)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                                        >
                                            <img
                                                src={getMediaUrl(user.photoURL)}
                                                alt={user.displayName}
                                                style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                                    {user.displayName}
                                                </div>
                                                <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                                                    @{user.username || user.uid}
                                                </div>
                                            </div>
                                            <i className="fas fa-chevron-right" style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}></i>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Posts */}
                        {filteredPosts.length > 0 && (
                            <div>
                                <h3 style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: 'var(--text-tertiary)',
                                    marginBottom: '15px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Posts ({filteredPosts.length})
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {filteredPosts.slice(0, 5).map(post => (
                                        <div
                                            key={post._id}
                                            onClick={() => handlePostClick(post._id)}
                                            style={{
                                                padding: '15px',
                                                background: 'var(--background-elevated)',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                border: '1px solid var(--border-light)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
                                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                                        >
                                            <div style={{
                                                fontWeight: 'bold',
                                                color: 'var(--text-primary)',
                                                marginBottom: '5px'
                                            }}>
                                                {post.title || 'Untitled Post'}
                                            </div>
                                            <div style={{
                                                color: 'var(--text-secondary)',
                                                fontSize: '14px',
                                                marginBottom: '8px',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {post.description}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                                by {post.author} • {new Date(post.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Results */}
                        {filteredUsers.length === 0 && filteredPosts.length === 0 && query.trim() && (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
                                <i className="fas fa-search-minus" style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }}></i>
                                <div style={{ fontSize: '18px' }}>No results found</div>
                                <div style={{ fontSize: '14px', marginTop: '5px' }}>Try different keywords</div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default GlobalSearch;
