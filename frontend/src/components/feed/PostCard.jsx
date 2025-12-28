import React, { useState, useRef, useEffect } from 'react';
import { getMediaUrl, API_BASE_URL } from '../../api/config';
import { useAuth } from '../../contexts/AuthContext';
import { NavLink } from 'react-router-dom';
import EditPostModal from './EditPostModal';
import CommentItem from './CommentItem';
import CollectionModal from './CollectionModal';
// PostMenu import removed physically
import ReportModal from '../common/ReportModal';
import ShareModal from '../common/ShareModal';
import { useGNavigation } from '../../contexts/NavigationContext';
import RichText from '../common/RichText';
import '../../styles/PostCard.css';

const PostCard = ({ post, onUpdate, feedType = 'home' }) => {
    const { currentUser } = useAuth();
    const { openPostViewer } = useGNavigation();
    const [isLiked, setIsLiked] = useState(post.likes && currentUser ? post.likes.includes(currentUser.uid) : false);
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
    const [isSaved, setIsSaved] = useState(post.saves && currentUser ? post.saves.includes(currentUser.uid) : false);
    const [loading, setLoading] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [postData, setPostData] = useState(post);
    const [showHeartAnim, setShowHeartAnim] = useState(false);
    const [showPulseAnim, setShowPulseAnim] = useState(false);
    const [showTags, setShowTags] = useState(false);
    const [showAIInsights, setShowAIInsights] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        // Track impression (FR-SHARE-004 logic)
        const trackImpression = async () => {
            try {
                await fetch(`${API_BASE_URL}/api/posts/${post._id}/view`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'impression', userId: currentUser?.uid })
                });
            } catch (err) { /* ignore */ }
        };
        trackImpression();
    }, [post._id, currentUser]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        if (showMenu) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/${post._id}/comments`);
            const data = await res.json();
            setComments(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (showComments) fetchComments();
    }, [showComments]);

    const handlePostUpdate = (updatedPost) => {
        if (!updatedPost) return;
        setPostData(updatedPost);
        setLikesCount(updatedPost.likes?.length || 0);
        setIsLiked(updatedPost.likes && currentUser ? updatedPost.likes.includes(currentUser.uid) : false);
        setIsSaved(updatedPost.saves && currentUser ? updatedPost.saves.includes(currentUser.uid) : false);
        if (onUpdate) onUpdate(updatedPost);
    };

    const handleMediaClick = (e) => {
        if (e.detail === 1) {
            openPostViewer(postData, feedType);
        }
    };

    const handleLike = async () => {
        if (!currentUser || loading) return;

        // Optimistic update (FR-LIKE-001)
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

        // Phase One: Pulse Effect (FR-LIKE-006)
        setShowPulseAnim(true);
        setTimeout(() => setShowPulseAnim(false), 300);

        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/${post._id}/like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    userName: currentUser.displayName,
                    userAvatar: currentUser.photoURL
                })
            });
            if (!res.ok) {
                // Revert on failure
                setIsLiked(!newIsLiked);
                setLikesCount(prev => !newIsLiked ? prev + 1 : prev - 1);
            }
        } catch (err) { console.error(err); }
    };

    const handleDoubleTap = () => {
        if (!isLiked) handleLike();
        setShowHeartAnim(true); // FR-LIKE-006 Heart explosion
        setTimeout(() => setShowHeartAnim(false), 800);

        // Haptic Feedback (FR-LIKE-002)
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const handleSaveToggle = () => {
        if (!currentUser) return;
        if (!isSaved) {
            setShowCollectionModal(true); // Open collection selection on save (FR-SAVE-002)
        } else {
            // Unsave logic
            confirmUnsave();
        }
    };

    const confirmUnsave = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/${post._id}/save`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid })
            });
            if (res.ok) setIsSaved(false);
        } catch (err) { console.error(err); }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser || !commentText.trim() || loading) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/${post._id}/comment`, {
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
            } else {
                const data = await res.json();
                alert(data.message || "Failed to post comment");
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleShare = async () => {
        // FR-SHARE-003 Attribution preservation + FR-SHARE-005 Viral metrics
        const shareUrl = `${window.location.origin}/post/${post._id}?utm_source=gnetwork&utm_medium=share&shared_by=${currentUser?.uid || 'guest'}`;

        try {
            await fetch(`${API_BASE_URL}/api/posts/${post._id}/share`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser?.uid, platform: 'internal' })
            });
        } catch (err) { /* ignore */ }

        if (navigator.share) {
            try {
                await navigator.share({ title: postData.title, text: postData.description, url: shareUrl });
            } catch (err) { console.log('Share failed', err); }
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert("Link copied to clipboard! Attribution preserved.");
        }
    };

    const isTrending = likesCount > 10;

    const [isDeleted, setIsDeleted] = useState(false);

    if (isDeleted) return null;

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/${post._id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setIsDeleted(true);
                if (onUpdate) onUpdate(null);
            } else {
                alert("Failed to delete post");
            }
        } catch (err) {
            console.error("Error deleting post:", err);
            alert("Error deleting post");
        }
    };

    const handleArchive = async () => {
        if (!window.confirm("Archive this post? It will be hidden from your profile and feed but saved in your archive.")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/${post._id}/archive`, {
                method: 'PUT',
            });
            if (res.ok) {
                setIsDeleted(true);
                alert("Post archived successfully");
            }
        } catch (err) { console.error(err); }
    };

    const handleFollow = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/follow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid, targetUid: post.authorId })
            });
            if (res.ok) alert(`You are now following ${post.author}`);
        } catch (err) { console.error(err); }
    };

    const handleMute = async () => {
        if (!window.confirm(`Mute ${post.author}? You won't see their posts in your feed.`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/mute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid, targetUid: post.authorId })
            });
            if (res.ok) {
                setIsDeleted(true); // Hide current post immediately
                alert(`${post.author} has been muted.`);
            }
        } catch (err) { console.error(err); }
    };

    const handleBlock = async () => {
        if (!window.confirm(`Block ${post.author}? They won't be able to find your profile, posts, or story.`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/block`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid, targetUid: post.authorId })
            });
            if (res.ok) {
                setIsDeleted(true); // Hide post
                alert(`${post.author} has been blocked.`);
            }
        } catch (err) { console.error(err); }
    };

    return (
        <article className="card post-card" style={{ marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative', background: 'var(--background-elevated)', border: 'none', boxShadow: 'var(--shadow-md)' }}>

            {/* Header */}
            <div className="card-header" style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent' }}>
                <NavLink to={`/profile/${post.authorId}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit', flex: 1 }}>
                    <div style={{ position: 'relative' }}>
                        <img src={getMediaUrl(post.authorAvatar)} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid var(--primary-light)', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: '#10b981', border: '2px solid #fff', borderRadius: '50%' }}></div>
                    </div>
                    <div>
                        <div style={{ fontWeight: '800', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-primary)' }}>
                            {post.author}
                            <i className="fas fa-check-circle" style={{ color: 'var(--primary)', fontSize: '12px' }}></i>
                            {postData.isRepost && (
                                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <i className="fas fa-retweet"></i> Reposted
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '500' }}>
                            <i className={`fas fa-${postData.visibility === 'public' ? 'globe-americas' : 'users'}`} style={{ marginRight: '4px' }}></i>
                            {post.category} • {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </NavLink>

                {/* Three Dots Menu - Temporarily disabled due to React hook issues */}
                <div style={{ position: 'relative', zIndex: 20 }}>
                    {/* TODO: Fix PostMenu React hook error - multiple React copies issue */}
                    {/* <PostMenu
                        post={post}
                        onEdit={() => setIsEditModalOpen(true)}
                        onDelete={handleDelete}
                        onReport={() => setIsReportModalOpen(true)}
                        onArchive={handleArchive}
                        onAnalytics={() => alert("Analytics modal phase 3")}
                        onFollow={handleFollow}
                        onMute={handleMute}
                        onBlock={handleBlock}
                    /> */}
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        style={{
                            background: 'rgba(0,0,0,0.05)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <i className="fas fa-ellipsis-h"></i>
                    </button>
                </div>
            </div>

            {/* Media Content - Edge to Edge */}
            {post.image && (
                <div className="post-media" onClick={handleMediaClick} style={{
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    margin: 'var(--space-2) 0',
                    border: '1px solid var(--border-light)',
                    position: 'relative'
                }}>
                    {/* Media Badges overlay */}
                    <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, display: 'flex', gap: '8px' }}>
                        <button onClick={(e) => { e.stopPropagation(); setShowAIInsights(!showAIInsights); }} style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-robot" style={{ fontSize: '12px' }}></i>
                        </button>
                    </div>

                    {showAIInsights && postData.aiIntelligence && (
                        <div className="ai-modal" style={{ position: 'absolute', top: '45px', right: '10px', width: '220px', background: 'rgba(25, 25, 25, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '12px', zIndex: 20, color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                                <span style={{ fontWeight: 'bold', color: 'var(--primary-400)' }}>AI Analysis</span>
                                <i className="fas fa-times" onClick={(e) => { e.stopPropagation(); setShowAIInsights(false); }} style={{ cursor: 'pointer' }}></i>
                            </div>
                            <div>
                                <div>Scene: {postData.aiIntelligence.sceneType}</div>
                                <div>Score: {(postData.aiIntelligence.aestheticScore * 10).toFixed(1)}/10</div>
                            </div>
                        </div>
                    )}
                    {post.image.match(/\.(mp4|mov|avi|mkv)$/i) ? (
                        <video
                            src={getMediaUrl(post.image)}
                            controls
                            style={{
                                width: '100%',
                                display: 'block',
                                maxHeight: '600px',
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        <img
                            src={getMediaUrl(post.image)}
                            alt={post.altText || "Post content"}
                            style={{
                                width: '100%',
                                display: 'block',
                                maxHeight: '600px',
                                objectFit: 'cover'
                            }}
                        />
                    )}
                </div>
            )}

            {/* Content Text (if no media, or caption below media) */}
            {post.description && (
                <div className="post-content" style={{ padding: '0 var(--space-2)', marginBottom: 'var(--space-3)' }}>
                    <RichText content={post.description} />
                </div>
            )}

            {/* Action Bar - Floating/Clean */}
            <div className="post-actions" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-2) var(--space-2)',
                borderTop: '1px solid var(--border-light)',
                marginTop: 'var(--space-2)'
            }}>
                <div className="left-actions" style={{ display: 'flex', gap: 'var(--space-4)' }}>
                    <button
                        className={`action-btn ${isLiked ? 'liked' : ''}`}
                        onClick={handleLike}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.2rem', color: isLiked ? '#ef4444' : 'var(--text-secondary)' }}
                    >
                        <i className={isLiked ? "fas fa-heart" : "far fa-heart"}></i>
                        {likesCount > 0 && <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{likesCount}</span>}
                    </button>

                    <button
                        className="action-btn"
                        onClick={() => setShowComments(!showComments)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.2rem', color: 'var(--text-secondary)' }}
                    >
                        <i className="far fa-comment"></i>
                        {post.comments && post.comments.length > 0 && <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{post.comments.length}</span>}
                    </button>

                    <button
                        className="action-btn"
                        onClick={() => setShowShareModal(true)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-secondary)' }}
                    >
                        <i className="far fa-paper-plane"></i>
                    </button>
                </div>

                <div className="right-actions">
                    <button
                        className={`action-btn ${isSaved ? 'saved' : ''}`}
                        onClick={handleSaveToggle}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: isSaved ? 'var(--primary-600)' : 'var(--text-secondary)' }}
                    >
                        <i className={isSaved ? "fas fa-bookmark" : "far fa-bookmark"}></i>
                    </button>
                </div>
            </div>

            {/* Affiliate Link (if any) */}
            {postData.affiliateLink && (
                <div style={{ padding: '0 var(--space-2)', marginBottom: '12px' }}>
                    <a href={postData.affiliateLink} target="_blank" rel="noreferrer" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-md)' }}>
                        <i className="fas fa-shopping-bag"></i> View Partnership Item
                    </a>
                </div>
            )}

            {/* Comment Section (FR-COMMENT-001) */}
            {showComments && (
                <div className="comment-section" style={{ borderTop: '1px solid var(--border-light)', padding: '20px', background: 'var(--bg-secondary)', animation: 'slideDown 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Conversations</h4>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{comments.length} total</div>
                    </div>
                    <div style={{ maxHeight: '450px', overflowY: 'auto', marginBottom: '20px', paddingRight: '5px' }}>
                        {comments.length > 0 ? (
                            comments.map(c => <CommentItem key={c._id} comment={c} postId={post._id} postAuthorId={post.authorId} onReplySuccess={fetchComments} />)
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '30px', fontSize: '13px' }}>
                                <i className="far fa-comments" style={{ fontSize: '30px', display: 'block', marginBottom: '10px', opacity: 0.5 }}></i>
                                No comments yet. Start the conversation!
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '12px', background: 'var(--background-elevated)', padding: '10px 18px', borderRadius: '30px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                        <img src={currentUser?.photoURL || '/images/default-avatar.png'} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                        <input
                            type="text"
                            placeholder="Add a rich comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            disabled={loading}
                            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: 'var(--text-primary)' }}
                        />
                        <button type="submit" disabled={!commentText.trim() || loading} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>
                            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'POST'}
                        </button>
                    </form>
                </div>
            )}

            {/* Collection Manager (FR-SAVE-002) */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                post={post}
                shareUrl={`${window.location.origin}/post/${post._id}?utm_source=share_modal&utm_medium=web&utm_campaign=user_share`}
            />

            <CollectionModal
                isOpen={showCollectionModal}
                postId={post._id}
                onClose={() => setShowCollectionModal(false)}
                onSaveSuccess={() => { setIsSaved(true); fetch(`${API_BASE_URL}/api/posts/${post._id}`).then(r => r.json()).then(handlePostUpdate); }}
            />

            {isEditModalOpen && (
                <EditPostModal post={postData} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdate={handlePostUpdate} />
            )}

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                targetId={post._id}
                targetType="post"
                targetOwnerId={post.authorId}
            />

            <style>{`
                @keyframes heartPop {
                    0% { transform: scale(0) rotate(-45deg); opacity: 0; }
                    40% { transform: scale(1.3) rotate(0deg); opacity: 1; }
                    60% { transform: scale(1) rotate(0deg); opacity: 1; }
                    100% { transform: scale(0.9) rotate(15deg); opacity: 0; }
                }
                .heart-explosion { animation: heartPop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .trending-badge { animation: badgePulse 2s infinite; }
                @keyframes badgePulse {
                    0% { transform: scale(1); box-shadow: 0 4px 10px rgba(255, 75, 43, 0.3); }
                    50% { transform: scale(1.05); box-shadow: 0 6px 15px rgba(255, 75, 43, 0.5); }
                    100% { transform: scale(1); box-shadow: 0 4px 10px rgba(255, 75, 43, 0.3); }
                }
                .post-image-main:hover { transform: scale(1.02); }
                .comment-section::-webkit-scrollbar { width: 5px; }
                .comment-section::-webkit-scrollbar-thumb { background: var(--border-light); borderRadius: 10px; }
            `}</style>
        </article>
    );
};

export default PostCard;
