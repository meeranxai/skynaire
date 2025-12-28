import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../api/config';

const RightSidebar = () => {
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/posts/trending-hashtags`);
                if (res.ok) {
                    const data = await res.json();
                    setTrends(data);
                }
            } catch (err) {
                console.error("Error fetching trends:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrends();
    }, []);

    return (
        <aside className="sidebar-right">
            <div className="trending-box glass-blur">
                <h3>Discovery Trends</h3>
                <div id="trending-list">
                    {loading ? (
                        <div className="empty-notif" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                            <p>Loading trends...</p>
                        </div>
                    ) : trends.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {trends.map((trend, index) => (
                                <li key={index} style={{ padding: '10px 15px', borderBottom: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>#{trend.tag}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{trend.count} {trend.count === 1 ? 'post' : 'posts'}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="empty-notif" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                            <p>No trending topics yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default RightSidebar;
