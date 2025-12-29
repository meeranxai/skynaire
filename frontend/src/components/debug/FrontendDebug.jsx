import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../api/config';

const FrontendDebug = () => {
    const [debugInfo, setDebugInfo] = useState({});
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkDebugInfo = async () => {
            const info = {
                timestamp: new Date().toISOString(),
                apiBaseUrl: API_BASE_URL,
                environment: import.meta.env?.MODE || 'unknown',
                viteApiUrl: import.meta.env?.VITE_API_URL || 'not set',
                cssVariables: {},
                backendStatus: 'checking'
            };

            // Check CSS variables safely
            try {
                const root = document.documentElement;
                const computedStyle = getComputedStyle(root);
                info.cssVariables = {
                    primary: computedStyle.getPropertyValue('--primary') || 'undefined',
                    textPrimary: computedStyle.getPropertyValue('--text-primary') || 'undefined',
                    backgroundPrimary: computedStyle.getPropertyValue('--background-primary') || 'undefined',
                    primary600: computedStyle.getPropertyValue('--primary-600') || 'undefined',
                    backgroundElevated: computedStyle.getPropertyValue('--background-elevated') || 'undefined'
                };
            } catch (err) {
                info.cssVariables = { error: 'Failed to read CSS variables' };
            }

            // Check backend safely
            try {
                const response = await fetch(`${API_BASE_URL}/health`);
                if (response.ok) {
                    const data = await response.json();
                    info.backendStatus = 'online';
                    info.backendHealth = data;
                } else {
                    info.backendStatus = 'error';
                    info.backendError = `HTTP ${response.status}`;
                }
            } catch (err) {
                info.backendStatus = 'offline';
                info.backendError = err.message;
            }

            setDebugInfo(info);
        };

        checkDebugInfo();

        // Add keyboard shortcut (Ctrl+Shift+D)
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                setIsVisible(prev => !prev);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isVisible]);

    if (!isVisible) {
        return (
            <div 
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: '#000',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    zIndex: 9999
                }}
                onClick={() => setIsVisible(true)}
            >
                Debug (Ctrl+Shift+D)
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '16px',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflow: 'auto',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '14px' }}>Frontend Debug</h3>
                <button 
                    onClick={() => setIsVisible(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    ✕
                </button>
            </div>

            <div style={{ marginBottom: '12px' }}>
                <strong>Environment:</strong>
                <div>Mode: {debugInfo.environment}</div>
                <div>API URL: {debugInfo.apiBaseUrl}</div>
                <div>Vite API URL: {debugInfo.viteApiUrl}</div>
            </div>

            <div style={{ marginBottom: '12px' }}>
                <strong>Backend Status:</strong>
                <div style={{ 
                    color: debugInfo.backendStatus === 'online' ? 'green' : 'red' 
                }}>
                    {debugInfo.backendStatus}
                </div>
                {debugInfo.backendError && (
                    <div style={{ color: 'red' }}>Error: {debugInfo.backendError}</div>
                )}
                {debugInfo.backendHealth && (
                    <div style={{ fontSize: '10px', marginTop: '4px' }}>
                        Services: {JSON.stringify(debugInfo.backendHealth.services || {})}
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '12px' }}>
                <strong>CSS Variables:</strong>
                {Object.entries(debugInfo.cssVariables || {}).map(([key, value]) => (
                    <div key={key} style={{ 
                        color: value && value !== 'undefined' ? 'green' : 'red',
                        fontSize: '10px'
                    }}>
                        --{key}: {value || 'undefined'}
                    </div>
                ))}
            </div>

            <div style={{ fontSize: '10px', color: '#666' }}>
                Last updated: {debugInfo.timestamp}
            </div>
        </div>
    );
};

export default FrontendDebug;