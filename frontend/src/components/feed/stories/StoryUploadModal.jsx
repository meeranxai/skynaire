import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { API_BASE_URL } from '../../../api/config';

const StoryUploadModal = ({ onClose, onSuccess }) => {
    const { currentUser } = useAuth();
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [isCloseFriends, setIsCloseFriends] = useState(false);

    // Advanced Editing State
    const [stickers, setStickers] = useState([]);
    const [textOverlays, setTextOverlays] = useState([]);
    const [editingElement, setEditingElement] = useState(null); // { type: 'text'|'poll', index: number }

    const fileInputRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!scrollRef.current || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') return;
            if (e.key === 'ArrowDown') { e.preventDefault(); scrollRef.current.scrollBy({ top: 100, behavior: 'smooth' }); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); scrollRef.current.scrollBy({ top: -100, behavior: 'smooth' }); }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        setFile(selectedFile);
        setFileType(selectedFile.type.startsWith('video/') ? 'video' : 'image');
        setPreviewUrl(URL.createObjectURL(selectedFile));
    };

    const addTextOverlay = () => {
        const newText = {
            content: 'Double tap to edit',
            position: { x: 50, y: 50 },
            style: { color: '#ffffff', fontSize: '24px', fontWeight: 'bold', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }
        };
        setTextOverlays([...textOverlays, newText]);
        setEditingElement({ type: 'text', index: textOverlays.length });
    };

    const addPoll = () => {
        const newPoll = {
            type: 'poll',
            question: 'Your Question?',
            options: ['Yes', 'No'],
            position: { x: 50, y: 30 }
        };
        setStickers([...stickers, newPoll]);
        setEditingElement({ type: 'poll', index: stickers.length });
    };

    const updateElement = (val) => {
        if (!editingElement) return;
        if (editingElement.type === 'text') {
            const newTexts = [...textOverlays];
            newTexts[editingElement.index].content = val;
            setTextOverlays(newTexts);
        } else if (editingElement.type === 'poll') {
            const newStickers = [...stickers];
            newStickers[editingElement.index].question = val;
            setStickers(newStickers);
        }
    };

    const handleUpload = async () => {
        if (!file || !currentUser) return;
        setLoading(true);

        const mentions = (caption.match(/@(\w+)/g) || []).map(m => m.substring(1));
        const hashtags = (caption.match(/#(\w+)/g) || []).map(h => h.substring(1));

        const formData = new FormData();
        formData.append('media', file);
        formData.append('userId', currentUser.uid);
        formData.append('userDisplayName', currentUser.displayName || 'User');
        formData.append('userAvatar', currentUser.photoURL || '');
        formData.append('caption', caption);
        formData.append('isCloseFriends', isCloseFriends);
        formData.append('mentions', JSON.stringify(mentions));
        formData.append('hashtags', JSON.stringify(hashtags));
        formData.append('overlays', JSON.stringify(textOverlays));
        formData.append('stickers', JSON.stringify(stickers));

        try {
            const res = await fetch(`${API_BASE_URL}/api/stories`, { method: 'POST', body: formData });
            if (res.ok) onSuccess();
            else alert('Failed to upload story');
        } catch (err) { console.error('Upload error:', err); }
        finally { setLoading(false); }
    };

    return (
        <div className="story-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, backdropFilter: 'blur(15px)' }}>
            <style>{`
                .story-modal-content::-webkit-scrollbar { width: 4px; }
                .story-modal-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); borderRadius: 10px; }
                .edit-input { background: none; border: none; color: white; text-align: center; font-size: 24px; font-weight: bold; outline: none; width: 100%; text-shadow: 0 4px 20px rgba(0,0,0,0.8); }
            `}</style>

            <div ref={scrollRef} className="story-modal-content" style={{ background: 'var(--background-elevated)', borderRadius: '32px', width: '100%', maxWidth: '440px', maxHeight: '95vh', overflowY: 'auto', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {/* Header Toolbar */}
                <div style={{ padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--background-elevated)', zIndex: 100 }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>New Story</h3>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        {previewUrl && (
                            <>
                                <button onClick={addTextOverlay} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }} title="Add Text"><i className="fas fa-font"></i></button>
                                <button onClick={addPoll} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }} title="Add Poll"><i className="fas fa-poll-h"></i></button>
                                <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }} title="Music"><i className="fas fa-music"></i></button>
                            </>
                        )}
                        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
                    </div>
                </div>

                {/* Editor Area */}
                <div style={{ position: 'relative', width: '100%', height: '560px', background: '#000', overflow: 'hidden' }}>
                    {previewUrl ? (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            {fileType === 'video' ? <video src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop /> : <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />}

                            {/* Render Interactive Elements */}
                            {textOverlays.map((text, i) => (
                                <div key={`text-${i}`}
                                    onClick={() => setEditingElement({ type: 'text', index: i })}
                                    style={{ position: 'absolute', left: `${text.position.x}%`, top: `${text.position.y}%`, transform: 'translate(-50%, -50%)', cursor: 'move', ...text.style, pointerEvents: 'auto' }}>
                                    {text.content}
                                </div>
                            ))}

                            {stickers.map((st, i) => (
                                <div key={`poll-${i}`}
                                    onClick={() => setEditingElement({ type: 'poll', index: i })}
                                    style={{ position: 'absolute', left: `${st.position.x}%`, top: `${st.position.y}%`, transform: 'translate(-50%, -50%)', background: '#fff', color: '#000', padding: '15px', borderRadius: '15px', minWidth: '180px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', pointerEvents: 'auto' }}>
                                    <p style={{ margin: '0 0 10px', fontWeight: 'bold', textAlign: 'center' }}>{st.question}</p>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {st.options.map(o => <div key={o} style={{ flex: 1, padding: '8px', background: '#f0f0f0', borderRadius: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>{o}</div>)}
                                    </div>
                                </div>
                            ))}

                            {/* Editing Overlay */}
                            {editingElement && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
                                    <input
                                        autoFocus
                                        className="edit-input"
                                        value={editingElement.type === 'text' ? textOverlays[editingElement.index].content : stickers[editingElement.index].question}
                                        onChange={(e) => updateElement(e.target.value)}
                                        onBlur={() => setEditingElement(null)}
                                        onKeyDown={(e) => e.key === 'Enter' && setEditingElement(null)}
                                    />
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '10px' }}>Tap away to save</p>
                                </div>
                            )}

                            <button onClick={() => { setFile(null); setPreviewUrl(null); }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer' }}><i className="fas fa-sync-alt"></i></button>
                        </div>
                    ) : (
                        <div onClick={() => fileInputRef.current.click()} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '30px', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                                <i className="fas fa-plus" style={{ fontSize: '2rem', color: '#fff' }}></i>
                            </div>
                            <h4 style={{ color: '#fff', margin: 0 }}>Select Media</h4>
                            <p style={{ fontSize: '12px' }}>Choose a photo or video to begin</p>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} accept="image/*,video/*" />
                </div>

                {/* Caption & Privacy */}
                <div style={{ padding: '25px' }}>
                    <textarea placeholder="Add a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} style={{ width: '100%', background: 'var(--surface-50)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '15px', color: 'var(--text-primary)', resize: 'none', fontSize: '0.95rem', minHeight: '80px', outline: 'none', marginBottom: '20px' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '15px', background: 'var(--surface-50)', borderRadius: '20px', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: isCloseFriends ? '#10b981' : '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                <i className={`fas ${isCloseFriends ? 'fa-star' : 'fa-globe-americas'}`}></i>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>{isCloseFriends ? 'Close Friends' : 'Everyone'}</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Visibility Control</p>
                            </div>
                        </div>
                        <button onClick={() => setIsCloseFriends(!isCloseFriends)} style={{ padding: '8px 20px', borderRadius: '12px', background: 'var(--background-elevated)', border: '1px solid var(--border-light)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Change</button>
                    </div>

                    <button onClick={handleUpload} disabled={loading || !file} className="btn btn-primary" style={{ width: '100%', padding: '18px', borderRadius: '20px', fontWeight: '900', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 20px var(--primary-soft)' }}>
                        {loading ? <><i className="fas fa-spinner fa-spin"></i> Posting...</> : <><i className="fas fa-paper-plane"></i> Share Story</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StoryUploadModal;
