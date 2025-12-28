import React from 'react';
import ReelCard from './ReelCard';

const ReelGrid = ({ reels, onReelClick, onLoadMore }) => {
    // Basic Infinite Scroll Trigger (can be enhanced with IntersectionObserver)
    const handleScroll = (e) => {
        const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (bottom) {
            onLoadMore();
        }
    };

    return (
        <div
            className="reel-grid-container"
            onScroll={handleScroll}
            style={{
                height: '100%',
                overflowY: 'auto',
                padding: '16px',
                paddingBottom: '80px' // Space for nav
            }}
        >
            <div style={{
                columnCount: 3, // Masonry Layout
                columnGap: '16px',
                width: '100%'
            }}>
                {reels.map(reel => (
                    <ReelCard
                        key={reel._id}
                        reel={reel}
                        onClick={onReelClick}
                    />
                ))}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .reel-grid-container > div {
                        column-count: 2 !important;
                    }
                }
                 @media (max-width: 480px) {
                    .reel-grid-container > div {
                        column-count: 2 !important;
                        column-gap: 8px !important;
                    }
                }
            `}</style>

            {reels.length === 0 && (
                <div style={{ color: '#aaa', textAlign: 'center', marginTop: '50px' }}>
                    No reels found. Create one!
                </div>
            )}
        </div>
    );
};

export default ReelGrid;
