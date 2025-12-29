import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '../../api/config';
import { useAuth } from '../../contexts/AuthContext';
import { useGNavigation } from '../../contexts/NavigationContext';
import PostCard from './PostCard';
import SuggestedReels from './SuggestedReels';
import ContentLoader from '../common/ContentLoader';

const FeedStream = ({ feedType = 'home' }) => {
    const { currentUser } = useAuth();
    const { setFeedContext } = useGNavigation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // For Infinite Scroll
    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    const fetchPosts = async (pageNum = 1, shouldAppend = false) => {
        try {
            if (pageNum === 1 && !shouldAppend) setLoading(true);
            else setLoadingMore(true);

            const url = new URL(`${API_BASE_URL}/api/posts`);
            url.searchParams.append('page', pageNum);
            url.searchParams.append('limit', 10);
            url.searchParams.append('feedContext', feedType);
            if (currentUser) {
                url.searchParams.append('currentUserId', currentUser.uid);
            }

            const res = await fetch(url);
            const data = await res.json();

            // Handle different response formats from backend
            let postsArray = [];
            let hasMorePosts = false;

            if (Array.isArray(data)) {
                // Backend returns array directly
                postsArray = data;
                hasMorePosts = data.length >= 10;
            } else if (data && data.posts) {
                // Backend returns object with posts property
                postsArray = Array.isArray(data.posts) ? data.posts : [];
                hasMorePosts = data.hasMore || data.posts.length >= 10;
            } else {
                // Fallback for unexpected format
                console.warn('Unexpected posts response format:', data);
                postsArray = [];
                hasMorePosts = false;
            }

            setPosts(prev => {
                return shouldAppend ? [...prev, ...postsArray] : postsArray;
            });

            setHasMore(hasMorePosts);
        } catch (err) {
            console.error("Failed to fetch posts", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (posts.length > 0) {
            setFeedContext(posts, feedType);
        }
    }, [posts, feedType, setFeedContext]);

    useEffect(() => {
        setPage(1);
        fetchPosts(1, false);
    }, [currentUser, feedType]);

    useEffect(() => {
        if (page > 1) {
            fetchPosts(page, true);
        }
    }, [page]);

    if (loading && posts.length === 0) {
        return (
            <div className="card" style={{ padding: '60px', textAlign: 'center', background: 'var(--background-elevated)', borderRadius: 'var(--radius-xl)' }}>
                <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '15px' }}></i>
                <p style={{ color: 'var(--text-tertiary)', fontWeight: 'var(--font-semibold)' }}>Discovering new updates...</p>
            </div>
        );
    }

    return (
        <div id="social-feed-stream" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {posts.map((post, index) => {
                const showReels = index === 4;

                const postElement = (
                    <div ref={posts.length === index + 1 ? lastPostElementRef : null} key={post._id}>
                        <PostCard
                            post={post}
                            feedType={feedType}
                            onUpdate={(updatedPost) => {
                                setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
                            }}
                        />
                    </div>
                );

                return (
                    <React.Fragment key={post._id}>
                        {postElement}
                        {showReels && <SuggestedReels />}
                    </React.Fragment>
                );
            })}

            {posts.length === 0 && !loading && (
                <div className="card" style={{ textAlign: 'center', padding: '80px 40px', background: 'var(--background-elevated)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border-light)' }}>
                    <div style={{ fontSize: '50px', marginBottom: '20px', opacity: 0.2 }}>
                        <i className="fas fa-stream"></i>
                    </div>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>Your feed is empty</h3>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>Follow more creators or explore trending topics to see what's happening!</p>
                </div>
            )}

            {loadingMore && (
                <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                    <i className="fas fa-spinner fa-spin" style={{ color: 'var(--primary)' }}></i>
                </div>
            )}
        </div>
    );
};

export default FeedStream;
