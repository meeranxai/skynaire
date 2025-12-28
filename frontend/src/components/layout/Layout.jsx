import React, { useEffect, useState } from 'react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import { Outlet, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../api/config';
import PostViewer from '../feed/PostViewer';
import GlobalSearch from '../common/GlobalSearch';

const Layout = () => {
    const [serverStatus, setServerStatus] = useState('checking');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const location = useLocation();
    const isChatPage = location.pathname === '/chat' || location.pathname === '/messages';
    const isSettingsPage = location.pathname.includes('/settings');

    useEffect(() => {
        document.body.classList.add('social-app');
        if (isSettingsPage) {
            document.body.classList.add('settings-view');
        } else {
            document.body.classList.remove('settings-view');
        }

        // Check backend connection
        const checkConnection = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/users/check-username/ping-test-123`);
                if (response.ok) {
                    setServerStatus('online');
                } else {
                    console.warn(`Backend Ping failed with status: ${response.status}`);
                    setServerStatus('offline');
                }
            } catch (err) {
                console.error("Backend Connection Failed. Check if server is running on port 5000:", err);
                setServerStatus('offline');
            }
        };

        checkConnection();

        // Add keyboard shortcut for search (Ctrl+K or Cmd+K)
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            // Escape to close
            if (e.key === 'Escape' && isSearchOpen) {
                setIsSearchOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.classList.remove('social-app');
            document.body.classList.remove('settings-view');
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isSettingsPage, isSearchOpen]);

    return (
        <React.Fragment>
            {serverStatus === 'offline' && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'red', color: 'white', padding: '10px', textAlign: 'center', zIndex: 99999 }}>
                    ⚠️ Cannot connect to Backend. API URL: {API_BASE_URL || 'Not Set'}
                </div>
            )}
            <div className={`app-layout ${isChatPage ? 'full-page-chat' : ''} ${isSettingsPage ? 'full-page-settings' : ''}`}>
                {!isChatPage && !isSettingsPage && <LeftSidebar />}

                {/* Main Content Area */}
                <div className="main-content-wrapper" style={{ flex: 1, minWidth: 0, height: isChatPage ? '100vh' : 'auto', maxWidth: isSettingsPage ? '100%' : undefined }}>
                    <Outlet />
                </div>

            </div>

            {/* Mobile Nav */}
            {!isChatPage && !isSettingsPage && <MobileNav />}

            {/* Global Post Viewer Modal */}
            <PostViewer />

            {/* Global Search */}
            <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* Global Toast Container */}
            <div id="toast-container" className="toast-container"></div>
        </React.Fragment>
    );
};

export default Layout;
