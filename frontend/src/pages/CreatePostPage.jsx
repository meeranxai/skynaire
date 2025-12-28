import React from 'react';
import CreatePost from '../components/feed/CreatePost';
import { useNavigate } from 'react-router-dom';

const CreatePostPage = () => {
    const navigate = useNavigate();

    // Pass a callback to redirect after posting
    const handlePostSuccess = () => {
        navigate('/');
    };

    return (
        <main className="feed-container">
            <header className="feed-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(-1)}
                    style={{ padding: '0', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
                <h1 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>Create Post</h1>
            </header>

            <div style={{ marginTop: 'var(--space-4)' }}>
                <CreatePost onSuccess={handlePostSuccess} />
            </div>
        </main>
    );
};

export default CreatePostPage;
