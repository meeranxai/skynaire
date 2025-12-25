import React, { useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    useEffect(() => {
        document.body.classList.add('social-app');
        return () => {
            document.body.classList.remove('social-app');
        };
    }, []);

    return (
        <React.Fragment>
            <div className="app-layout">
                <LeftSidebar />

                {/* Main Content Area */}
                <Outlet />

                <RightSidebar />
            </div>

            {/* Mobile Nav */}
            <MobileNav />

            {/* Global Toast Container */}
            <div id="toast-container" className="toast-container"></div>
        </React.Fragment>
    );
};

export default Layout;
