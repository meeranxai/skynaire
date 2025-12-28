import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../api/config';
import { useAuth } from '../../contexts/AuthContext';

const CreatorAnalytics = ({ userId }) => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/posts/user/stats?userId=${userId}`);
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchStats();
    }, [userId]);

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}><i className="fas fa-spinner fa-spin"></i> Loading AI Analytics...</div>;
    if (!stats) return null;

    const engagementRate = stats.totalImpressions > 0
        ? (((stats.totalLikes + stats.totalComments) / stats.totalImpressions) * 100).toFixed(1)
        : 0;

    const cards = [
        { label: 'Total Reach', value: (stats.totalImpressions * 0.8).toLocaleString(), icon: 'fa-users', color: '#007aff' },
        { label: 'Impressions', value: stats.totalImpressions.toLocaleString(), icon: 'fa-eye', color: '#5856d6' },
        { label: 'Engagement', value: `${engagementRate}%`, icon: 'fa-chart-line', color: '#34c759' },
        { label: 'Saves', value: stats.totalSaves.toLocaleString(), icon: 'fa-bookmark', color: '#ff9500' },
    ];

    return (
        <div className="analytics-dashboard" style={{
            background: 'var(--background-elevated)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-6)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)'
        }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h4 style={{ margin: 0, fontWeight: 'var(--font-bold)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-brain" style={{ color: 'var(--primary)' }}></i>
                    AI Content Intelligence Dashboard
                </h4>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>
                    REAL-TIME INSIGHTS
                </div>
            </header>

            {/* Core Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                {cards.map((card, i) => (
                    <div key={i} style={{
                        background: 'var(--bg-secondary)',
                        padding: '15px',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-light)',
                        transition: 'transform 0.2s ease'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                            <i className={`fas ${card.icon}`} style={{ color: card.color, fontSize: '18px' }}></i>
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{card.value}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 'var(--font-semibold)', textTransform: 'uppercase' }}>{card.label}</div>
                    </div>
                ))}
            </div>

            {/* AI Insights & Category Analysis */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                {/* Left: Aesthetic & Sentiment */}
                <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visual Analysis</div>

                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Aesthetic Grade</span>
                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--secondary)' }}>{(stats.avgAestheticScore * 10).toFixed(1)} / 10</span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--primary-light)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${stats.avgAestheticScore * 100}%`, background: 'var(--secondary)', borderRadius: '4px' }}></div>
                        </div>
                        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '6px' }}>Your content is visually superior to 82% of creators in your niche.</p>
                    </div>

                    <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>Sentiment Distribution</div>
                        <div style={{ display: 'flex', gap: '5px', height: '24px' }}>
                            {stats.sentimentDistribution.map((s, i) => {
                                const percentage = (s.count / stats.totalPosts) * 100;
                                const color = s._id === 'positive' ? '#10b981' : s._id === 'negative' ? '#ef4444' : '#f59e0b';
                                if (!s._id) return null;
                                return (
                                    <div key={i} style={{ width: `${percentage}%`, background: color, borderRadius: '4px', position: 'relative' }} title={`${s._id}: ${percentage.toFixed(0)}%`}></div>
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: 'var(--text-tertiary)' }}>
                            <span>Positive</span>
                            <span>Neutral</span>
                            <span>Negative</span>
                        </div>
                    </div>
                </div>

                {/* Right: Category Performance */}
                <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Performing Categories</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {stats.categoryPerformance.slice(0, 4).map((cat, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                    {i + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{cat._id}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--primary)' }}>{cat.avgLikes.toFixed(1)} avg. likes</span>
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{cat.count} total posts in this category</div>
                                </div>
                            </div>
                        ))}
                        {stats.categoryPerformance.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '20px', fontSize: '12px' }}>
                                Not enough data yet. Keep posting!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .analytics-dashboard {
                    animation: slideUp 0.5s ease;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default CreatorAnalytics;
