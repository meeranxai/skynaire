import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../api/config';

const Settings = () => {
    const { currentUser } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [privacy, setPrivacy] = useState({
        isPrivate: false,
        about: 'everyone',
        lastSeen: 'everyone',
        profilePhoto: 'everyone',
        whoCanMessage: 'everyone',
        hideLikes: false,
        hideViewCounts: false
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUser) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/users/${currentUser.uid}?requesterId=${currentUser.uid}`);
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    if (data.privacy) {
                        setPrivacy(prev => ({ ...prev, ...data.privacy }));
                    }
                }
            } catch (err) {
                console.error("Fetch user error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [currentUser]);

    const handleToggle = (field) => {
        setPrivacy(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSelect = (field, value) => {
        setPrivacy(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    privacy: privacy
                })
            });
            if (res.ok) {
                setSuccessMsg('Settings saved successfully!');
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setErrorMsg('Failed to save settings.');
            }
        } catch (err) {
            setErrorMsg('Network error.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading Settings...</div>;

    return (
        <main className="feed-container" style={{ maxWidth: '800px', padding: '40px 20px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '30px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                <div style={{ marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>Settings</h1>
                    <p style={{ color: 'var(--text-tertiary)', margin: '5px 0 0' }}>Manage your account privacy and experience</p>
                </div>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-lock" style={{ color: 'var(--primary)' }}></i> Privacy
                    </h2>

                    <div className="setting-item-toggle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <div className="toggle-text">
                            <strong style={{ display: 'block', marginBottom: '4px' }}>Private Account</strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Only people you approve can see your posts and stories.</span>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={privacy.isPrivate} onChange={() => handleToggle('isPrivate')} />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div className="toggle-text">
                            <strong>Who can see my bio?</strong>
                        </div>
                        <select value={privacy.about} onChange={(e) => handleSelect('about', e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <option value="everyone">Everyone</option>
                            <option value="contacts">Followers Only</option>
                            <option value="nobody">Nobody</option>
                        </select>
                    </div>

                    <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div className="toggle-text">
                            <strong>Profile Photo Visibility</strong>
                        </div>
                        <select value={privacy.profilePhoto} onChange={(e) => handleSelect('profilePhoto', e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <option value="everyone">Everyone</option>
                            <option value="contacts">Followers Only</option>
                            <option value="nobody">Nobody</option>
                        </select>
                    </div>

                    <div className="setting-item-toggle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <div className="toggle-text">
                            <strong style={{ display: 'block', marginBottom: '4px' }}>Hide Likes</strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Other people won't see the total number of likes on your posts.</span>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={privacy.hideLikes} onChange={() => handleToggle('hideLikes')} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-comment-dots" style={{ color: 'var(--primary)' }}></i> Interaction
                    </h2>

                    <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div className="toggle-text">
                            <strong>Who can message me?</strong>
                        </div>
                        <select value={privacy.whoCanMessage} onChange={(e) => handleSelect('whoCanMessage', e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <option value="everyone">Everyone</option>
                            <option value="followers">Followers Only</option>
                            <option value="nobody">Nobody</option>
                        </select>
                    </div>
                </section>

                {successMsg && <div style={{ background: '#d1fae5', color: '#065f46', padding: '15px', borderRadius: '12px', marginBottom: '20px', fontWeight: 600 }}>{successMsg}</div>}
                {errorMsg && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '15px', borderRadius: '12px', marginBottom: '20px', fontWeight: 600 }}>{errorMsg}</div>}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                    <button className="btn btn-ghost" onClick={() => window.history.back()}>Back</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                <div className="setting-danger-zone" style={{ marginTop: '60px', padding: '20px', background: 'rgba(255, 71, 87, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 71, 87, 0.2)' }}>
                    <button className="btn-logout" style={{ background: '#ff4757', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', width: '100%', fontWeight: 700, cursor: 'pointer', marginBottom: '10px' }} onClick={() => { if (window.confirm('Delete account? This cannot be undone.')) alert('Contact support for deletion.'); }}>Delete Account</button>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#ff4757', textAlign: 'center' }}>Permanently delete your account and all data.</p>
                </div>
            </div>
        </main>
    );
};

export default Settings;
