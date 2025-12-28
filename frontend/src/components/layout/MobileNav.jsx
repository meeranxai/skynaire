import React from 'react';
import { NavLink } from 'react-router-dom';

const MobileNav = () => {
    return (
        <nav className="bottom-nav">
            <NavLink
                to="/"
                className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                aria-label="Home"
            >
                <i className="fas fa-home"></i>
            </NavLink>

            <NavLink
                to="/explore"
                className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                aria-label="Explore"
            >
                <i className="fas fa-search"></i>
            </NavLink>

            <NavLink to="/create" className="bottom-nav-item highlight" style={{
                background: 'var(--primary-600)',
                color: 'white',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(124, 58, 237, 0.4)',
                transform: 'translateY(-10px)'
            }} aria-label="Create Post">
                <i className="fas fa-plus"></i>
            </NavLink>

            {/* <NavLink
                to="/reels"
                className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                aria-label="Reels"
            >
                <i className="fas fa-film"></i>
            </NavLink> */}

            <NavLink
                to="/messages"
                className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                aria-label="Messages"
            >
                <i className="fas fa-envelope"></i>
            </NavLink>

            <NavLink
                to="/profile"
                className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                aria-label="Profile"
            >
                <i className="fas fa-user"></i>
            </NavLink>
        </nav>
    );
};

export default MobileNav;
