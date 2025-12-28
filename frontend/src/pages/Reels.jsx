import React, { useState, useRef, useEffect } from 'react';
import ReelFeed from '../components/reels/ReelFeed';
import ReelGrid from '../components/reels/ReelGrid';
import CreationStudio from '../components/reels/creation/CreationStudio';
import { useAuth } from '../contexts/AuthContext';
import MobileNav from '../components/layout/MobileNav';
import { API_BASE_URL } from '../api/config';

const ReelsPage = () => {
    const { currentUser } = useAuth();
    const [viewMode, setViewMode] = useState('grid');
    const [reels, setReels] = useState([]);
    const [page, setPage] = useState(1);
    const [isCreating, setIsCreating] = useState(false);

    // Initial Fetch (Shared)
    useEffect(() => {
        fetchReels();
    }, []);

    const fetchReels = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/reels/feed?page=${page}&limit=10&userId=${currentUser?.uid}`);
            const newReels = await res.json();

            if (newReels.length > 0) {
                setReels(prev => {
                    const existingIds = new Set(prev.map(r => r._id));
                    const uniqueNew = newReels.filter(r => !existingIds.has(r._id));
                    return [...prev, ...uniqueNew];
                });
                setPage(page + 1);
            }
        } catch (err) {
            console.error("Failed to fetch reels:", err);
        }
    };

    const handlePublishSuccess = async (mediaFile, metadata) => {
        const formData = new FormData();
        formData.append('video', mediaFile);
        formData.append('authorId', currentUser.uid);
        formData.append('author', currentUser.displayName || 'User');
        formData.append('authorAvatar', currentUser.photoURL || '');
        formData.append('description', metadata.caption || '');

        try {
            const res = await fetch(`${API_BASE_URL}/api/reels`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                alert('Reel published successfully!');
                setIsCreating(false);
                window.location.reload();
            } else {
                alert('Publish failed');
            }
        } catch (e) { console.error(e); }
    };

    const toggleMode = () => setViewMode(prev => prev === 'immersive' ? 'grid' : 'immersive');

    return (
        <div className="reels-page-container" style={{
            height: '100vh',
            width: '100vw',
            backgroundColor: '#000',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Creation Studio Overlay */}
            {isCreating && (
                <CreationStudio
                    onClose={() => setIsCreating(false)}
                    onPublishSuccess={handlePublishSuccess}
                />
            )}

            {/* Header / Mode Toggle */}
            <div style={{
                position: 'absolute', top: '15px', left: '15px', zIndex: 100,
                display: 'flex', gap: '10px'
            }}>
                <button
                    onClick={toggleMode}
                    style={{
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff', borderRadius: '20px', padding: '8px 16px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '14px', fontWeight: 'bold'
                    }}
                >
                    <i className={viewMode === 'grid' ? "fas fa-film" : "fas fa-th"}></i>
                    {viewMode === 'grid' ? 'Watch' : 'Grid'}
                </button>
            </div>

            {/* Create Button (Studio Trigger) */}
            <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 100 }}>
                <button
                    onClick={() => setIsCreating(true)}
                    style={{
                        background: 'var(--primary-600)',
                        color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}
                >
                    <i className="fas fa-plus"></i>
                </button>
            </div>

            {/* Content Area */}
            {/* Content Area with Transitions */}
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    opacity: viewMode === 'immersive' ? 1 : 0,
                    pointerEvents: viewMode === 'immersive' ? 'all' : 'none',
                    transition: 'opacity 0.3s ease-in-out',
                    zIndex: viewMode === 'immersive' ? 10 : 0
                }}>
                    <ReelFeed currentUser={currentUser} initialReels={reels} />
                </div>

                <div style={{
                    position: 'absolute', inset: 0,
                    opacity: viewMode === 'grid' ? 1 : 0,
                    pointerEvents: viewMode === 'grid' ? 'all' : 'none',
                    transition: 'opacity 0.3s ease-in-out',
                    zIndex: viewMode === 'grid' ? 10 : 0
                }}>
                    <ReelGrid
                        reels={reels}
                        onReelClick={() => setViewMode('immersive')}
                        onLoadMore={fetchReels}
                    />
                </div>
            </div>

            {/* Mobile Nav */}
            <div className="md:hidden" style={{ position: 'fixed', bottom: 0, width: '100%', zIndex: 1000 }}>
                <MobileNav />
            </div>
        </div>
    );
};

export default ReelsPage;
