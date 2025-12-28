import React, { useState, useEffect } from 'react';

/**
 * Dark Mode Toggle Component
 * Toggles between light and dark mode using the design system
 */
const DarkModeToggle = () => {
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem('darkMode') === 'true' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const toggle = () => {
        setDarkMode(!darkMode);
    };

    return (
        <button
            className="btn btn-ghost btn-sm tooltip"
            onClick={toggle}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ position: 'relative' }}
        >
            <i className={`fas fa-${darkMode ? 'sun' : 'moon'}`}></i>
            <span className="tooltip-text">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
    );
};

export default DarkModeToggle;
