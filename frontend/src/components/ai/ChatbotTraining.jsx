
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../api/config';

const ChatbotTraining = () => {
    const [stats, setStats] = useState(null);
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, pendingRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/autonomous/training/stats`),
                fetch(`${API_BASE_URL}/api/autonomous/training/pending`)
            ]);

            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data.stats);
            }

            if (pendingRes.ok) {
                const data = await pendingRes.json();
                setPending(data.pending);
            }
        } catch (error) {
            console.error('Failed to load training data:', error);
        } finally {
            setLoading(false);
        }
    };

    const moderateConversation = async (conversationId, approve) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/autonomous/training/moderate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId, approve })
            });

            if (res.ok) {
                loadData(); // Refresh
            }
        } catch (error) {
            console.error('Moderation failed:', error);
        }
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading training data...</div>;
    }

    return (
        <div className="chatbot-training-panel" style={{
            padding: '30px',
            maxWidth: '1200px',
            margin: '0 auto',
            fontFamily: 'var(--font-primary)'
        }}>
            {/* Header */}
            <div style={{
                marginBottom: '30px',
                borderBottom: '2px solid var(--border-light)',
                paddingBottom: '20px'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                    marginBottom: '10px'
                }}>
                    🤖 Chatbot Training Dashboard
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Manage AI learning data and improve chatbot responses
                </p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '40px'
                }}>
                    <StatCard title="Total Conversations" value={stats.total} icon="💬" />
                    <StatCard title="Approved" value={stats.approved} icon="✅" color="var(--success)" />
                    <StatCard title="Pending Review" value={stats.pending} icon="⏳" color="var(--warning)" />
                    <StatCard title="Helpful" value={stats.helpful} icon="👍" color="var(--primary)" />
                    <StatCard title="Not Helpful" value={stats.notHelpful} icon="👎" color="var(--error)" />
                </div>
            )}

            {/* Pending Conversations */}
            <div>
                <h2 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                    marginBottom: '20px'
                }}>
                    Pending Conversations ({pending.length})
                </h2>

                {pending.length === 0 ? (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        background: 'var(--bg-secondary)',
                        borderRadius: '12px',
                        color: 'var(--text-tertiary)'
                    }}>
                        No pending conversations to review! 🎉
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {pending.map(conv => (
                            <ConversationCard
                                key={conv.id}
                                conversation={conv}
                                onApprove={() => moderateConversation(conv.id, true)}
                                onReject={() => moderateConversation(conv.id, false)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color = 'var(--primary)' }) => (
    <div style={{
        background: 'var(--background-elevated)',
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)'
    }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color, marginBottom: '5px' }}>
            {value}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            {title}
        </div>
    </div>
);

const ConversationCard = ({ conversation, onApprove, onReject }) => (
    <div style={{
        background: 'var(--background-elevated)',
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)'
    }}>
        <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                {new Date(conversation.timestamp).toLocaleString()}
            </div>
            <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                marginBottom: '10px'
            }}>
                Q: {conversation.question}
            </div>
            <div style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                background: 'var(--bg-secondary)',
                padding: '12px',
                borderRadius: '8px'
            }}>
                A: {conversation.answer}
            </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
            <button
                onClick={onApprove}
                style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: 'var(--success)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                ✅ Approve & Train
            </button>
            <button
                onClick={onReject}
                style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: 'var(--error)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                ❌ Reject
            </button>
        </div>
    </div>
);

export default ChatbotTraining;
