import React, { useState, useEffect } from 'react';

const InstallPWA = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const onClick = (evt) => {
        evt.preventDefault();
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
    };

    if (!supportsPWA) {
        return null;
    }

    return (
        <button
            className="sidebar-link"
            onClick={onClick}
            style={{
                background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                color: 'white',
                border: 'none',
                marginTop: 'auto',
                marginBottom: '20px',
                justifyContent: 'center',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)'
            }}
            title="Install App"
        >
            <span className="material-icons">download</span>
            <span>Install App</span>
        </button>
    );
};

export default InstallPWA;
