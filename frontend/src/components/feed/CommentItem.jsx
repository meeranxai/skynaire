import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../api/config';

const CommentItem = ({ comment, postId, postAuthorId, onReplySuccess, depth = 0 }) => {
    const { currentUser } = useAuth();
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLiked, setIsLiked] = useState(comment.likes?.includes(currentUser?.uid));
    const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || loading) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    userName: currentUser.displayName,
                    userAvatar: currentUser.photoURL,
                    text: replyText,
                    parentCommentId: comment._id
                })
            });

            if (res.ok) {
                setReplyText('');
                setShowReplyInput(false);
                if (onReplySuccess) onReplySuccess();
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const toggleLike = async () => {
        if (!currentUser) return;
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

        try {
            await fetch(`${API_BASE_URL}/api/posts/comment/${comment._id}/like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid })
            });
        } catch (err) { console.error(err); }
    };

    const handleDelete = async () => {
        if (!window.confirm("Remove this comment?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/comment/${comment._id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid })
            });
            if (res.ok) onReplySuccess();
        } catch (err) { console.error(err); }
    };

    const handlePin = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/posts/${postId}/pin-comment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid, commentId: comment._id })
            });
            onReplySuccess();
        } catch (err) { console.error(err); }
    };

    if (comment.moderationStatus === 'removed') return null;

    return (
        <div className="comment-thread" style={{ marginLeft: depth > 0 ? '30px' : '0', marginBottom: '18px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
                <img
                    src={comment.authorAvatar || '/images/default-avatar.png'}
                    alt=""
                    className="avatar-sm"
                    style={{ width: depth === 0 ? '36px' : '28px', height: depth === 0 ? '36px' : '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-light)' }}
                />
                <div style={{ flex: 1 }}>
                    <div style={{
                        background: 'var(--bg-secondary)',
                        padding: '10px 16px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        position: 'relative',
                        border: comment.isPinned ? '1px solid var(--primary-light)' : 'none',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        {comment.isPinned && (
                            <div style={{ position: 'absolute', right: '12px', top: '-10px', background: 'var(--background-elevated)', borderRadius: '12px', padding: '3px 10px', fontSize: '9px', fontWeight: '800', color: 'var(--primary)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--primary-light)' }}>
                                <i className="fas fa-thumbtack" style={{ transform: 'rotate(45deg)', marginRight: '4px' }}></i> PINNED
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{comment.author}</strong>
                            {(currentUser?.uid === comment.authorId || currentUser?.uid === postAuthorId) && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {currentUser?.uid === postAuthorId && (
                                        <i className="fas fa-thumbtack" onClick={handlePin} style={{ cursor: 'pointer', color: comment.isPinned ? 'var(--primary)' : 'var(--text-tertiary)', fontSize: '11px' }} title="Toggle Pin"></i>
                                    )}
                                    <i className="far fa-trash-alt" onClick={handleDelete} style={{ cursor: 'pointer', color: 'var(--error)', fontSize: '11px', opacity: 0.6 }} title="Delete"></i>
                                </div>
                            )}
                        </div>
                        <span style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{comment.text}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '18px', alignItems: 'center', marginTop: '6px', marginLeft: '12px', fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600' }}>
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: isLiked ? 'var(--error)' : 'inherit' }} onClick={toggleLike}>
                            <i className={isLiked ? "fas fa-heart" : "far fa-heart"}></i>
                            {likesCount > 0 && <span>{likesCount}</span>}
                        </div>
                        {depth < 2 && (
                            <button onClick={() => setShowReplyInput(!showReplyInput)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>
                                Reply
                            </button>
                        )}
                    </div>

                    {showReplyInput && (
                        <form onSubmit={handleReplySubmit} style={{ marginTop: '12px', display: 'flex', gap: '10px', animation: 'slideDown 0.2s ease' }}>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Write a response..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '6px 15px', fontSize: '12px', color: 'var(--text-primary)', outline: 'none' }}
                            />
                            <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }} disabled={!replyText.trim() || loading}>
                                {loading ? '...' : 'SEND'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {comment.replies && comment.replies.length > 0 && (
                <div className="replies-container" style={{ marginTop: '12px', borderLeft: '1px solid var(--border-light)', paddingLeft: '5px' }}>
                    {comment.replies.map(reply => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            postId={postId}
                            postAuthorId={postAuthorId}
                            onReplySuccess={onReplySuccess}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
