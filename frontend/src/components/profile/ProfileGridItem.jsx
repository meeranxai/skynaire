import React from 'react';
import { getMediaUrl } from '../../api/config';
import { useGNavigation } from '../../contexts/NavigationContext';

const ProfileGridItem = ({ post, feedType = 'profile' }) => {
    const { openPostViewer } = useGNavigation();
    const imgUrl = getMediaUrl(post.image);

    const handleClick = () => {
        openPostViewer(post, feedType);
    };

    return (
        <div
            className="grid-post"
            onClick={handleClick}
            style={{
                backgroundImage: `url(${imgUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '300px',
                cursor: 'pointer',
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden'
            }}
        >
            <div className="post-overlay" style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                opacity: 0,
                transition: 'opacity 0.2s ease',
                color: '#fff',
                fontSize: '18px',
                fontWeight: 'bold'
            }}>
                <div className="overlay-stat"><i className="fas fa-heart"></i> {post.likes?.length || 0}</div>
                <div className="overlay-stat"><i className="fas fa-comment"></i> {post.comments?.length || 0}</div>
            </div>
            <style>{`
                .grid-post:hover .post-overlay { opacity: 1; }
            `}</style>
        </div>
    );
};

export default ProfileGridItem;
