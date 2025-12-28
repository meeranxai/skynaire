import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { API_BASE_URL, getMediaUrl } from '../../../api/config';
import StoryItem from './StoryItem';
import StoryUploadModal from './StoryUploadModal';
import StoryViewer from './StoryViewer';

const StoryBar = () => {
    const { currentUser } = useAuth();
    const [storyGroups, setStoryGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const fetchStories = async () => {
        if (!currentUser) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/stories?userId=${currentUser.uid}`);
            if (res.ok) {
                const data = await res.json();
                setStoryGroups(data);
            }
        } catch (err) {
            console.error('Error fetching stories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, [currentUser]);

    // Group for current user if they have stories
    const currentUserGroup = storyGroups.find(g => g.userId === currentUser?.uid);
    // Other users' groups
    const otherGroups = storyGroups.filter(g => g.userId !== currentUser?.uid);

    return (
        <>
            <div className="story-bar-container" style={{
                display: 'flex',
                gap: 'var(--space-4)',
                padding: 'var(--space-4) 0',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                marginBottom: 'var(--space-4)',
                maskImage: 'linear-gradient(to right, black 85%, transparent 100%)'
            }}>
                {/* Add Story Button / Current User Story */}
                <div className="story-item-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px', cursor: 'pointer' }}>
                    <div
                        className="story-avatar-ring"
                        onClick={() => {
                            if (currentUserGroup) {
                                setSelectedGroup(currentUserGroup);
                            } else {
                                setShowUpload(true);
                            }
                        }}
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            padding: '3px',
                            background: currentUserGroup ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' : 'var(--border-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}
                    >
                        <img
                            src={getMediaUrl(currentUser?.photoURL)}
                            alt="My Story"
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                border: '2px solid var(--background-elevated)',
                                objectFit: 'cover'
                            }}
                        />
                        {!currentUserGroup && (
                            <div style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                border: '2px solid var(--background-elevated)'
                            }}>
                                <i className="fas fa-plus"></i>
                            </div>
                        )}
                    </div>
                    <span style={{ fontSize: '11px', marginTop: '6px', color: 'var(--text-secondary)', fontWeight: 'var(--font-medium)' }}>
                        Your Story
                    </span>
                </div>

                {/* Other Users' Stories */}
                {otherGroups.map(group => (
                    <StoryItem
                        key={group.userId}
                        group={group}
                        onClick={() => setSelectedGroup(group)}
                    />
                ))}
            </div>

            {/* MODALS RENDERED OUTSIDE SCROLL CONTAINER TO PREVENT CLIPPING */}
            {showUpload && (
                <StoryUploadModal
                    onClose={() => setShowUpload(false)}
                    onSuccess={() => {
                        setShowUpload(false);
                        fetchStories();
                    }}
                />
            )}

            {selectedGroup && (
                <StoryViewer
                    group={selectedGroup}
                    onClose={() => setSelectedGroup(null)}
                    onStoryViewed={fetchStories}
                />
            )}
        </>
    );
};

export default StoryBar;
