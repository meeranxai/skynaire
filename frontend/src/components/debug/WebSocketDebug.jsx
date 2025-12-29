import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { SOCKET_URL } from '../../api/config';

const WebSocketDebug = () => {
    const { socket, isConnected, connectionStatus } = useSocket();
    const [isVisible, setIsVisible] = useState(false);
    const [connectionLogs, setConnectionLogs] = useState([]);
    const [testResults, setTestResults] = useState({});

    // Show/hide with Ctrl+Shift+W
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'W') {
                setIsVisible(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    // Log connection events
    useEffect(() => {
        const addLog = (message, type = 'info') => {
            const timestamp = new Date().toLocaleTimeString();
            setConnectionLogs(prev => [...prev.slice(-9), { timestamp, message, type }]);
        };

        if (socket) {
            socket.on('connect', () => addLog('✅ Connected', 'success'));
            socket.on('disconnect', (reason) => addLog(`❌ Disconnected: ${reason}`, 'error'));
            socket.on('connect_error', (error) => addLog(`🚫 Connection Error: ${error.message}`, 'error'));
            socket.on('reconnect', (attempt) => addLog(`🔄 Reconnected (attempt ${attempt})`, 'success'));
            socket.on('reconnect_attempt', (attempt) => addLog(`🔄 Reconnecting... (${attempt})`, 'warning'));
            socket.on('reconnect_failed', () => addLog('❌ Reconnection failed', 'error'));
        }
    }, [socket]);

    // Test connection function
    const testConnection = async () => {
        const results = {};
        
        try {
            // Test 1: Basic HTTP connectivity
            const response = await fetch(`${SOCKET_URL}/health`);
            results.httpHealth = response.ok ? '✅ OK' : '❌ Failed';
        } catch (error) {
            results.httpHealth = `❌ Error: ${error.message}`;
        }

        try {
            // Test 2: Socket.IO endpoint
            const response = await fetch(`${SOCKET_URL}/socket.io/?EIO=4&transport=polling`);
            results.socketEndpoint = response.ok ? '✅ OK' : '❌ Failed';
        } catch (error) {
            results.socketEndpoint = `❌ Error: ${error.message}`;
        }

        // Test 3: WebSocket support
        results.webSocketSupport = typeof WebSocket !== 'undefined' ? '✅ Supported' : '❌ Not supported';

        // Test 4: Current connection status
        results.currentConnection = isConnected ? '✅ Connected' : '❌ Disconnected';

        setTestResults(results);
    };

    if (!isVisible) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'connected': return '#4CAF50';
            case 'connecting': return '#FF9800';
            case 'reconnecting': return '#2196F3';
            case 'error': return '#F44336';
            case 'failed': return '#F44336';
            default: return '#757575';
        }
    };

    const getLogColor = (type) => {
        switch (type) {
            case 'success': return '#4CAF50';
            case 'error': return '#F44336';
            case 'warning': return '#FF9800';
            default: return '#fff';
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.95)',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 10001,
            minWidth: '350px',
            maxWidth: '500px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            maxHeight: '80vh',
            overflow: 'auto'
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
                <span>🔌 WebSocket Debug</span>
                <button 
                    onClick={testConnection}
                    style={{
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px'
                    }}
                >
                    Test Connection
                </button>
            </div>
            
            {/* Connection Status */}
            <div style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Connection Status:</div>
                <div style={{ color: getStatusColor(connectionStatus) }}>
                    ● {connectionStatus.toUpperCase()}
                </div>
                <div style={{ marginTop: '5px', fontSize: '10px', color: '#ccc' }}>
                    Socket URL: {SOCKET_URL}
                </div>
                {socket && (
                    <div style={{ fontSize: '10px', color: '#ccc' }}>
                        Socket ID: {socket.id || 'Not assigned'}
                    </div>
                )}
            </div>

            {/* Test Results */}
            {Object.keys(testResults).length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Connection Tests:</div>
                    {Object.entries(testResults).map(([test, result]) => (
                        <div key={test} style={{ marginBottom: '3px', fontSize: '11px' }}>
                            <span style={{ color: '#ccc' }}>{test}:</span> {result}
                        </div>
                    ))}
                </div>
            )}

            {/* Connection Logs */}
            <div style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Recent Events:</div>
                <div style={{ 
                    background: '#111', 
                    padding: '10px', 
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflow: 'auto'
                }}>
                    {connectionLogs.length === 0 ? (
                        <div style={{ color: '#666' }}>No events yet...</div>
                    ) : (
                        connectionLogs.map((log, index) => (
                            <div key={index} style={{ 
                                marginBottom: '3px',
                                color: getLogColor(log.type),
                                fontSize: '10px'
                            }}>
                                <span style={{ color: '#666' }}>[{log.timestamp}]</span> {log.message}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Troubleshooting Tips */}
            <div style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Troubleshooting:</div>
                <div style={{ fontSize: '10px', color: '#ccc', lineHeight: '1.4' }}>
                    • Check if backend is running<br/>
                    • Verify CORS configuration<br/>
                    • Try refreshing the page<br/>
                    • Check browser console for errors<br/>
                    • Ensure firewall allows WebSocket connections
                </div>
            </div>

            <div style={{ fontSize: '10px', color: '#888', textAlign: 'center' }}>
                Press Ctrl+Shift+W to toggle
            </div>
        </div>
    );
};

export default WebSocketDebug;