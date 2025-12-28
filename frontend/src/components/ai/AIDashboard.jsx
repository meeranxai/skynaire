import React, { useState, useEffect } from 'react';
import { useAutonomousTheme } from '../../contexts/AutonomousThemeContext';
import { API_BASE_URL } from '../../api/config';
import '../../styles/settings-enhancements.css';

const AIDashboard = () => {
    const { isOptimizing, triggerManualOptimization } = useAutonomousTheme();
    const [status, setStatus] = useState(null);
    const [insights, setInsights] = useState(null);
    const [changes, setChanges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/autonomous/dashboard`);
            const data = await res.json();
            if (data.success) {
                setStatus(data.dashboard.system);
                setInsights(data.dashboard.insights);
                setChanges(data.dashboard.recentChanges);
            }
        } catch (err) {
            console.error('Failed to load AI dashboard', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4">Loading AI Intelligence...</div>;

    return (
        <div className="settings-section">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2><i className="fas fa-brain text-purple-600"></i> Local Gravity AI (Autonomous)</h2>
                    <p className="section-description">Monitor and control the self-designing AI system</p>
                </div>
                <button
                    onClick={triggerManualOptimization}
                    disabled={isOptimizing}
                    className="btn-primary"
                    style={{ background: 'var(--primary)', color: 'white', padding: '8px 16px', borderRadius: '8px' }}
                >
                    {isOptimizing ? <><i className="fas fa-spin fa-sync"></i> Optimizing...</> : <><i className="fas fa-magic"></i> Trigger Optimization</>}
                </button>
            </div>

            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="info-box success" style={{ margin: 0 }}>
                    <div className="text-sm font-semibold text-gray-500">System Status</div>
                    <div className="text-2xl font-bold capitalize">{status?.systemHealth || 'Unknown'}</div>
                    <div className="text-xs mt-1">
                        Autonomy: <span className="font-semibold">{status?.autonomyLevel}</span>
                    </div>
                </div>
                <div className="info-box" style={{ margin: 0, borderLeft: '4px solid #8b5cf6' }}>
                    <div className="text-sm font-semibold text-gray-500">Predictive Engine</div>
                    <div className="text-2xl font-bold">{status?.predictive?.learnedPatterns || 0}</div>
                    <div className="text-xs mt-1">Patterns Learned</div>
                </div>
                <div className="info-box" style={{ margin: 0, borderLeft: '4px solid #ec4899' }}>
                    <div className="text-sm font-semibold text-gray-500">Platform Mood</div>
                    <div className="text-2xl font-bold capitalize">{status?.consciousness?.mood?.label || 'Calm'}</div>
                    <div className="text-xs mt-1">Energy: {status?.consciousness?.mood?.energyLevel || 0}</div>
                </div>
                <div className="info-box warning" style={{ margin: 0 }}>
                    <div className="text-sm font-semibold text-gray-500">Network Synapses</div>
                    <div className="text-2xl font-bold">{status?.neural?.connectionCount || 0}</div>
                    <div className="text-xs mt-1">Neuroplastic Connection</div>
                </div>
            </div>

            {/* V3.0 Consciousness Matrix */}
            <div className="settings-group" style={{ background: 'linear-gradient(135deg, #1e1e2f 0%, #2d2b42 100%)', color: 'white', border: 'none' }}>
                <h3><i className="fas fa-network-wired text-cyan-400"></i> Neural Consciousness Matrix</h3>
                <div className="mb-4">
                    <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Current Thought Stream</div>
                    <div className="text-lg font-light italic text-cyan-200">"{status?.consciousness?.thought || 'Initializing neural pathways...'}"</div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <div className="text-xs text-gray-300">Analytical Cortex</div>
                        <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min((status?.neural?.activeRegions?.analytical?.activity || 0) * 10, 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <div className="text-xs text-gray-300">Emotional Limbic</div>
                        <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${Math.min((status?.neural?.activeRegions?.emotional?.activity || 0) * 10, 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <div className="text-xs text-gray-300">Creative Visual</div>
                        <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${Math.min((status?.neural?.activeRegions?.creative?.activity || 0) * 10, 100)}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Insights */}
            <div className="settings-group">
                <h3><i className="fas fa-chart-line"></i> Real-Time Insights</h3>
                <div className="list-group">
                    <div className="list-item">
                        <span>Current Sentiment</span>
                        <span className={`status-badge ${insights?.engagement?.sentiment === 'positive' ? 'success' : 'warning'}`}>
                            {insights?.engagement?.sentiment || 'Neutral'}
                        </span>
                    </div>
                    <div className="list-item">
                        <span>Avg Load Time</span>
                        <span className="font-mono">
                            {Math.round(insights?.performance?.avgLoadTime || 0)}ms
                        </span>
                    </div>
                    <div className="list-item">
                        <span>Friction Points Detected</span>
                        <span className="font-bold">{insights?.issues?.frictionPoints?.length || 0}</span>
                    </div>
                </div>
            </div>

            {/* Recent Changes Log */}
            <div className="settings-group">
                <h3><i className="fas fa-history"></i> Autonomous Design Changes</h3>
                {changes && changes.length > 0 ? (
                    <div className="space-y-3">
                        {changes.map((change) => (
                            <div key={change.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                <div className="flex justify-between w-full mb-2">
                                    <span className="text-xs text-gray-500">
                                        {new Date(change.timestamp).toLocaleTimeString()}
                                    </span>
                                    <span className="status-badge success">Applied</span>
                                </div>
                                <div className="text-sm">
                                    <strong>AI Recommendation:</strong>
                                    <ul className="pl-4 mt-1" style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                                        {change.recommendations?.changes?.map((c, i) => (
                                            <li key={i}>{c.recommendation}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <i className="fas fa-robot"></i>
                        <h4>No Autonomous Changes Yet</h4>
                        <p>The AI is observing user behavior. Changes will appear here once optimization cycles run.</p>
                    </div>
                )}
            </div>

            {/* Generative Feature Proposals */}
            <div className="settings-group">
                <h3><i className="fas fa-lightbulb text-yellow-500"></i> Generative Proposals (Beta)</h3>
                <div className="grid gap-3">
                    <div className="info-box" style={{ background: 'var(--surface-50)', border: '1px dashed var(--border-color)' }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold flex items-center gap-2">
                                    <span className="badge badge-purple" style={{ background: '#8b5cf6', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>AI CONCEPT</span>
                                    Serendipity Engine
                                </h4>
                                <p className="text-sm mt-1 text-gray-600">Connects users who share implicit interests but haven't interacted.</p>
                                <div className="mt-2 text-xs text-gray-500">
                                    Reasoning: Gap analysis shows 40% of users isolate in small clusters.
                                </div>
                            </div>
                            <button className="btn-small" style={{ fontSize: '12px', padding: '4px 8px' }}>Review</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Developer Controls */}
            <div className="settings-group">
                <h3><i className="fas fa-code"></i> Developer Controls</h3>
                <div className="setting-item">
                    <div className="setting-info">
                        <strong>Autonomy Level</strong>
                        <p>Control how much freedom the AI has</p>
                    </div>
                    <select
                        value={status?.autonomyLevel || 'medium'}
                        className="setting-select"
                        disabled
                        title="Configuration available in .env"
                    >
                        <option value="low">Low (Suggestions only)</option>
                        <option value="medium">Medium (Significant issues)</option>
                        <option value="high">High (Optimization focus)</option>
                        <option value="full">Full (Experimental)</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default AIDashboard;
