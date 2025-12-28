import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api/config';
import { useAuth } from '../contexts/AuthContext';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileGridItem from '../components/profile/ProfileGridItem';
import { useParams } from 'react-router-dom';


import { useGNavigation } from '../contexts/NavigationContext';

const Profile = () => {
    const { currentUser } = useAuth();
    const { setFeedContext } = useGNavigation();
    const { uid } = useParams();
    const [posts, setPosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);
    const [profileUser, setProfileUser] = useState(null);
    const [activeTab, setActiveTab] = useState('posts');
    const [stats, setStats] = useState({
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
        isFollowing: false
    });
    const [loading, setLoading] = useState(true);

    const targetUid = uid || currentUser?.uid;
    const isOwnProfile = !uid || uid === currentUser?.uid;

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!targetUid) return;
            setLoading(true);
            try {
                // Fetch user info
                const userRes = await fetch(`${API_BASE_URL}/api/users/${targetUid}?requesterId=${currentUser?.uid}`);
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setProfileUser(userData);
                }

                // Fetch posts for target user
                const postsRes = await fetch(`${API_BASE_URL}/api/posts?authorId=${targetUid}&currentUserId=${currentUser?.uid}&feedContext=profile`);
                const postsData = await postsRes.json();
                setPosts(postsData.posts || []);

                // Fetch user stats
                const statsRes = await fetch(
                    `${API_BASE_URL}/api/users/stats/${targetUid}?requesterId=${currentUser?.uid}`
                );
                const statsData = await statsRes.json();

                setStats({
                    postsCount: postsData.posts?.length || 0,
                    followersCount: statsData.followersCount || 0,
                    followingCount: statsData.followingCount || 0,
                    isFollowing: statsData.isFollowing || false
                });

                // Fetch saved posts if own profile
                if (isOwnProfile) {
                    const savedRes = await fetch(`${API_BASE_URL}/api/posts/saved?userId=${targetUid}`);
                    if (savedRes.ok) {
                        const savedData = await savedRes.json();
                        setSavedPosts(savedData);
                    }
                }
            } catch (err) {
                console.error("Profile fetch error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [targetUid, currentUser, isOwnProfile]);

    const displayedPosts = activeTab === 'posts' ? posts : savedPosts;

    useEffect(() => {
        if (displayedPosts.length > 0) {
            setFeedContext(displayedPosts, 'profile');
        }
    }, [displayedPosts, setFeedContext]);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Profile...</div>;

    if (!profileUser) {
        return (
            <div style={{ padding: '100px 20px', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '15px' }}>User not found</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '25px' }}>The user you are looking for doesn't exist or has been removed.</p>
                <button 
                    onClick={() => window.location.href = '/'}
                    style={{
                        padding: '10px 20px',
                        background: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <main className="feed-container" style={{ width: '100%', maxWidth: '935px' }}>
            <div className="profile-container">
                <ProfileHeader
                    user={profileUser}
                    stats={stats}
                    isOwnProfile={isOwnProfile}
                    onStatsUpdate={(newStats) => setStats(newStats)}
                    onUserUpdate={(updatedUser) => setProfileUser(updatedUser)}
                />


                <div className="profile-tabs" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '60px',
                    borderTop: '1px solid var(--border-light)',
                    marginTop: 'var(--space-8)'
                }}>
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`tab-item ${activeTab === 'posts' ? 'active' : ''}`}
                        style={{ background: 'transparent', border: 'none', borderTop: activeTab === 'posts' ? '1px solid var(--text-primary)' : '1px solid transparent', marginTop: '-1px', paddingTop: '15px', color: activeTab === 'posts' ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: 'var(--font-bold)', cursor: 'pointer', fontSize: '12px', letterSpacing: '1px', transition: 'all 0.2s ease' }}
                    >
                        <i className="fas fa-th" style={{ marginRight: '8px' }}></i> POSTS
                    </button>
                    {isOwnProfile && (
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`tab-item ${activeTab === 'saved' ? 'active' : ''}`}
                            style={{ background: 'transparent', border: 'none', borderTop: activeTab === 'saved' ? '1px solid var(--text-primary)' : '1px solid transparent', marginTop: '-1px', paddingTop: '15px', color: activeTab === 'saved' ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: 'var(--font-bold)', cursor: 'pointer', fontSize: '12px', letterSpacing: '1px', transition: 'all 0.2s ease' }}
                        >
                            <i className="fas fa-bookmark" style={{ marginRight: '8px' }}></i> SAVED
                        </button>
                    )}
                </div>

                <div className="posts-grid" id="user-posts-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '20px',
                    marginTop: '20px'
                }}>
                    {displayedPosts.map(post => (
                        <ProfileGridItem key={post._id} post={post} />
                    ))}
                    {displayedPosts.length === 0 && (
                        <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '60px', color: 'var(--text-tertiary)' }}>
                            <i className={`fas ${activeTab === 'posts' ? 'fa-camera' : 'fa-bookmark'}`} style={{ fontSize: '40px', marginBottom: '15px', opacity: 0.3 }}></i>
                            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{activeTab === 'posts' ? 'No Posts Yet' : 'No Saved Posts'}</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Profile;
