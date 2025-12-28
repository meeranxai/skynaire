import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../api/config';
import { useToast } from '../../contexts/ToastContext';
import '../../styles/PostMenu.css'; // Reuse existing modal styles

const ShareModal = ({ isOpen, onClose, post, shareUrl }) => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const [copied, setCopied] = useState(false);
    const [reposting, setReposting] = useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        addToast('Link copied to clipboard!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRepost = async () => {
        if (!currentUser || reposting) return;
        setReposting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: post.description,
                    author: currentUser.displayName,
                    authorId: currentUser.uid,
                    authorAvatar: currentUser.photoURL,
                    originalPostId: post._id,
                    isRepost: true,
                    image: post.image,
                    title: `Repost: ${post.title}`,
                    category: post.category,
                    aspectRatio: post.aspectRatio
                })
            });
            
            if (res.ok) {
                addToast('Post reposted to your feed!', 'success');
                onClose();
            } else {
                addToast('Failed to repost. Try again.', 'error');
            }
        } catch (err) {
            console.error(err);
            addToast('Network error during repost.', 'error');
        } finally {
            setReposting(false);
        }
    };

    const shareOptions = [
        {
            id: 'repost',
            label: reposting ? 'Reposting...' : 'Repost',
            icon: 'fas fa-retweet',
            color: 'var(--primary)',
            action: handleRepost
        },
        {
            id: 'copy',
            label: copied ? 'Copied!' : 'Copy Link',
            icon: copied ? 'fas fa-check' : 'fas fa-link',
            color: copied ? 'var(--success)' : 'var(--text-primary)',
            action: handleCopy
        },
        {
            id: 'twitter',
            label: 'Twitter',
            icon: 'fab fa-twitter',
            color: '#1DA1F2',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.description || 'Check this out!')}&url=${encodeURIComponent(shareUrl)}`
        },
        {
            id: 'facebook',
            label: 'Facebook',
            icon: 'fab fa-facebook',
            color: '#1877F2',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        },
        {
            id: 'whatsapp',
            label: 'WhatsApp',
            icon: 'fab fa-whatsapp',
            color: '#25D366',
            url: `https://wa.me/?text=${encodeURIComponent((post.description || 'Check this out!') + ' ' + shareUrl)}`
        },
        {
            id: 'email',
            label: 'Email',
            icon: 'fas fa-envelope',
            color: 'var(--text-secondary)',
            url: `mailto:?subject=${encodeURIComponent('Check this post on G-Network')}&body=${encodeURIComponent(shareUrl)}`
        }
    ];

    const handleExternalShare = (option) => {
        if (option.action) {
            option.action();
        } else if (option.url) {
            window.open(option.url, '_blank', 'noopener,noreferrer');
        }
        // Optional: track share API call here
    };

    return (
        <div className="modal-overlay active" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100, backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <div className="card" style={{ 
                width: '90%', maxWidth: '400px', 
                borderRadius: '16px', 
                background: 'var(--background-elevated)', 
                padding: '0', 
                overflow: 'hidden', 
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' 
            }} onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Share to...</div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>&times;</button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                    {shareOptions.map(option => (
                        <div key={option.id} onClick={() => handleExternalShare(option)} style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer'
                        }}>
                            <div style={{
                                width: '50px', height: '50px', borderRadius: '50%', background: 'var(--bg-secondary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                                color: option.color, transition: 'transform 0.2s'
                            }}>
                                <i className={option.icon}></i>
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{option.label}</span>
                        </div>
                    ))}
                </div>
                
                {/* Link Preview */}
                <div style={{ padding: '0 20px 20px' }}>
                    <div style={{ 
                        background: 'var(--bg-secondary)', padding: '10px 15px', borderRadius: '8px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        fontSize: '13px', color: 'var(--text-secondary)', border: '1px solid var(--border-light)'
                    }}>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '10px' }}>
                            {shareUrl}
                        </span>
                        <button onClick={handleCopy} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}>
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
