import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useGNavigation } from '../../contexts/NavigationContext';
import { useAuth } from '../../contexts/AuthContext';
import { getMediaUrl, API_BASE_URL } from '../../api/config';
import CommentItem from './CommentItem';
import RichText from '../common/RichText';
import ShareModal from '../common/ShareModal';
import '../../styles/PostViewer.css';

const PostViewer = () => {
    const { currentPost, isViewerOpen, closePostViewer, navigateToNextPost, navigateToPreviousPost } = useGNavigation();
    const { currentUser } = useAuth();
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const [zoom, setZoom] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const scrollRef = useRef(null);

    const fetchComments = useCallback(async () => {
        if (!currentPost) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/${currentPost._id}/comments`);
            const data = await res.json();
            setComments(data);
        } catch (err) { console.error(err); }
    }, [currentPost]);

    useEffect(() => {
        if (isViewerOpen && currentPost) {
            fetchComments();
            setZoom(false); // Reset zoom
            // Lock background scroll
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isViewerOpen, currentPost, fetchComments]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isViewerOpen) return;
            if (e.key === 'Escape') closePostViewer();
            if (e.key === 'ArrowUp') navigateToPreviousPost();
            if (e.key === 'ArrowDown') navigateToNextPost();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isViewerOpen, closePostViewer, navigateToNextPost, navigateToPreviousPost]);

    const touchStart = useRef(0);
    const touchEnd = useRef(0);

    const handleTouchStart = (e) => {
        touchStart.current = e.targetTouches[0].clientY;
    };

    const handleTouchMove = (e) => {
        touchEnd.current = e.targetTouches[0].clientY;
    };

    const handleTouchEnd = () => {
        if (zoom) return; // Disable swipe nav when zoomed
        if (!touchStart.current || !touchEnd.current) return;
        const distance = touchStart.current - touchEnd.current;
        const isSignificant = Math.abs(distance) > 50;

        if (isSignificant) {
            if (distance > 0) {
                // Swiped Up -> Next
                navigateToNextPost();
            } else {
                // Swiped Down -> Previous
                navigateToPreviousPost();
            }
        }
        // Reset
        touchStart.current = 0;
        touchEnd.current = 0;
    };

    const toggleZoom = (e) => {
        e.stopPropagation();
        setZoom(!zoom);
    };

    // Auto-reset zoom on slide change
    useEffect(() => {
        setZoom(false);
    }, [currentPost]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || loading) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/${currentPost._id}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    userName: currentUser.displayName,
                    userAvatar: currentUser.photoURL,
                    text: commentText
                })
            });
            if (res.ok) {
                setCommentText('');
                fetchComments();
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (!isViewerOpen || !currentPost) return null;

    return (
        <div className="post-viewer-overlay" onClick={closePostViewer}>
            <button className="post-viewer-close" onClick={closePostViewer}>
                <i className="fas fa-times"></i>
            </button>

            <button className="nav-btn prev" onClick={(e) => { e.stopPropagation(); navigateToPreviousPost(); }}>
                <i className="fas fa-chevron-up"></i>
            </button>
            <button className="nav-btn next" onClick={(e) => { e.stopPropagation(); navigateToNextPost(); }}>
                <i className="fas fa-chevron-down"></i>
            </button>

            <div className="post-viewer-container" onClick={(e) => e.stopPropagation()}>
                {/* Media Section */}
                <div
                    className={`post-viewer-media-section ${zoom ? 'zoomed' : ''}`}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={toggleZoom}
                    style={{ cursor: zoom ? 'zoom-out' : 'zoom-in' }}
                >
                    <img
                        src={getMediaUrl(currentPost.image)}
                        alt=""
                        className={zoom ? 'zoomed-img' : ''}
                        style={{
                            transform: zoom ? 'scale(2)' : 'scale(1)',
                            transition: 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)',
                            cursor: zoom ? 'zoom-out' : 'zoom-in'
                        }}
                    />
                </div>

                {/* Info Section */}
                <div className="post-viewer-info-section">
                    <div className="post-viewer-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={currentPost.authorAvatar || '/images/default-avatar.png'} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{currentPost.author}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{currentPost.category}</div>
                            </div>
                        </div>
                        <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold' }}>Follow</button>
                    </div>

                    <div className="post-viewer-comments" ref={scrollRef}>
                        <div style={{ marginBottom: '20px', fontSize: '14px' }}>
                            <strong style={{ marginRight: '8px' }}>{currentPost.author}</strong>
                            <RichText text={currentPost.description} style={{ color: 'var(--text-secondary)' }} />
                        </div>

                        {comments.length > 0 ? (
                            comments.map(c => (
                                <CommentItem
                                    key={c._id}
                                    comment={c}
                                    postId={currentPost._id}
                                    postAuthorId={currentPost.authorId}
                                    onReplySuccess={fetchComments}
                                />
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px 0' }}>No comments yet.</div>
                        )}
                    </div>

                    <div className="post-viewer-actions">
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', fontSize: '20px' }}>
                            <i className="far fa-heart"></i>
                            <i className="far fa-comment"></i>
                            <i className="far fa-paper-plane"></i>
                            <i className="far fa-bookmark" style={{ marginLeft: 'auto' }}></i>
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '10px' }}>
                            {currentPost.likes?.length || 0} likes
                        </div>

                        <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '15px', padding: '8px 15px', color: 'var(--text-primary)', outline: 'none' }}
                            />
                            <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold' }} disabled={!commentText.trim() || loading}>
                                Post
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <ShareModal 
                isOpen={showShareModal} 
                onClose={() => setShowShareModal(false)} 
                post={currentPost}
                shareUrl={`${window.location.origin}/post/${currentPost._id}?utm_source=gnetwork&utm_medium=share&shared_by=${currentUser?.uid || 'guest'}`}
            />
        </div>
    );
};

export default PostViewer;
