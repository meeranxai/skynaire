import React from 'react';
import { getMediaUrl } from '../../../api/config';

const StoryItem = ({ group, onClick }) => {
    // Check if there are unviewed stories
    // This is a simple implementation: in a real app you'd check which stories in the group
    // the current user has already seen.
    const hasUnviewed = group.stories.some(s => !s.views?.includes(group.userId)); // Placeholder logic

    return (
        <div
            className="story-item-wrapper"
            onClick={onClick}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '70px',
                cursor: 'pointer'
            }}
        >
            <div
                className="story-avatar-ring"
                style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    padding: '3px',
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <img
                    src={getMediaUrl(group.userAvatar)}
                    alt={group.userDisplayName}
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '2px solid var(--background-elevated)',
                        objectFit: 'cover'
                    }}
                />
            </div>
            <span style={{
                fontSize: '11px',
                marginTop: '6px',
                color: 'var(--text-secondary)',
                fontWeight: 'var(--font-medium)',
                maxWidth: '64px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}>
                {group.userDisplayName}
            </span>
        </div>
    );
};

export default StoryItem;
