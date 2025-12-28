import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL, getMediaUrl } from '../../api/config';

const EditProfileModal = ({ user, isOpen, onClose, onUpdate }) => {
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [pronouns, setPronouns] = useState(user?.pronouns || '');
    const [website, setWebsite] = useState(user?.website || '');
    const [locationName, setLocationName] = useState(user?.location?.name || '');
    const [techStack, setTechStack] = useState(user?.techStack?.join(', ') || '');

    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.photoURL || '');
    const [cover, setCover] = useState(null);
    const [coverPreview, setCoverPreview] = useState(user?.coverPhotoURL || '');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && isOpen) {
            setDisplayName(user.displayName || '');
            setBio(user.bio || '');
            setPronouns(user.pronouns || '');
            setWebsite(user.website || '');
            setLocationName(user.location?.name || '');
            setTechStack(user.techStack?.join(', ') || '');
            setAvatarPreview(user.photoURL || user.avatar || '');
            setCoverPreview(user.coverPhotoURL || user.coverPhoto || '');
        }
    }, [user, isOpen]);

    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'avatar') {
                    setAvatar(file);
                    setAvatarPreview(reader.result);
                } else {
                    setCover(file);
                    setCoverPreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('userId', user.uid || user.firebaseUid);
            formData.append('displayName', displayName);
            formData.append('bio', bio);
            formData.append('pronouns', pronouns);
            formData.append('website', website);
            formData.append('location', JSON.stringify({ name: locationName }));
            
            const techStackArray = techStack.split(',').map(t => t.trim()).filter(t => t);
            formData.append('techStack', JSON.stringify(techStackArray));

            if (avatar) formData.append('avatar', avatar);
            if (cover) formData.append('coverPhoto', cover);

            const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
                method: 'PUT',
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                if (onUpdate) onUpdate(data.user);
                onClose();
            } else {
                setError(data.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error("Profile update error:", err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay active" onClick={onClose} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="edit-profile-modal" onClick={e => e.stopPropagation()} style={{
                width: '100%',
                maxWidth: '600px',
                padding: 'var(--space-6)',
                backgroundColor: 'var(--background-elevated)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-2xl)',
                overflowY: 'auto',
                maxHeight: '90vh'
            }}>
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h3 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>Edit Profile</h3>
                    <button className="btn-settings" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {error && <div style={{ color: '#ff4757', marginBottom: '15px', padding: '10px', background: 'rgba(255, 71, 87, 0.1)', borderRadius: '10px', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="edit-form">
                    <div style={{ position: 'relative', marginBottom: '80px' }}>
                        <div className="profile-cover-section" style={{ height: '150px', borderRadius: '15px', cursor: 'pointer', overflow: 'hidden', position: 'relative' }} onClick={() => coverInputRef.current.click()}>
                            <img src={coverPreview?.startsWith('data:') ? coverPreview : getMediaUrl(coverPreview) || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop'} alt="Cover" className="cover-image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div className="cover-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                                <i className="fas fa-camera" style={{ color: 'white', fontSize: '24px' }}></i>
                            </div>
                        </div>

                        <div style={{ position: 'absolute', bottom: '-40px', left: '20px', zIndex: 10 }}>
                            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => avatarInputRef.current.click()}>
                                <img src={avatarPreview?.startsWith('data:') ? avatarPreview : getMediaUrl(avatarPreview) || '/images/default-avatar.png'} alt="Avatar" className="profile-avatar-lg" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', background: 'white' }} />
                                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fas fa-camera" style={{ color: 'white', fontSize: '18px' }}></i>
                                </div>
                            </div>
                        </div>

                        <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={e => handleFileChange(e, 'avatar')} />
                        <input type="file" ref={coverInputRef} hidden accept="image/*" onChange={e => handleFileChange(e, 'cover')} />
                    </div>

                    <div className="group-row" style={{ marginBottom: 'var(--space-4)' }}>
                        <label className="form-label">Display Name</label>
                        <input type="text" className="form-input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display name" />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: 'var(--space-4)' }}>
                        <div className="group-row" style={{ flex: 1 }}>
                            <label className="form-label">Pronouns</label>
                            <input type="text" className="form-input" value={pronouns} onChange={e => setPronouns(e.target.value)} placeholder="e.g. they/them" />
                        </div>
                        <div className="group-row" style={{ flex: 1 }}>
                            <label className="form-label">Location</label>
                            <input type="text" className="form-input" value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="City, Country" />
                        </div>
                    </div>

                    <div className="group-row" style={{ marginBottom: 'var(--space-4)' }}>
                        <label className="form-label">Website</label>
                        <input type="text" className="form-input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://example.com" />
                    </div>

                    <div className="group-row" style={{ marginBottom: 'var(--space-4)' }}>
                        <label className="form-label">Tech Stack (comma separated)</label>
                        <input type="text" className="form-input" value={techStack} onChange={e => setTechStack(e.target.value)} placeholder="React, Node.js, Python, MongoDB..." />
                    </div>

                    <div className="group-row" style={{ marginBottom: 'var(--space-4)' }}>
                        <label className="form-label">Bio</label>
                        <textarea className="form-textarea" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." maxLength={150} rows="3"></textarea>
                    </div>

                    <div className="modal-footer" style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
