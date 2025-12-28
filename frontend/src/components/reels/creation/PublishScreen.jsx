import React, { useState } from 'react';

const PublishScreen = ({ mediaFile, onPublish, onBack }) => {
    const [caption, setCaption] = useState('');
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = () => {
        setIsSharing(true);
        onPublish({ caption });
    };

    return (
        <div style={{ height: '100%', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', display: 'flex', gap: '15px' }}>
                {/* Preview Thumbnail (Generated or Video) */}
                <div style={{ width: '80px', height: '120px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                    {mediaFile && (
                        <video
                            src={URL.createObjectURL(mediaFile)}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    )}
                </div>

                <div style={{ flex: 1 }}>
                    <textarea
                        placeholder="Write a caption..."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        style={{
                            width: '100%', height: '100px', background: 'transparent',
                            border: 'none', color: '#fff', fontSize: '16px', resize: 'none',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            <div style={{ height: '1px', background: '#333', margin: '0 20px' }}></div>

            <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span>Tag People</span>
                    <i className="fas fa-chevron-right" style={{ color: '#aaa' }}></i>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span>Add Location</span>
                    <i className="fas fa-chevron-right" style={{ color: '#aaa' }}></i>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span>Advanced Settings</span>
                    <i className="fas fa-chevron-right" style={{ color: '#aaa' }}></i>
                </div>
            </div>

            <div style={{ flex: 1 }}></div>

            <div style={{ padding: '20px', display: 'flex', gap: '10px' }}>
                <button
                    onClick={onBack}
                    style={{ flex: 1, padding: '15px', borderRadius: '8px', background: '#333', color: '#fff', border: 'none', fontWeight: 'bold' }}
                >
                    Drafts
                </button>
                <button
                    onClick={handleShare}
                    disabled={isSharing}
                    style={{ flex: 1, padding: '15px', borderRadius: '8px', background: '#3b82f6', color: '#fff', border: 'none', fontWeight: 'bold' }}
                >
                    {isSharing ? 'Sharing...' : 'Share'}
                </button>
            </div>
        </div>
    );
};

export default PublishScreen;
