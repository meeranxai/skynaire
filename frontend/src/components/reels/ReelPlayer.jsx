import SocialOverlay from './SocialOverlay';
import { useSocket } from '../../contexts/SocketContext'; // Import Socket hook for sending reactions

// ... (Imports remain same)

const ReelPlayer = ({ reel, isActive, currentUser }) => {
    const videoRef = useRef(null);
    const { socket } = useSocket() || {}; // Safe access
    // ... (Existing state)
    const [isPlaying, setIsPlaying] = useState(false);
    const [likes, setLikes] = useState(reel.likes || []);
    const [isMuted, setIsMuted] = useState(false);
    const [views, setViews] = useState(reel.views || 0);
    const [showHeart, setShowHeart] = useState(false);

    // ... (UseEffects remain same)

    // ... (Existing Handlers: togglePlay, handleLike, handleView)
    const handleView = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/reels/${reel._id}/view`, { method: 'POST' });
            setViews(prev => prev + 1);
        } catch (e) { console.error(e); }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleLike = async () => {
        if (!currentUser) return;
        const newIsLiked = !likes.includes(currentUser.uid);
        if (newIsLiked) setLikes([...likes, currentUser.uid]);
        else setLikes(likes.filter(id => id !== currentUser.uid));

        try {
            await fetch(`${API_BASE_URL}/api/reels/${reel._id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid })
            });

            // Also send socket reaction for "Live" feel
            if (newIsLiked && socket) {
                socket.emit('send_reaction', {
                    reelId: reel._id,
                    reaction: { type: 'heart' },
                    user: { displayName: currentUser.displayName, photoURL: currentUser.photoURL }
                });
            }
        } catch (e) { console.error(e); }
    };

    const handleDoubleTap = (e) => {
        e.stopPropagation();
        if (!likes.includes(currentUser?.uid)) handleLike();
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);

        // Burst reaction
        if (socket) {
            socket.emit('send_reaction', {
                reelId: reel._id,
                reaction: { type: 'heart' },
                user: { displayName: currentUser.displayName, photoURL: currentUser.photoURL }
            });
        }
    };

    // Quick Reaction Handler
    const handleQuickReaction = (emoji) => {
        if (socket) {
            socket.emit('send_reaction', {
                reelId: reel._id,
                reaction: { type: emoji },
                user: { displayName: currentUser.displayName, photoURL: currentUser.photoURL }
            });
        }
    };

    const isLiked = currentUser && likes.includes(currentUser.uid);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}>
            {/* Social Overlay Layer (New) */}
            <SocialOverlay reelId={reel._id} currentUser={currentUser} isActive={isActive} />

            {/* Video Layer */}
            <video
                ref={videoRef}
                src={getMediaUrl(reel.videoUrl)}
                loop
                playsInline
                onClick={togglePlay}
                onDoubleClick={handleDoubleTap}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            />

            {/* Gradient Overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.3) 100%)',
                pointerEvents: 'none'
            }}></div>

            {/* Play Button Overlay (when paused) */}
            {!isPlaying && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                    <i className="fas fa-play" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '50px' }}></i>
                </div>
            )}

            {/* Heart Animation */}
            {showHeart && (
                <div className="heart-anim" style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    animation: 'pop 0.8s ease-out forwards', pointerEvents: 'none'
                }}>
                    <i className="fas fa-heart" style={{ color: '#ff2d55', fontSize: '100px', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}></i>
                </div>
            )}

            {/* Right Sidebar Actions */}
            <div style={{
                position: 'absolute', bottom: '100px', right: '15px',
                display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', zIndex: 20
            }}>
                {/* Profile */}
                <div style={{ position: 'relative', cursor: 'pointer' }}>
                    <img
                        src={getMediaUrl(reel.authorAvatar) || '/default-avatar.png'}
                        style={{ width: '45px', height: '45px', borderRadius: '50%', border: '2px solid #fff' }}
                        alt={reel.author}
                    />
                    <div style={{ position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)', background: '#ff2d55', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-plus" style={{ fontSize: '10px', color: '#fff' }}></i>
                    </div>
                </div>

                {/* Like */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff' }}>
                    <button onClick={handleLike} style={{ background: 'none', border: 'none', color: isLiked ? '#ff2d55' : '#fff', fontSize: '30px', cursor: 'pointer', transition: 'transform 0.2s', transform: isLiked ? 'scale(1.1)' : 'scale(1)' }}>
                        <i className={isLiked ? "fas fa-heart" : "far fa-heart"}></i>
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{likes.length}</span>
                </div>

                {/* Comment (Stub) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff' }}>
                    <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer' }}>
                        <i className="fas fa-comment-dots"></i>
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{reel.commentsCount || 0}</span>
                </div>

                {/* Share (Stub) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff' }}>
                    <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer' }}>
                        <i className="far fa-paper-plane"></i>
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{reel.shares || 0}</span>
                </div>

                {/* Quick Reaction (Fire) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff' }}>
                    <button
                        onClick={() => handleQuickReaction('fire')}
                        style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}
                    >
                        🔥
                    </button>
                </div>

                {/* More Options */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff' }}>
                    <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>
                        <i className="fas fa-ellipsis-h"></i>
                    </button>
                </div>
            </div>

            {/* Bottom Metadata */}
            <div style={{
                position: 'absolute', bottom: '20px', left: '15px', right: '80px',
                color: '#fff', zIndex: 10, textAlign: 'left'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{reel.author}</h3>
                    <span style={{ fontSize: '13px', opacity: 0.8 }}>• Follow</span>
                </div>

                <p style={{ margin: 0, fontSize: '14px', marginBottom: '10px', lineHeight: '1.4' }}>
                    {reel.description} <span style={{ color: '#ccc' }}>#viral #reels</span>
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <i className="fas fa-music"></i>
                    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '150px' }}>
                        <div className="scrolling-text">Original Audio - {reel.author}</div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pop {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
                }
                .scrolling-text {
                    display: inline-block;
                    animation: scroll-left 10s linear infinite;
                }
                @keyframes scroll-left {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
};

export default ReelPlayer;
