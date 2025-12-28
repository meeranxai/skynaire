import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../api/config';
import { useAuth } from '../../contexts/AuthContext';

const CollectionModal = ({ postId, isOpen, onClose, onSaveSuccess }) => {
    const { currentUser } = useAuth();
    const [collections, setCollections] = useState([]);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchCollections = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/collections?userId=${currentUser.uid}`);
            const data = await res.json();
            setCollections(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (isOpen && currentUser) fetchCollections();
    }, [isOpen, currentUser]);

    const handleSaveToCollection = async (collectionId) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/save`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid, collectionId })
            });
            if (res.ok) {
                onSaveSuccess();
                onClose();
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCreateCollection = async (e) => {
        e.preventDefault();
        if (!newCollectionName.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/collections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid, name: newCollectionName })
            });
            if (res.ok) {
                setNewCollectionName('');
                fetchCollections();
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
            <div style={{ background: 'var(--background-elevated)', width: '350px', borderRadius: 'var(--radius-xl)', padding: '25px', boxShadow: 'var(--shadow-2xl)', animation: 'scaleUp 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Save to Collection</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-tertiary)' }}><i className="fas fa-times"></i></button>
                </div>

                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                    {collections.map(col => (
                        <button
                            key={col._id}
                            onClick={() => handleSaveToCollection(col._id)}
                            style={{ width: '100%', padding: '12px 15px', textAlign: 'left', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '12px', marginBottom: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                        >
                            <i className="fas fa-folder" style={{ color: 'var(--primary)' }}></i>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{col.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{col.posts?.length || 0} items</div>
                            </div>
                        </button>
                    ))}
                    {collections.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '20px', fontSize: '13px' }}>No collections yet.</div>}
                </div>

                <form onSubmit={handleCreateCollection} style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        placeholder="New collection name..."
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
                    />
                    <button type="submit" disabled={!newCollectionName.trim() || loading} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 15px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>Create</button>
                </form>
            </div>

            <style>{`
                @keyframes scaleUp {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default CollectionModal;
