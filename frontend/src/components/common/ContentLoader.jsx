import React from 'react';

const ContentLoader = ({ 
    loading = false, 
    error = null, 
    empty = false, 
    children,
    emptyMessage = "No content available",
    errorMessage = "Failed to load content"
}) => {
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px',
                background: 'var(--surface-0)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid var(--border-light)',
                    borderTop: '3px solid var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px',
                background: 'var(--surface-0)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    color: 'var(--error)'
                }}>⚠️</div>
                <h3 style={{
                    margin: '0 0 8px 0',
                    color: 'var(--text-primary)',
                    fontSize: '16px'
                }}>
                    {errorMessage}
                </h3>
                <p style={{
                    margin: 0,
                    color: 'var(--text-secondary)',
                    fontSize: '14px'
                }}>
                    {error.message || 'Please try again later'}
                </p>
            </div>
        );
    }

    if (empty) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px',
                background: 'var(--surface-0)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    color: 'var(--text-tertiary)'
                }}>📭</div>
                <h3 style={{
                    margin: '0 0 8px 0',
                    color: 'var(--text-primary)',
                    fontSize: '16px'
                }}>
                    {emptyMessage}
                </h3>
                <p style={{
                    margin: 0,
                    color: 'var(--text-secondary)',
                    fontSize: '14px'
                }}>
                    Content will appear here when available
                </p>
            </div>
        );
    }

    return children;
};

export default ContentLoader;