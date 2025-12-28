import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL, getMediaUrl } from '../api/config';
import PostCard from '../components/feed/PostCard';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGNavigation } from '../contexts/NavigationContext';

const Explore = () => {
    const { currentUser } = useAuth();
    const { setFeedContext } = useGNavigation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('posts'); // top, people, posts, tags

    // Data States
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [hashtags, setHashtags] = useState([]);

    // Loading States
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [searchParams, setSearchParams] = useSearchParams();
    const queryTerm = searchParams.get('q');

    // Recent Searches
    const [recentSearches, setRecentSearches] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    // Infinite Scroll Ref
    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (loading || loadingMore || activeTab === 'people') return; // Only scroll posts for now
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore, activeTab]);

    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) setRecentSearches(JSON.parse(saved));
        fetchTrendingHashtags();
    }, []);

    useEffect(() => {
        if (posts.length > 0) setFeedContext(posts, 'explore');
    }, [posts, setFeedContext]);

    // Handle Query Change
    useEffect(() => {
        if (queryTerm) {
            setSearchTerm(queryTerm);
            handleSearchExecution(queryTerm);
        } else {
            setSearchTerm('');
            fetchPosts('', 1, false);
            setUsers([]);
        }
    }, [queryTerm]);

    // Handle Tab Change or Page Change
    useEffect(() => {
        if (!searchTerm) {
            if (activeTab === 'posts') fetchPosts('', page, page > 1);
            return;
        }

        if (activeTab === 'people') {
            fetchUsers(searchTerm);
        } else if (activeTab === 'posts') {
            fetchPosts(searchTerm, page, page > 1);
        } else if (activeTab === 'top') {
            // Fetch both
            setPage(1);
            fetchUsers(searchTerm);
            fetchPosts(searchTerm, 1, false);
        }
    }, [activeTab, page]);

    const addToHistory = (term) => {
        if (!term.trim()) return;
        let history = [...recentSearches];
        history = history.filter(h => h !== term);
        history.unshift(term);
        history = history.slice(0, 5);
        setRecentSearches(history);
        localStorage.setItem('recentSearches', JSON.stringify(history));
    };

    const handleSearchExecution = (term) => {
        if (!term) return;
        addToHistory(term);
        setShowHistory(false);
        setPage(1);

        if (activeTab === 'people') fetchUsers(term);
        else if (activeTab === 'posts') fetchPosts(term, 1, false);
        else {
            fetchUsers(term);
            fetchPosts(term, 1, false);
        }
    };

    const fetchTrendingHashtags = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/trending-hashtags`);
            if (res.ok) {
                const data = await res.json();
                setHashtags(data);
            }
        } catch (err) { console.error(err); }
    };

    const fetchUsers = async (term) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/search/all?q=${encodeURIComponent(term)}`);
            const data = await res.json();
            setUsers(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchPosts = async (term, pageNum = 1, append = false) => {
        if (pageNum === 1 && !append) setLoading(true);
        else setLoadingMore(true);

        try {
            let url = new URL(`${API_BASE_URL}/api/posts`);
            if (term && term.trim()) url.searchParams.append('q', term);
            url.searchParams.append('page', pageNum);
            url.searchParams.append('limit', 12);
            url.searchParams.append('feedContext', 'explore');
            if (currentUser) url.searchParams.append('currentUserId', currentUser.uid);

            const res = await fetch(url.toString());
            if (res.ok) {
                const data = await res.json();
                let newPosts = Array.isArray(data) ? data : (data.posts || []);

                setPosts(prev => {
                    return append ? [...prev, ...newPosts] : newPosts;
                });
                setHasMore(data.hasMore || (Array.isArray(data) && data.length === 12));
            }
        } catch (err) { console.error(err); }
        finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchParams({ q: searchTerm }); // Triggers useEffect
    };

    const clearHistory = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    return (
        <main className="feed-container">
            {/* Search Header */}
            <div className="card glass-panel" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', background: 'var(--surface-glass)', backdropFilter: 'blur(10px)', border: '1px solid var(--border-light)' }}>
                <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', zIndex: 10 }}></i>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Explore trending Vibes, Creators..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setShowHistory(true)}
                        onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                        style={{ width: '100%', borderRadius: '50px', background: 'var(--bg-secondary)', border: 'none', padding: '16px 20px 16px 50px', fontSize: '16px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}
                    />

                    {/* Search History Dropdown */}
                    {showHistory && recentSearches.length > 0 && (
                        <div className="search-history-dropdown" style={{
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            background: 'var(--surface-card)', borderRadius: '16px',
                            marginTop: '8px', padding: '10px 0', border: '1px solid var(--border-light)',
                            boxShadow: 'var(--shadow-lg)', zIndex: 100
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 20px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                <span>Recent</span>
                                <span onClick={clearHistory} style={{ cursor: 'pointer' }}>Clear All</span>
                            </div>
                            {recentSearches.map((term, i) => (
                                <div key={i} onClick={() => { setSearchTerm(term); setSearchParams({ q: term }); }}
                                    style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
                                    className="hover-bg-light"
                                >
                                    <i className="fas fa-history" style={{ color: 'var(--text-light)' }}></i>
                                    <span>{term}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </form>

                {/* Tabs */}
                {searchTerm && (
                    <div className="tabs-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px', borderBottom: '1px solid var(--border-light)' }}>
                        {['top', 'posts', 'people'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '10px 20px', background: 'none', border: 'none',
                                    borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                                    fontWeight: activeTab === tab ? 'bold' : 'normal',
                                    color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                                    cursor: 'pointer', textTransform: 'capitalize'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                )}

                {!searchTerm && hashtags.length > 0 && (
                    <div style={{ marginTop: 'var(--space-6)', overflowX: 'auto', paddingBottom: '10px' }} className="no-scrollbar">
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', minWidth: 'min-content' }}>
                            {hashtags.map(item => (
                                <button
                                    key={item.tag}
                                    onClick={() => { setSearchTerm(`#${item.tag}`); setSearchParams({ q: `#${item.tag}` }); }}
                                    style={{ background: 'var(--surface-50)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', padding: '8px 20px', borderRadius: '50px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)' }}
                                    className="hover:scale-105"
                                >
                                    #{item.tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            {loading && page === 1 && (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <i className="fas fa-circle-notch fa-spin fa-2x" style={{ color: 'var(--primary)' }}></i>
                </div>
            )}

            {!loading && (
                <>
                    {/* People Results */}
                    {(activeTab === 'people' || activeTab === 'top') && users.length > 0 && (
                        <div className="users-results" style={{ marginBottom: '30px' }}>
                            <h3 style={{ marginLeft: '10px', marginBottom: '15px' }}>People</h3>
                            <div className="card" style={{ padding: '0' }}>
                                {users.map(user => (
                                    <div key={user.firebaseUid} onClick={() => navigate(`/profile/${user.firebaseUid}`)} style={{
                                        display: 'flex', alignItems: 'center', padding: '15px', gap: '15px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer'
                                    }}>
                                        <img src={getMediaUrl(user.photoURL)} alt="" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: 0 }}>{user.displayName} {user.verification?.isVerified && <i className="fas fa-check-circle" style={{ color: 'var(--primary)' }}></i>}</h4>
                                            <small style={{ color: 'var(--text-tertiary)' }}>@{user.username}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Post Results */}
                    {(activeTab === 'posts' || activeTab === 'top') && posts.length > 0 && (
                        <div className="explore-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {posts.map((post, idx) => {
                                const isLast = activeTab !== 'people' && posts.length === idx + 1; // Only infinite scroll on posts
                                return (
                                    <div ref={isLast ? lastPostElementRef : null} key={post._id}>
                                        <PostCard post={post} feedType="explore" />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {users.length === 0 && posts.length === 0 && searchTerm && !loading && (
                        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                            <i className="fas fa-ghost" style={{ fontSize: '3rem', color: 'var(--text-tertiary)', marginBottom: '15px' }}></i>
                            <h3>No cosmic signals found</h3>
                            <p>Try matching different energy (search terms)</p>
                        </div>
                    )}
                </>
            )}
        </main>
    );
};

export default Explore;
