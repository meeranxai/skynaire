import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReelPlayer from './ReelPlayer';
import { API_BASE_URL } from '../../api/config';

const ReelFeed = ({ currentUser, initialReels }) => {
    const [reels, setReels] = useState(initialReels || []);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [activeReelId, setActiveReelId] = useState(null);
    const containerRef = useRef(null);
    const observer = useRef(null);

    // Sync with parent updates
    useEffect(() => {
        if (initialReels && initialReels.length > 0) {
            setReels(initialReels);
            // Set first reel as active if none
            if (!activeReelId && initialReels[0]) {
                setActiveReelId(initialReels[0]._id);
            }
        }
    }, [initialReels]);

    // Initial Fetch (Only if no initial reels provided)
    useEffect(() => {
        if (!initialReels || initialReels.length === 0) {
            fetchReels();
        }
    }, []);

    const fetchReels = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/reels/feed?page=${page}&limit=5&userId=${currentUser?.uid}`);
            const newReels = await res.json();

            if (newReels.length > 0) {
                setReels(prev => [...prev, ...newReels]);
                setPage(prev => prev + 1);

                // Set first reel as active if none
                if (!activeReelId && newReels[0]) {
                    setActiveReelId(newReels[0]._id);
                }
            }
        } catch (err) {
            console.error("Failed to fetch reels:", err);
        } finally {
            setLoading(false);
        }
    };

    // Intersection Observer for Current Reel
    const lastReelRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                fetchReels();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading]);

    // Scroll Logic to Determine Active Reel
    const handleScroll = () => {
        const container = containerRef.current;
        if (!container) return;

        const scrollPosition = container.scrollTop;
        const windowHeight = container.clientHeight;

        // Find center index
        const index = Math.round(scrollPosition / windowHeight);

        if (reels[index] && reels[index]._id !== activeReelId) {
            setActiveReelId(reels[index]._id);
        }
    };

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{
                height: '100%',
                scrollSnapType: 'y mandatory',
                overflowY: 'scroll',
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none',  // IE/Edge
            }}
            className="reels-feed no-scrollbar"
        >
            {reels.map((reel, index) => (
                <div
                    key={reel._id}
                    ref={index === reels.length - 1 ? lastReelRef : null}
                    style={{
                        height: '100%',
                        width: '100%',
                        scrollSnapAlign: 'start',
                        position: 'relative'
                    }}
                >
                    <ReelPlayer
                        reel={reel}
                        isActive={activeReelId === reel._id}
                        currentUser={currentUser}
                    />
                </div>
            ))}

            {loading && (
                <div style={{
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                }}>
                    <i className="fas fa-spinner fa-spin fa-2x"></i>
                </div>
            )}
        </div>
    );
};

export default ReelFeed;
