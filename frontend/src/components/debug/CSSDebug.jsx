import React, { useState, useEffect } from 'react';

const CSSDebug = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [cssInfo, setCssInfo] = useState({});
    const [loadedStyles, setLoadedStyles] = useState([]);

    // Show/hide with Ctrl+Shift+C
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                setIsVisible(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    // Analyze CSS when visible
    useEffect(() => {
        if (isVisible) {
            analyzeCSSState();
        }
    }, [isVisible]);

    const analyzeCSSState = () => {
        const info = {};
        const styles = [];

        // Get all stylesheets
        const stylesheets = Array.from(document.styleSheets);
        
        info.totalStylesheets = stylesheets.length;
        info.environment = import.meta.env.MODE;
        info.isDevelopment = import.meta.env.DEV;
        info.isProduction = import.meta.env.PROD;

        // Analyze each stylesheet
        stylesheets.forEach((sheet, index) => {
            try {
                const href = sheet.href || 'inline';
                const rules = sheet.cssRules ? sheet.cssRules.length : 0;
                
                styles.push({
                    index,
                    href: href.includes('blob:') ? 'Vite HMR' : href,
                    rules,
                    disabled: sheet.disabled,
                    media: sheet.media.mediaText || 'all'
                });
            } catch (error) {
                styles.push({
                    index,
                    href: 'CORS blocked',
                    rules: 'Unknown',
                    disabled: false,
                    error: error.message
                });
            }
        });

        // Check for common CSS issues
        info.issues = [];
        
        // Check if individual CSS files are loaded
        const individualFiles = [
            'style.css', 'social.css', 'components.css', 'pages-enhancement.css',
            'profile.css', 'login.css', 'messenger.css', 'settings-complete.css',
            'settings-enhancements.css', 'PostCard.css', 'PostViewer.css', 
            'PostMenu.css', 'Toast.css', 'call.css', 'whatsapp.css',
            'app-integration.css', 'light-theme-force.css'
        ];
        
        const loadedFiles = individualFiles.filter(file => 
            styles.some(s => s.href.includes(file))
        );
        
        if (loadedFiles.length === individualFiles.length) {
            info.issues.push(`✅ All ${loadedFiles.length} CSS files loaded correctly`);
        } else {
            info.issues.push(`❌ Only ${loadedFiles.length}/${individualFiles.length} CSS files loaded`);
            const missingFiles = individualFiles.filter(file => 
                !styles.some(s => s.href.includes(file))
            );
            info.issues.push(`Missing: ${missingFiles.join(', ')}`);
        }

        // Check for duplicate stylesheets
        const hrefs = styles.map(s => s.href);
        const duplicates = hrefs.filter((href, index) => hrefs.indexOf(href) !== index);
        if (duplicates.length > 0) {
            info.issues.push(`⚠️ Duplicate stylesheets detected: ${duplicates.length}`);
        }

        // Check for disabled stylesheets
        const disabled = styles.filter(s => s.disabled);
        if (disabled.length > 0) {
            info.issues.push(`⚠️ Disabled stylesheets: ${disabled.length}`);
        }

        setCssInfo(info);
        setLoadedStyles(styles);
    };

    const testCSSProperty = (selector, property) => {
        try {
            const element = document.querySelector(selector);
            if (element) {
                const computed = window.getComputedStyle(element);
                return computed.getPropertyValue(property) || 'Not set';
            }
            return 'Element not found';
        } catch (error) {
            return `Error: ${error.message}`;
        }
    };

    const commonTests = [
        { selector: 'body', property: 'background-color', label: 'Body Background' },
        { selector: '.container', property: 'max-width', label: 'Container Width' },
        { selector: 'button', property: 'border-radius', label: 'Button Radius' },
        { selector: '.post-card', property: 'box-shadow', label: 'Post Card Shadow' },
        { selector: '.navbar', property: 'background', label: 'Navbar Background' }
    ];

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '50px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.95)',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 10002,
            minWidth: '400px',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
            <div style={{ 
                marginBottom: '15px', 
                fontWeight: 'bold', 
                borderBottom: '1px solid #333', 
                paddingBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>🎨 CSS Debug Panel</span>
                <button 
                    onClick={analyzeCSSState}
                    style={{
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px'
                    }}
                >
                    Refresh
                </button>
            </div>
            
            {/* Environment Info */}
            <div style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Environment:</div>
                <div style={{ color: cssInfo.isDevelopment ? '#4CAF50' : '#FF9800' }}>
                    {cssInfo.environment} ({cssInfo.isDevelopment ? 'Development' : 'Production'})
                </div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>
                    Total Stylesheets: {cssInfo.totalStylesheets}
                </div>
            </div>

            {/* Issues */}
            {cssInfo.issues && cssInfo.issues.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Status:</div>
                    {cssInfo.issues.map((issue, index) => (
                        <div key={index} style={{ 
                            marginBottom: '3px', 
                            fontSize: '11px',
                            color: issue.startsWith('✅') ? '#4CAF50' : 
                                   issue.startsWith('⚠️') ? '#FF9800' : '#F44336'
                        }}>
                            {issue}
                        </div>
                    ))}
                </div>
            )}

            {/* Loaded Stylesheets */}
            <div style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Loaded Stylesheets:</div>
                <div style={{ 
                    background: '#111', 
                    padding: '10px', 
                    borderRadius: '4px',
                    maxHeight: '150px',
                    overflow: 'auto'
                }}>
                    {loadedStyles.map((style, index) => (
                        <div key={index} style={{ 
                            marginBottom: '5px',
                            fontSize: '10px',
                            color: style.disabled ? '#666' : '#fff'
                        }}>
                            <div style={{ color: '#4CAF50' }}>
                                [{index}] {style.href.split('/').pop() || 'inline'}
                            </div>
                            <div style={{ color: '#ccc', marginLeft: '10px' }}>
                                Rules: {style.rules} | Media: {style.media}
                                {style.disabled && ' | DISABLED'}
                                {style.error && ` | ERROR: ${style.error}`}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CSS Property Tests */}
            <div style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>CSS Property Tests:</div>
                <div style={{ 
                    background: '#111', 
                    padding: '10px', 
                    borderRadius: '4px'
                }}>
                    {commonTests.map((test, index) => (
                        <div key={index} style={{ 
                            marginBottom: '5px',
                            fontSize: '10px'
                        }}>
                            <span style={{ color: '#4CAF50' }}>{test.label}:</span>
                            <span style={{ color: '#ccc', marginLeft: '5px' }}>
                                {testCSSProperty(test.selector, test.property)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ fontSize: '10px', color: '#888', textAlign: 'center' }}>
                Press Ctrl+Shift+C to toggle
            </div>
        </div>
    );
};

export default CSSDebug;