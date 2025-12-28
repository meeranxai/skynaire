import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../api/config';
import ImageEditor from './ImageEditor';

const CreatePost = ({ onSuccess }) => {
    const { currentUser } = useAuth();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [statusType, setStatusType] = useState(''); // 'success', 'error', 'info'

    // Form States
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Social');

    // Upload & Preview States
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileType, setFileType] = useState(null); // 'image' or 'video'
    const [aspectRatio, setAspectRatio] = useState('cover'); // 'cover' or 'contain'
    const [showImageEditor, setShowImageEditor] = useState(false);
    const fileInputRef = useRef(null);

    // Tagging States
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [tagX, setTagX] = useState(0);
    const [tagY, setTagY] = useState(0);
    const [showTagInput, setShowTagInput] = useState(false);

    // AI States
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Monetization States
    const [isBrandedContent, setIsBrandedContent] = useState(false);
    const [affiliateLink, setAffiliateLink] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const categoryRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setShowCategoryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const categories = ['Social', 'Tech', 'News', 'Lifestyle', 'Entertainment', 'Coding', 'Design'];

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setFileType(selectedFile.type.startsWith('video/') ? 'video' : 'image');

        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
    };

    const handleRemoveMedia = () => {
        setFile(null);
        setPreviewUrl(null);
        setFileType(null);
        setTags([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleImageEditorSave = (blob) => {
        const editedFile = new File([blob], 'edited_image.jpg', { type: 'image/jpeg' });
        setFile(editedFile);
        const url = URL.createObjectURL(editedFile);
        setPreviewUrl(url);
        setShowImageEditor(false);
    };

    const handleImageClick = (e) => {
        if (fileType !== 'image' || !previewUrl) return;
        const rect = e.target.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setTagX(x);
        setTagY(y);
        setShowTagInput(true);
    };

    const addTag = () => {
        if (!tagInput.trim()) {
            setShowTagInput(false);
            return;
        }
        setTags([...tags, { label: tagInput, x: tagX, y: tagY }]);
        setTagInput('');
        setShowTagInput(false);
    };

    const removeTag = (e, index) => {
        e.stopPropagation();
        setTags(tags.filter((_, i) => i !== index));
    };

    const handleGenerateCaption = async () => {
        if (!text.trim() && tags.length === 0) {
            alert("Please provide some keywords or tags first!");
            return;
        }
        setIsGenerating(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/ai-caption`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keywords: text.substring(0, 50),
                    context: tags.map(t => t.label).join(', ')
                })
            });
            if (res.ok) {
                const data = await res.json();
                setAiSuggestions(data.suggestions);
            }
        } catch (err) { console.error(err); }
        finally { setIsGenerating(false); }
    };

    const applySuggestion = (s) => {
        setText(s);
        setAiSuggestions([]);
    };

    /**
     * V3.0 AI Enhance Function
     */
    const handleEnhanceContent = async () => {
        if (!text || !text.trim()) return;
        setIsGenerating(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/autonomous/content/enhance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.result) {
                    setText(data.result.enhancedText || text);

                    // Safe hashtag handling
                    const tags = data.result.hashtags;
                    if (Array.isArray(tags) && tags.length > 0) {
                        const tagsStr = tags.map(t => (typeof t === 'string' && t.startsWith('#')) ? t : `#${t}`).join(' ');
                        setText(prev => `${prev}\n\n${tagsStr}`);
                    }
                }
            }
        } catch (err) {
            console.error("AI Enhance error:", err);
            setStatusMsg(`AI Enhance failed: ${err.message}`);
            setStatusType("error");
            setTimeout(() => setStatusMsg(''), 3000);
        } finally {
            setIsGenerating(false);
        }
    };

    // Advanced Settings States
    const [altText, setAltText] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [allowComments, setAllowComments] = useState(true);
    const [allowSharing, setAllowSharing] = useState(true);
    const [hideLikeCount, setHideLikeCount] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [blockedWordsInput, setBlockedWordsInput] = useState('');

    const handlePost = async () => {
        setStatusMsg("Processing...");
        setStatusType('info');

        if (!text.trim() && !file) {
            setStatusMsg("Please write something or upload a file!");
            setStatusType('error');
            return;
        }

        if (!currentUser) {
            setStatusMsg("Please log in to post.");
            setStatusType('error');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('description', text);
            formData.append('title', title || 'New Post');
            formData.append('category', category);
            formData.append('authorId', currentUser.uid);
            formData.append('author', currentUser.displayName || 'User');
            formData.append('authorAvatar', currentUser.photoURL || '');
            formData.append('aspectRatio', aspectRatio);

            // Phase Two fields
            formData.append('altText', altText);
            formData.append('visibility', visibility);
            formData.append('allowComments', allowComments);
            formData.append('allowSharing', allowSharing);
            formData.append('hideLikeCount', hideLikeCount);
            formData.append('tags', JSON.stringify(tags));
            formData.append('isBrandedContent', isBrandedContent);
            formData.append('affiliateLink', affiliateLink);

            const blockedArray = blockedWordsInput.split(',').map(w => w.trim()).filter(w => w);
            formData.append('blockedKeywords', JSON.stringify(blockedArray));

            if (file) {
                formData.append('image', file);
            }

            const response = await fetch(`${API_BASE_URL}/api/posts`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                setText('');
                setTitle('');
                setAltText('');
                setBlockedWordsInput('');
                setIsBrandedContent(false);
                setAffiliateLink('');
                setShowSettings(false);
                handleRemoveMedia();
                setStatusMsg("Success! Post created.");
                setStatusType('success');
                setTimeout(() => {
                    setStatusMsg('');
                    if (onSuccess) onSuccess();
                    else window.location.reload(); // Refresh to see the new post
                }, 2000); // 2 seconds to see success state
            } else {
                const errorData = await response.json().catch(() => ({}));
                const msg = errorData.message || "Server error while creating post";
                setStatusMsg(`Error: ${msg}`);
                setStatusType('error');
            }
        } catch (error) {
            console.error("Post creation fetch error:", error);
            setStatusMsg(`Network Error: ${error.message}. Is the server running?`);
            setStatusType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card create-post-card" style={{
            marginBottom: 'var(--space-6)',
            overflow: 'visible',
            border: 'none',
            boxShadow: 'var(--shadow-float)',
            background: 'var(--background-elevated)',
            borderRadius: 'var(--radius-2xl)',
            transition: 'all 0.3s var(--transition-bounce)'
        }}>
            <div className="card-body" style={{ padding: 'var(--space-5)' }}>
                {/* Header: User Info & Category Selector */}
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="flex items-center gap-3">
                        <img
                            src={currentUser?.photoURL || '/images/default-avatar.png'}
                            alt="User"
                            className="rounded-full"
                            style={{
                                width: '42px',
                                height: '42px',
                                border: '2px solid var(--primary-light)',
                                objectFit: 'cover'
                            }}
                        />
                        <div>
                            <div style={{ fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                                {currentUser?.displayName || 'User'}
                            </div>
                            <div
                                onClick={() => setShowSettings(!showSettings)}
                                className="visibility-selector"
                            >
                                <i className={`fas fa-${visibility === 'public' ? 'globe-americas' : visibility === 'followers' ? 'users' : 'lock'}`} style={{ fontSize: '10px' }}></i>
                                {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
                                <i className="fas fa-chevron-down"></i>
                            </div>
                        </div>
                    </div>

                    <div 
                        className={`category-select-wrapper ${showCategoryDropdown ? 'open' : ''}`}
                        ref={categoryRef}
                    >
                        <div 
                            className="category-select-trigger"
                            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        >
                            <span>{category}</span>
                            <i className="fas fa-chevron-down category-select-icon"></i>
                        </div>
                        
                        <div className={`category-dropdown-menu ${showCategoryDropdown ? 'show' : ''}`}>
                            {categories.map(cat => (
                                <div 
                                    key={cat} 
                                    className={`category-dropdown-item ${category === cat ? 'active' : ''}`}
                                    onClick={() => {
                                        setCategory(cat);
                                        setShowCategoryDropdown(false);
                                    }}
                                >
                                    {cat}
                                    <i className="fas fa-check"></i>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="post-input-container">
                    <input
                        type="text"
                        className="post-title-input"
                        placeholder="Add a catchy title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        className="post-content-textarea"
                        placeholder="What's on your mind?"
                        rows="2"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        disabled={loading}
                    ></textarea>

                    {/* AI Suggestions Container */}
                    {aiSuggestions.length > 0 && (
                        <div className="ai-suggestions">
                            <div className="ai-suggestions-label">AI SUGGESTIONS:</div>
                            <div className="flex overflow-x-auto gap-2 pb-1">
                                {aiSuggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        className="ai-suggestion-item"
                                        onClick={() => applySuggestion(s)}
                                    >
                                        {s.substring(0, 30)}...
                                    </button>
                                ))}
                                <button 
                                    onClick={() => setAiSuggestions([])} 
                                    className="btn btn-ghost btn-xs"
                                    style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {showSettings && (
                    <div className="advanced-settings-panel" style={{
                        padding: 'var(--space-5)',
                        background: 'var(--background-secondary)',
                        borderRadius: 'var(--radius-xl)',
                        marginBottom: 'var(--space-4)',
                        border: '1px solid var(--border-default)',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', color: 'var(--primary-600)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Advanced Settings</div>

                        <div className="setting-group" style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>Who can see this?</label>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                {['public', 'followers', 'private'].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setVisibility(v)}
                                        className={`btn btn-sm ${visibility === v ? 'btn-primary' : 'btn-outline'}`}
                                        style={{
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '11px',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="setting-group" style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>Block Keywords (comma separated)</label>
                            <input
                                type="text"
                                placeholder="spam, offensive, etc..."
                                value={blockedWordsInput}
                                onChange={(e) => setBlockedWordsInput(e.target.value)}
                                className="input input-sm input-bordered w-full"
                                style={{ borderRadius: 'var(--radius-lg)', background: 'var(--background-primary)' }}
                            />
                        </div>

                        {file && (
                            <div className="setting-group" style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>Alt Text (Accessibility)</label>
                                <input
                                    type="text"
                                    placeholder="Describe this image for screen readers..."
                                    value={altText}
                                    onChange={(e) => setAltText(e.target.value)}
                                    className="input input-sm input-bordered w-full"
                                    style={{ borderRadius: 'var(--radius-lg)', background: 'var(--background-primary)' }}
                                />
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <input type="checkbox" className="checkbox-custom" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} />
                                Allow Comments
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <input type="checkbox" className="checkbox-custom" checked={allowSharing} onChange={(e) => setAllowSharing(e.target.checked)} />
                                Allow Sharing
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <input type="checkbox" className="checkbox-custom" checked={hideLikeCount} onChange={(e) => setHideLikeCount(e.target.checked)} />
                                Hide Like Count
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <input type="checkbox" className="checkbox-custom" checked={isBrandedContent} onChange={(e) => setIsBrandedContent(e.target.checked)} />
                                Branded Content
                            </label>
                        </div>

                        {isBrandedContent && (
                            <div className="setting-group">
                                <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>Affiliate/Product Link</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={affiliateLink}
                                    onChange={(e) => setAffiliateLink(e.target.value)}
                                    className="input input-sm input-bordered w-full"
                                    style={{ borderRadius: 'var(--radius-lg)', background: 'var(--background-primary)' }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {previewUrl && (
                    <div className="preview-container" style={{ position: 'relative', marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', background: '#000', boxShadow: 'var(--shadow-lg)' }}>
                        <div
                            onClick={handleImageClick}
                            style={{ position: 'relative', width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: fileType === 'image' ? 'crosshair' : 'default' }}
                        >
                            {fileType === 'video' ? (
                                <video src={previewUrl} style={{ width: '100%', height: '100%', objectFit: aspectRatio }} muted playsInline />
                            ) : (
                                <>
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: aspectRatio,
                                            transition: 'all 0.3s ease'
                                        }}
                                    />
                                    {/* Render Tags */}
                                    {tags.map((tag, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                position: 'absolute', top: `${tag.y}%`, left: `${tag.x}%`,
                                                transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)',
                                                color: '#fff', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px',
                                                display: 'flex', alignItems: 'center', gap: '5px', zIndex: 10
                                            }}
                                        >
                                            {tag.label}
                                            <i className="fas fa-times" onClick={(e) => removeTag(e, i)} style={{ cursor: 'pointer', fontSize: '10px' }}></i>
                                        </div>
                                    ))}
                                    {showTagInput && (
                                        <div style={{ position: 'absolute', top: `${tagY}%`, left: `${tagX}%`, zIndex: 100, transform: 'translate(-50%, 0)' }}>
                                            <input
                                                autoFocus
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onBlur={addTag}
                                                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                                placeholder="Who is this?"
                                                style={{ background: '#fff', border: 'none', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Edit Button */}
                            {fileType === 'image' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowImageEditor(true); }}
                                    style={{
                                        position: 'absolute', top: '15px', left: '15px',
                                        padding: '6px 12px', borderRadius: 'var(--radius-full)',
                                        background: 'rgba(255,255,255,0.9)', color: '#000', border: 'none',
                                        fontSize: '12px', cursor: 'pointer', backdropFilter: 'blur(4px)',
                                        display: 'flex', alignItems: 'center', gap: '5px', zIndex: 15,
                                        fontWeight: 'var(--font-bold)'
                                    }}
                                >
                                    <i className="fas fa-magic"></i> Edit
                                </button>
                            )}

                            <div className="flex gap-2" style={{ position: 'absolute', bottom: '15px', left: '15px', zIndex: 15 }}>
                                <button
                                    className={`btn btn-xs ${aspectRatio === 'cover' ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={(e) => { e.stopPropagation(); setAspectRatio('cover'); }}
                                    style={{ background: aspectRatio === 'cover' ? '' : 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(4px)', border: 'none', borderRadius: 'var(--radius-full)' }}
                                >
                                    <i className="fas fa-expand"></i> Cover
                                </button>
                                <button
                                    className={`btn btn-xs ${aspectRatio === 'contain' ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={(e) => { e.stopPropagation(); setAspectRatio('contain'); }}
                                    style={{ background: aspectRatio === 'contain' ? '' : 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(4px)', border: 'none', borderRadius: 'var(--radius-full)' }}
                                >
                                    <i className="fas fa-compress"></i> Fit
                                </button>
                            </div>

                            <button
                                onClick={(e) => { e.stopPropagation(); handleRemoveMedia(); }}
                                style={{
                                    position: 'absolute', top: '15px', right: '15px',
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'rgba(255, 59, 48, 0.8)', color: '#fff',
                                    backdropFilter: 'blur(4px)', border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 15
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between" style={{ paddingTop: 'var(--space-2)' }}>
                    <div className="flex items-center gap-1">
                        <button
                            className="btn btn-ghost btn-sm tool-btn"
                            onClick={() => { fileInputRef.current.accept = "image/*"; fileInputRef.current.click(); }}
                            disabled={loading || !!file}
                            style={{ borderRadius: 'var(--radius-full)', width: '40px', height: '40px' }}
                        >
                            <i className="fas fa-image" style={{ color: 'var(--primary)', fontSize: '1.2rem' }}></i>
                        </button>
                        <button
                            className="btn btn-ghost btn-sm tool-btn"
                            onClick={() => { fileInputRef.current.accept = "video/*"; fileInputRef.current.click(); }}
                            disabled={loading || !!file}
                            style={{ borderRadius: 'var(--radius-full)', width: '40px', height: '40px' }}
                        >
                            <i className="fas fa-video" style={{ color: 'var(--secondary)', fontSize: '1.2rem' }}></i>
                        </button>
                        <div style={{ width: '1px', height: '24px', background: 'var(--border-light)', margin: '0 var(--space-2)' }}></div>
                        <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--secondary)', borderRadius: 'var(--radius-full)' }}
                            title="AI Enhance"
                            onClick={handleEnhanceContent}
                            disabled={isGenerating || !text.trim()}
                        >
                            <i className="fas fa-magic"></i> {isGenerating ? '...' : 'Enhance'}
                        </button>
                        <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: aiSuggestions.length > 0 ? 'var(--secondary)' : 'var(--text-tertiary)', borderRadius: 'var(--radius-full)' }}
                            title="Generate Captions"
                            onClick={handleGenerateCaption}
                            disabled={isGenerating}
                        >
                            <i className="fas fa-robot"></i>
                        </button>
                        <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: showSettings ? 'var(--primary)' : 'var(--text-tertiary)', borderRadius: 'var(--radius-full)' }}
                            title="Advanced Settings"
                            onClick={() => setShowSettings(!showSettings)}
                        >
                            <i className="fas fa-cog"></i>
                        </button>
                    </div>

                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} />

                    <button
                        className="btn btn-primary"
                        onClick={handlePost}
                        disabled={loading || (!text.trim() && !file)}
                        style={{ padding: 'var(--space-2) var(--space-8)', borderRadius: 'var(--radius-full)', fontWeight: 'var(--font-bold)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {loading ? <><i className="fas fa-spinner fa-spin"></i> Posting...</> : <><i className="fas fa-paper-plane"></i> Share</>}
                    </button>
                </div>

                {statusMsg && (
                    <div className={`alert alert-${statusType}`} style={{ marginTop: 'var(--space-4)', borderRadius: 'var(--radius-xl)', border: 'none', background: statusType === 'success' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)', color: statusType === 'success' ? '#34c759' : '#ff3b30' }}>
                        <div className="alert-content" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)' }}>
                            <i className={`fas fa-${statusType === 'success' ? 'check-circle' : 'exclamation-circle'}`} style={{ marginRight: '8px' }}></i>
                            {statusMsg}
                        </div>
                    </div>
                )}
            </div>

            {showImageEditor && previewUrl && (
                <ImageEditor
                    image={previewUrl}
                    onSave={handleImageEditorSave}
                    onCancel={() => setShowImageEditor(false)}
                />
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default CreatePost;
