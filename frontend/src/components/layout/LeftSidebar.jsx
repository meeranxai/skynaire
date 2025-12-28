import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import DarkModeToggle from '../common/DarkModeToggle';
import InstallPWA from '../common/InstallPWA';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../firebase';
import { getMediaUrl } from '../../api/config';

import { useNotifications } from '../../contexts/NotificationContext';

const LeftSidebar = () => {
    const { currentUser } = useAuth();
    const { unreadMessageCount, unreadNotificationCount } = useNotifications();
    const navigate = useNavigate();
    return (
        <aside className="sidebar-left">
            <div className="social-brand">
                <h1>G-Network<span style={{ color: 'var(--primary)' }}>.</span></h1>
            </div>

            <nav className="nav-links">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <i className="fas fa-home"></i> <span>Home</span>
                </NavLink>
                <NavLink to="/explore" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <i className="fas fa-compass"></i> <span>Explore</span>
                </NavLink>
                {/* <NavLink to="/reels" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <i className="fas fa-video"></i> <span>Reels</span>
                </NavLink> */}
                <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <i className="fas fa-bell"></i> <span>Notifications</span>
                    {unreadNotificationCount > 0 && <span className="unread-badge">{unreadNotificationCount}</span>}
                </NavLink>
                <NavLink to="/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <i className="fas fa-envelope"></i> <span>Messages</span>
                    {unreadMessageCount > 0 && <span className="unread-badge" style={{ background: 'var(--primary)', color: 'white' }}>{unreadMessageCount}</span>}
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <i className="fas fa-user"></i> <span>Profile</span>
                </NavLink>
                <NavLink to="/archive" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <i className="fas fa-archive"></i> <span>Archive</span>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <i className="fas fa-cog"></i> <span>Settings</span>
                </NavLink>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-light)' }}>
                <InstallPWA />
                <NavLink to="/design-showcase" className="nav-item" style={{ marginBottom: 'var(--space-3)' }}>
                    <i className="fas fa-palette"></i> <span>Design System</span>
                </NavLink>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Theme</span>
                    <DarkModeToggle />
                </div>
            </div>

            {currentUser && (
                <div className="user-profile-tile glass-panel" style={{
                    padding: '10px 14px',
                    borderRadius: '50px',
                    background: 'var(--surface-glass)',
                    backdropFilter: 'blur(10px)',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: '1px solid var(--border-light)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                }} onClick={() => navigate('/profile')}>
                    <img
                        src={getMediaUrl(currentUser.photoURL) || '/images/default-avatar.png'}
                        alt=""
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {currentUser.displayName || 'G-User'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            View Profile
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            auth.signOut();
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '5px' }}
                        title="Sign Out"
                    >
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            )}

            <NavLink to="/create" className="btn-post-main" style={{ textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-pen-nib"></i> Post
            </NavLink>
        </aside>
    );
};

export default LeftSidebar;
