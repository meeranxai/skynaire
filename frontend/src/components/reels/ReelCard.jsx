import React, { useState, useRef, useEffect } from 'react';
import { getMediaUrl } from '../../api/config';

const ReelCard = ({ reel, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        if (isHovered && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => { }); // Ignore autoplay errors
        } else if (videoRef.current) {
            videoRef.current.pause();
        }
    }, [isHovered]);

    return (
        <div
            className="reel-card"
            onClick={() => onClick(reel)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: 'relative',
                width: '100%',
                paddingBottom: '133%', // 3:4 Aspect Ratio
                marginBottom: '16px',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#222',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                breakInside: 'avoid' // For masonry
            }}
        >
            <div style={{ position: 'absolute', inset: 0 }}>
                {isHovered ? (
                    <video
                        ref={videoRef}
                        src={getMediaUrl(reel.videoUrl)}
                        muted
                        loop
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <img
                        src={getMediaUrl(reel.thumbnailUrl) || getMediaUrl(reel.videoUrl) + '#t=0.5'} // Fallback crude thumbnail if supported or just loads video poster
                        alt={reel.description}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            // Fallback to video element if img fails (common for direct video links without separate thumb)
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                        }}
                    />
                )}
                {/* Fallback video acting as thumb if img fails */}
                <video
                    src={getMediaUrl(reel.videoUrl)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: isHovered ? 'none' : 'none' }} // Hidden by default
                    muted
                />

                {/* Gradient Overlay */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                }}></div>

                {/* Engagement Stats */}
                <div style={{
                    position: 'absolute', bottom: '10px', left: '10px', right: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    color: '#fff', fontSize: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fas fa-play" style={{ fontSize: '10px' }}></i>
                        <span>{reel.views || 0}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fas fa-heart" ></i>
                        <span>{reel.likes?.length || 0}</span>
                    </div>
                </div>

                {/* Audio Badge */}
                <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '12px',
                    color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <i className="fas fa-music"></i>
                    <span>Audio</span>
                </div>
            </div>
        </div>
    );
};

export default ReelCard;
