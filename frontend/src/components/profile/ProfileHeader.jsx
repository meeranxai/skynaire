import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMediaUrl, API_BASE_URL } from '../../api/config';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from './EditProfileModal';
import UserListModal from './UserListModal';

const ProfileHeader = ({ user, stats, isOwnProfile, onStatsUpdate, onUserUpdate }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [followStatus, setFollowStatus] = useState('none'); // none, following, requested
    const [loading, setLoading] = useState(false);
    const [localStats, setLocalStats] = useState(stats);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userData, setUserData] = useState(user);

    // User List Modal State
    const [listModal, setListModal] = useState({
        isOpen: false,
        type: '', // followers or following
        title: ''
    });

    useEffect(() => {
        setLocalStats(stats);
        if (stats?.isFollowing) setFollowStatus('following');
        else if (stats?.hasRequested) setFollowStatus('requested');
        else setFollowStatus('none');
    }, [stats]);

    useEffect(() => {
        setUserData(user);
    }, [user]);

    const handleFollowToggle = async () => {
        if (!currentUser || !user) return;

        setLoading(true);
        try {
            const isUnfollowing = followStatus === 'following' || followStatus === 'requested';
            const endpoint = isUnfollowing ? '/api/users/unfollow' : '/api/users/follow';

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    targetUid: user.firebaseUid || user.uid
                })
            });

            const data = await response.json();

            if (data.success) {
                const newStatus = data.status || (isUnfollowing ? 'none' : 'following');
                setFollowStatus(newStatus);

                // Update local stats only if transitioned to/from 'following'
                let newFollowersCount = localStats.followersCount || 0;
                if (followStatus === 'none' && newStatus === 'following') newFollowersCount++;
                if (followStatus === 'following' && newStatus === 'none') newFollowersCount--;

                const updatedStats = {
                    ...localStats,
                    followersCount: newFollowersCount,
                    isFollowing: newStatus === 'following',
                    hasRequested: newStatus === 'requested'
                };

                setLocalStats(updatedStats);
                if (onStatsUpdate) onStatsUpdate(updatedStats);
            }
        } catch (error) {
            console.error('Follow error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = (updatedUser) => {
        setUserData(updatedUser);
        if (onUserUpdate) onUserUpdate(updatedUser);
        if (onStatsUpdate) onStatsUpdate(localStats);
    };

    const getFollowButtonText = () => {
        if (loading) return '...';
        if (followStatus === 'following') return 'Following';
        if (followStatus === 'requested') return 'Requested';
        return 'Follow';
    };

    const openListModal = (type) => {
        setListModal({
            isOpen: true,
            type: type,
            title: type === 'followers' ? 'Followers' : 'Following'
        });
    };

    return (
        <div className="profile-wrapper">
            <div className="profile-cover-section">
                <img
                    src={getMediaUrl(userData?.coverPhotoURL) || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop'}
                    alt="Cover"
                    className="cover-image"
                />
                <div className="cover-overlay"></div>
            </div>

            <header className="profile-header">
                <div className="header-avatar-col">
                    <img
                        src={getMediaUrl(userData?.photoURL) || '/images/default-avatar.png'}
                        alt="Profile"
                        className="profile-avatar-lg"
                    />
                </div>

                <div className="header-info-col">
                    <div className="profile-title-row">
                        <h2 className="profile-username">
                            {userData?.displayName || 'G-Network User'}
                            {userData?.verification?.isVerified && (
                                <i className="fas fa-check-circle verification-badge" title="Verified Creator"></i>
                            )}
                            {userData?.pronouns && (
                                <span className="profile-pronouns">{userData.pronouns}</span>
                            )}
                        </h2>

                        <div className="profile-actions">
                            {isOwnProfile ? (
                                <>
                                    <button className="btn-profile-edit" onClick={() => setIsEditModalOpen(true)}>Edit Profile</button>
                                    <button className="btn-settings" onClick={() => navigate('/settings')}>
                                        <i className="fas fa-cog"></i>
                                    </button>
                                </>
                            ) : (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className={`btn-follow-toggle ${followStatus !== 'none' ? 'following' : ''}`}
                                        onClick={handleFollowToggle}
                                        disabled={loading}
                                    >
                                        {getFollowButtonText()}
                                    </button>
                                    <button
                                        className="btn-profile-secondary"
                                        onClick={() => navigate(`/chat?uid=${user.firebaseUid || user.uid}`)}
                                        style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', fontWeight: 700, background: 'var(--surface-100)', cursor: 'pointer' }}
                                    >
                                        Message
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <ul className="profile-stats-row">
                        <li className="stat-item clickable" onClick={() => document.getElementById('user-posts-grid')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer' }}><strong>{localStats?.postsCount || 0}</strong> posts</li>
                        <li className="stat-item clickable" onClick={() => openListModal('followers')} style={{ cursor: 'pointer' }}><strong>{localStats?.followersCount || 0}</strong> followers</li>
                        <li className="stat-item clickable" onClick={() => openListModal('following')} style={{ cursor: 'pointer' }}><strong>{localStats?.followingCount || 0}</strong> following</li>
                    </ul>

                    <div className="profile-bio">
                        <p>{userData?.bio || 'No bio yet.'}</p>

                        <div className="profile-meta-extra">
                            {userData?.techStack && userData.techStack.length > 0 && (
                                <div className="tech-stack-tags">
                                    {userData.techStack.map((tech, index) => (
                                        <span key={index} className="tech-tag">
                                            <i className="fas fa-code"></i> {tech}
                                        </span>
                                    ))}
                                </div>
                            )}
                            
                            <div className="member-since">
                                <i className="far fa-calendar-alt"></i>
                                <span>Joined {new Date(userData?.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>

                        <div className="profile-meta-info">
                            {userData?.location?.name && (
                                <div className="meta-item">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>{userData.location.name}</span>
                                </div>
                            )}
                            {userData?.website && (
                                <a href={userData.website.startsWith('http') ? userData.website : `https://${userData.website}`}
                                    target="_blank" rel="noopener noreferrer" className="meta-item bio-link" style={{ marginTop: 0 }}>
                                    <i className="fas fa-link"></i>
                                    <span>{userData.website.replace(/^https?:\/\//, '')}</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <EditProfileModal
                user={userData}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdate={handleProfileUpdate}
            />

            <UserListModal
                isOpen={listModal.isOpen}
                onClose={() => setListModal({ ...listModal, isOpen: false })}
                title={listModal.title}
                type={listModal.type}
                targetUid={user?.firebaseUid || user?.uid}
            />
        </div>
    );
};

export default ProfileHeader;
