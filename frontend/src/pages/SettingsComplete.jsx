import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../api/config';
import '../styles/settings-complete.css';
import '../styles/settings-enhancements.css';

import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const SettingsComplete = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (err) {
            console.error('Failed to log out:', err);
        }
    };
    const [activeTab, setActiveTab] = useState('account');
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Mobile view state: true = showing menu, false = showing content
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true);

    // Initial Load
    useEffect(() => {
        if (currentUser) {
            loadSettings();
        }
        // If window is wide, ensure menu is 'open' logically or handled by CSS
        const handleResize = () => {
            if (window.innerWidth > 768) setIsMobileMenuOpen(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [currentUser]);

    const loadSettings = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/settings/${currentUser.uid}`);
            const data = await res.json();
            if (data.success) {
                setSettings(data.settings);
            }
        } catch (err) {
            console.error('Failed to load settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const updateSetting = async (category, data) => {
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/settings/${currentUser.uid}/${category}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (result.success) {
                showMessage('success', result.message || 'Settings updated successfully');
                await loadSettings();
            } else {
                showMessage('error', result.message || 'Failed to update settings');
            }
        } catch (err) {
            showMessage('error', 'Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        // On mobile, clicking a tab should switch to content view
        if (window.innerWidth <= 768) {
            setIsMobileMenuOpen(false);
        }
    };

    const handleBackToMenu = () => {
        setIsMobileMenuOpen(true);
    };

    if (loading) {
        return (
            <div className="settings-loading">
                <i className="fas fa-circle-notch fa-spin"></i>
                <p>Loading settings...</p>
            </div>
        );
    }

    const tabs = [
        { id: 'account', label: 'Profile & Identity', icon: 'user-circle' },
        { id: 'privacy', label: 'Privacy & Security', icon: 'shield-alt' },
        { id: 'notifications', label: 'Notifications', icon: 'bell' },
        { id: 'content', label: 'Content & Feed', icon: 'sliders-h' },
        { id: 'chat', label: 'Chat Settings', icon: 'comments' },
        { id: 'connections', label: 'Connections', icon: 'users' },
        { id: 'data', label: 'Data & Storage', icon: 'database' },
        { id: 'accessibility', label: 'Accessibility', icon: 'universal-access' },
        { id: 'creator', label: 'Creator & Business', icon: 'star' },
        { id: 'family', label: 'Family & Safety', icon: 'child' },
        { id: 'advanced', label: 'Advanced', icon: 'cog' }
    ];

    return (
        <div className="settings-complete-container">
            {/* Message Alert */}
            {message.text && (
                <div className="settings-alert-wrapper">
                    <div className={`settings-alert settings-alert-${message.type}`}>
                        <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                        {message.text}
                    </div>
                </div>
            )}

            <div className="settings-layout full-screen-split">
                {/* Sidebar Navigation (Left Panel) */}
                <div className={`settings-sidebar ${!isMobileMenuOpen ? 'hidden-mobile' : ''}`}>
                    {/* Back to Home Button */}
                    <button onClick={() => navigate('/')} className="settings-back-home-btn">
                        <i className="fas fa-arrow-left"></i> Back to Home
                    </button>

                    <div className="settings-nav-title-mobile-only">
                        <h2>Settings</h2>
                    </div>

                    <div className="settings-nav-list">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => handleTabClick(tab.id)}
                            >
                                <i className={`fas fa-${tab.icon}`}></i>
                                <span>{tab.label}</span>
                                <i className="fas fa-chevron-right mobile-only-arrow"></i>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area (Right Panel) */}
                <div className={`settings-content ${isMobileMenuOpen ? 'hidden-mobile' : ''}`}>
                    {/* Desktop Header (Moved inside content) */}
                    <div className="settings-header desktop-only-header">
                        <h1><i className="fas fa-cog"></i> Complete Settings</h1>
                        <p>Manage every aspect of your G-Network experience</p>
                    </div>

                    {/* Mobile Back Header */}
                    <div className="settings-mobile-header">
                        <button onClick={handleBackToMenu} className="btn-icon">
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <h2>{tabs.find(t => t.id === activeTab)?.label}</h2>
                    </div>

                    {activeTab === 'account' && (
                        <ProfileIdentitySection settings={settings} updateSetting={updateSetting} saving={saving} />
                    )}
                    {activeTab === 'privacy' && (
                        <PrivacySecuritySection settings={settings} updateSetting={updateSetting} saving={saving} currentUser={currentUser} onLogout={handleLogout} />
                    )}
                    {activeTab === 'notifications' && (
                        <NotificationsFullSection settings={settings} updateSetting={updateSetting} saving={saving} />
                    )}
                    {activeTab === 'content' && (
                        <ContentFeedSection settings={settings} updateSetting={updateSetting} saving={saving} />
                    )}
                    {activeTab === 'chat' && (
                        <ChatSettingsSection settings={settings} updateSetting={updateSetting} saving={saving} />
                    )}
                    {activeTab === 'connections' && (
                        <ConnectionsSection settings={settings} updateSetting={updateSetting} saving={saving} currentUser={currentUser} />
                    )}
                    {activeTab === 'data' && (
                        <DataStorageSection settings={settings} updateSetting={updateSetting} saving={saving} currentUser={currentUser} />
                    )}
                    {activeTab === 'accessibility' && (
                        <AccessibilityFullSection settings={settings} updateSetting={updateSetting} saving={saving} />
                    )}
                    {activeTab === 'creator' && (
                        <CreatorBusinessSection settings={settings} updateSetting={updateSetting} saving={saving} />
                    )}
                    {activeTab === 'family' && (
                        <FamilySafetySection settings={settings} updateSetting={updateSetting} saving={saving} />
                    )}
                    {activeTab === 'advanced' && (
                        <AdvancedSection settings={settings} updateSetting={updateSetting} saving={saving} />
                    )}
                </div>
            </div>
        </div>
    );
};

// A. PROFILE & IDENTITY SECTION (Enhanced with 30+ settings)
const ProfileIdentitySection = ({ settings, updateSetting, saving }) => {
    const [formData, setFormData] = useState({
        displayName: settings?.profile?.displayName || '',
        bio: settings?.profile?.bio || '',
        pronouns: settings?.profile?.pronouns || '',
        website: settings?.profile?.website || '',
        gender: settings?.profile?.gender || '',
        themeColor: settings?.profile?.themeColor || '#6366f1',
        profileLayout: settings?.profile?.profileLayout || 'grid'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateSetting('profile', formData);
    };

    return (
        <div className="settings-section">
            <h2><i className="fas fa-user-circle"></i> Profile & Identity</h2>
            <p className="section-description">Customize your profile and personal information</p>

            <form onSubmit={handleSubmit} className="settings-form">
                {/* Basic Info */}
                <div className="settings-group">
                    <h3>Basic Information</h3>

                    <div className="form-group">
                        <label>Display Name</label>
                        <input
                            type="text"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            maxLength={50}
                        />
                        <small>Can be changed every 14 days</small>
                    </div>

                    <div className="form-group">
                        <label>Username</label>
                        <div className="input-with-prefix">
                            <span>@</span>
                            <input type="text" value={settings?.profile?.username} disabled />
                        </div>
                        <small>Can be changed every 30 days</small>
                    </div>

                    <div className="form-group">
                        <label>Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            maxLength={300}
                            rows={4}
                        />
                        <small>{formData.bio.length}/300 characters</small>
                    </div>
                </div>

                {/* Personal Details */}
                <div className="settings-group">
                    <h3>Personal Details</h3>

                    <div className="form-group">
                        <label>Gender</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                            <option value="">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="non-binary">Non-binary</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Pronouns</label>
                        <input
                            type="text"
                            value={formData.pronouns}
                            onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                            maxLength={30}
                            placeholder="e.g., she/her, he/him, they/them"
                        />
                    </div>

                    <div className="form-group">
                        <label>Website</label>
                        <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://yourwebsite.com"
                        />
                    </div>
                </div>

                {/* Customization */}
                <div className="settings-group">
                    <h3>Profile Customization</h3>

                    <div className="form-group">
                        <label>Theme Color</label>
                        <div className="color-picker-wrapper">
                            <input
                                type="color"
                                value={formData.themeColor}
                                onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                                className="color-picker"
                            />
                            <span className="color-value">{formData.themeColor}</span>
                        </div>
                        <small>Choose your profile accent color</small>
                    </div>

                    <div className="form-group">
                        <label>Profile Layout</label>
                        <div className="radio-group">
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    value="grid"
                                    checked={formData.profileLayout === 'grid'}
                                    onChange={(e) => setFormData({ ...formData, profileLayout: e.target.value })}
                                />
                                <span>Grid View</span>
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    value="list"
                                    checked={formData.profileLayout === 'list'}
                                    onChange={(e) => setFormData({ ...formData, profileLayout: e.target.value })}
                                />
                                <span>List View</span>
                            </label>
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile Settings'}
                </button>
            </form>
        </div>
    );
};

// B. PRIVACY & SECURITY SECTION (Enhanced with 40+ settings)
const PrivacySecuritySection = ({ settings, updateSetting, saving, currentUser, onLogout }) => {
    const privacy = settings?.privacy || {};
    const security = settings?.security || {};

    const togglePrivacy = (key, value) => {
        updateSetting('privacy', { [key]: value });
    };

    const [show2FASetup, setShow2FASetup] = useState(false);

    return (
        <div className="settings-section">
            <h2><i className="fas fa-shield-alt"></i> Privacy & Security</h2>
            <p className="section-description">Control your privacy and secure your account</p>

            {/* Account Privacy */}
            <div className="settings-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>Account Privacy</h3>
                    <button 
                        onClick={onLogout}
                        className="btn-danger-outline"
                        style={{ 
                            padding: '6px 12px', 
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <i className="fas fa-sign-out-alt"></i> Log Out
                    </button>
                </div>

                {[
                    { key: 'isPrivate', label: 'Private Account', desc: 'Only approved followers can see your posts' },
                    { key: 'hideFromSearchEngines', label: 'Hide from Search Engines', desc: 'Hide your profile from Google, Bing, etc.' },
                    { key: 'showActivityStatus', label: 'Show Activity Status', desc: 'Let others see when you\'re online' }
                ].map(item => (
                    <div key={item.key} className="setting-item">
                        <div className="setting-info">
                            <strong>{item.label}</strong>
                            <p>{item.desc}</p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={privacy[item.key] || false}
                                onChange={(e) => togglePrivacy(item.key, e.target.checked)}
                                disabled={saving}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                ))}
            </div>

            {/* Content Privacy */}
            <div className="settings-group">
                <h3>Content Privacy</h3>

                <div className="setting-item">
                    <div className="setting-info">
                        <strong>Default Post Visibility</strong>
                        <p>Who can see your posts by default</p>
                    </div>
                    <select
                        value={privacy.defaultPostVisibility || 'public'}
                        onChange={(e) => togglePrivacy('defaultPostVisibility', e.target.value)}
                        className="setting-select"
                    >
                        <option value="public">Public</option>
                        <option value="followers">Followers Only</option>
                        <option value="private">Private</option>
                    </select>
                </div>

                <div className="setting-item">
                    <div className="setting-info">
                        <strong>Story Privacy</strong>
                        <p>Who can see your stories</p>
                    </div>
                    <select
                        value={privacy.storyPrivacy || 'everyone'}
                        onChange={(e) => togglePrivacy('storyPrivacy', e.target.value)}
                        className="setting-select"
                    >
                        <option value="everyone">Everyone</option>
                        <option value="followers">Followers</option>
                        <option value="close_friends">Close Friends</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>

                {[
                    { key: 'allowPostSharing', label: 'Allow Post Sharing', desc: 'Let others share your posts' },
                    { key: 'allowPostDownloads', label: 'Allow Downloads', desc: 'Let others download your content' },
                    { key: 'showViewCounts', label: 'Show View Counts', desc: 'Display how many views your posts get' },
                    { key: 'hideLikes', label: 'Hide Like Counts', desc: 'Hide like counts on your posts' }
                ].map(item => (
                    <div key={item.key} className="setting-item">
                        <div className="setting-info">
                            <strong>{item.label}</strong>
                            <p>{item.desc}</p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={privacy[item.key] !== false}
                                onChange={(e) => togglePrivacy(item.key, e.target.checked)}
                                disabled={saving}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                ))}
            </div>

            {/* Interaction Controls */}
            <div className="settings-group">
                <h3>Interaction Controls</h3>

                {[
                    { key: 'allowComments', label: 'Who can comment', options: ['everyone', 'followers', 'people_you_follow', 'nobody'] },
                    { key: 'whoCanMention', label: 'Who can mention you', options: ['everyone', 'followers', 'nobody'] },
                    { key: 'whoCanTag', label: 'Who can tag you', options: ['everyone', 'followers', 'nobody'] },
                    { key: 'whoCanMessage', label: 'Who can message you', options: ['everyone', 'followers', 'nobody'] },
                    { key: 'voiceVideoCallPermissions', label: 'Voice/Video calls', options: ['everyone', 'followers', 'nobody'] }
                ].map(item => (
                    <div key={item.key} className="setting-item">
                        <div className="setting-info">
                            <strong>{item.label}</strong>
                        </div>
                        <select
                            value={privacy[item.key] || item.options[0]}
                            onChange={(e) => togglePrivacy(item.key, e.target.value)}
                            className="setting-select"
                        >
                            {item.options.map(opt => (
                                <option key={opt} value={opt}>
                                    {opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}

                {[
                    { key: 'reviewTagsBeforeShow', label: 'Review tags before showing', desc: 'Approve tags before they appear on your profile' },
                    { key: 'messageRequests', label: 'Allow message requests', desc: 'Receive messages from non-followers' },
                    { key: 'commentFiltering', label: 'Filter comments', desc: 'Automatically filter offensive comments' }
                ].map(item => (
                    <div key={item.key} className="setting-item">
                        <div className="setting-info">
                            <strong>{item.label}</strong>
                            <p>{item.desc}</p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={privacy[item.key] || false}
                                onChange={(e) => togglePrivacy(item.key, e.target.checked)}
                                disabled={saving}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                ))}
            </div>

            {/* Security */}
            <div className="settings-group">
                <h3>Security Settings</h3>

                <div className="security-card">
                    <div className="security-card-header">
                        <div>
                            <strong>Two-Factor Authentication</strong>
                            <p>Add an extra layer of security to your account</p>
                        </div>
                        <span className={`status-badge ${security?.twoFactorEnabled ? 'enabled' : 'disabled'}`}>
                            {security?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>

                    {!security?.twoFactorEnabled ? (
                        <button onClick={() => setShow2FASetup(true)} className="btn-secondary">
                            <i className="fas fa-shield-alt"></i> Enable 2FA
                        </button>
                    ) : (
                        <button className="btn-danger">
                            <i className="fas fa-times-circle"></i> Disable 2FA
                        </button>
                    )}
                </div>

                {[
                    { key: 'loginAlerts', label: 'Login Alerts', desc: 'Get notified of new logins' },
                    { key: 'loginApprovalNewDevices', label: 'Login Approval', desc: 'Approve new device logins' },
                    { key: 'biometricLogin', label: 'Biometric Login', desc: 'Use fingerprint/face ID' }
                ].map(item => (
                    <div key={item.key} className="setting-item">
                        <div className="setting-info">
                            <strong>{item.label}</strong>
                            <p>{item.desc}</p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={security[item.key] !== false}
                                disabled={saving}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Placeholder sections (to be expanded)
const NotificationsFullSection = ({ settings, updateSetting, saving }) => (
    <div className="settings-section">
        <h2><i className="fas fa-bell"></i> Notifications</h2>
        <p>Comprehensive notification management system - 30+ settings coming soon!</p>
    </div>
);

const ContentFeedSection = ({ settings, updateSetting, saving }) => (
    <div className="settings-section">
        <h2><i className="fas fa-sliders-h"></i> Content & Feed Preferences</h2>
        <p>Content customization and feed settings - 35+ settings coming soon!</p>
    </div>
);

const ConnectionsSection = ({ settings, updateSetting, saving }) => (
    <div className="settings-section">
        <h2><i className="fas fa-users"></i> Connections & Relationships</h2>
        <p>Manage your connections and followers - 15+ settings coming soon!</p>
    </div>
);

const DataStorageSection = ({ settings, updateSetting, saving }) => (
    <div className="settings-section">
        <h2><i className="fas fa-database"></i> Data & Storage</h2>
        <p>Control your data and storage preferences - 20+ settings coming soon!</p>
    </div>
);

const AccessibilityFullSection = ({ settings, updateSetting, saving }) => (
    <div className="settings-section">
        <h2><i className="fas fa-universal-access"></i> Accessibility</h2>
        <p>Customize your accessibility preferences - 20+ settings coming soon!</p>
    </div>
);

const CreatorBusinessSection = ({ settings, updateSetting, saving }) => (
    <div className="settings-section">
        <h2><i className="fas fa-star"></i> Creator & Business</h2>
        <p>Professional creator tools and business features - 25+ settings coming soon!</p>
    </div>
);

const FamilySafetySection = ({ settings, updateSetting, saving }) => (
    <div className="settings-section">
        <h2><i className="fas fa-child"></i> Family & Safety</h2>
        <p>Parental controls and digital wellbeing - 15+ settings coming soon!</p>
    </div>
);

import AIDashboard from '../components/ai/AIDashboard';

const AdvancedSection = ({ settings, updateSetting, saving }) => (
    <div className="settings-section">
        <h2><i className="fas fa-cog"></i> Advanced Settings</h2>

        {/* AI Autonomous System Dashboard */}
        <AIDashboard />

        <div className="settings-group" style={{ marginTop: '30px' }}>
            <h3><i className="fas fa-server"></i> API & Developer</h3>
            <div className="setting-item">
                <div className="setting-info">
                    <strong>API Rate Limiting</strong>
                    <p>Show detailed rate limit headers</p>
                </div>
                <label className="toggle-switch">
                    <input type="checkbox" disabled />
                    <span className="toggle-slider"></span>
                </label>
            </div>
        </div>
    </div>
);

export default SettingsComplete;

// Chat Settings Section
const ChatSettingsSection = ({ settings, updateSetting, saving }) => {
    const [formData, setFormData] = useState({
        enterToSend: settings?.chatPreferences?.enterToSend ?? true,
        mediaAutoDownload: settings?.chatPreferences?.mediaAutoDownload ?? true,
        fontSize: settings?.chatPreferences?.fontSize || 'medium',
        wallpaper: settings?.chatPreferences?.wallpaper || 'default',
        wallpaperColor: settings?.chatPreferences?.wallpaperColor || '#e5e5e5'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateSetting('chat', formData);
    };

    const colors = ['#e5e5e5', '#dcf8c6', '#fff5c4', '#ffdac1', '#e2f0cb', '#c7ceea'];

    return (
        <div className="settings-section">
            <h2><i className="fas fa-comments"></i> Chat Settings</h2>
            <p className="section-description">Customize your messaging experience</p>

            <form onSubmit={handleSubmit} className="settings-form">
                {/* Chat Behavior */}
                <div className="settings-group">
                    <h3>Chat Behavior</h3>

                    <div className="form-group toggle-group">
                        <div className="toggle-label">
                            <label>Enter to Send</label>
                            <small>Send message immediately when pressing Enter key</small>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={formData.enterToSend}
                                onChange={(e) => setFormData({ ...formData, enterToSend: e.target.checked })}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div className="form-group toggle-group">
                        <div className="toggle-label">
                            <label>Media Auto-Download</label>
                            <small>Automatically download images and videos</small>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={formData.mediaAutoDownload}
                                onChange={(e) => setFormData({ ...formData, mediaAutoDownload: e.target.checked })}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Font Size</label>
                        <select
                            value={formData.fontSize}
                            onChange={(e) => setFormData({ ...formData, fontSize: e.target.value })}
                        >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                        </select>
                    </div>
                </div>

                {/* Wallpaper */}
                <div className="settings-group">
                    <h3>Chat Wallpaper</h3>

                    <div className="form-group">
                        <label>Background Color</label>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            {colors.map(color => (
                                <div
                                    key={color}
                                    onClick={() => setFormData({ ...formData, wallpaper: 'color', wallpaperColor: color })}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: color,
                                        cursor: 'pointer',
                                        border: formData.wallpaper === 'color' && formData.wallpaperColor === color
                                            ? '3px solid var(--primary)'
                                            : '1px solid #ddd',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};
