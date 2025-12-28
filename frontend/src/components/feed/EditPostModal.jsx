import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL, getMediaUrl } from '../../api/config';

const EditPostModal = ({ post, isOpen, onClose, onUpdate }) => {
    const [description, setDescription] = useState(post.description || '');
    const [title, setTitle] = useState(post.title || '');
    const [category, setCategory] = useState(post.category || 'Social');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(getMediaUrl(post.image));
    const [aspectRatio, setAspectRatio] = useState('cover'); // For "cropping" feel
    const [fileType, setFileType] = useState(post.image && /\.(mp4|mov|avi|mkv)$/i.test(post.image) ? 'video' : 'image');
    const [loading, setLoading] = useState(false);
    const [removeImage, setRemoveImage] = useState(false);
    const fileInputRef = useRef(null);

    const categories = ['Social', 'Tech', 'News', 'Lifestyle', 'Entertainment', 'Coding', 'Design'];

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setRemoveImage(false);
            setFileType(file.type.startsWith('video/') ? 'video' : 'image');
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
        setRemoveImage(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('description', description);
            formData.append('title', title);
            formData.append('category', category);
            formData.append('aspectRatio', aspectRatio);
            formData.append('userId', post.authorId);
            if (image) {
                formData.append('image', image);
            }
            if (removeImage) {
                formData.append('removeImage', 'true');
            }

            const response = await fetch(`${API_BASE_URL}/api/posts/${post._id}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                const updatedPost = await response.json();
                onUpdate(updatedPost);
                onClose();
            } else {
                const errData = await response.json();
                alert(errData.message || 'Failed to update post');
            }
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay active" onClick={onClose} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)',
            opacity: 1,
            visibility: 'visible'
        }}>
            <div className="card" onClick={e => e.stopPropagation()} style={{
                maxWidth: '500px',
                width: '95%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--background-elevated)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-2xl)',
                overflow: 'hidden'
            }}>
                <div className="modal-header" style={{
                    padding: 'var(--space-4) var(--space-6)',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0 }}>Edit Post</h3>
                    <button className="btn-close" onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)'
                    }}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 'var(--space-2)' }}>
                    <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                        <label className="form-label" style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)' }}>Post Title</label>
                        <input
                            type="text"
                            className="form-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a catchy title..."
                        />
                    </div>

                    <div className="flex gap-4" style={{ marginBottom: 'var(--space-4)' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)' }}>Category</label>
                            <select
                                className="form-input"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{ width: '100%', paddingLeft: 'var(--space-2)' }}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                        <label className="form-label" style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)' }}>Description</label>
                        <textarea
                            className="form-textarea"
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Edit your post description..."
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-secondary)' }}>Post Image</label>
                        {imagePreview ? (
                            <div style={{ position: 'relative', marginBottom: 'var(--space-2)' }}>
                                <div style={{
                                    width: '100%',
                                    height: '250px',
                                    overflow: 'hidden',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-tertiary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {fileType === 'video' ? (
                                        <video src={imagePreview} controls style={{ width: '100%', height: '100%' }} />
                                    ) : (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: aspectRatio,
                                                transition: 'object-fit 0.3s'
                                            }}
                                        />
                                    )}
                                </div>
                                <div className="image-edit-tools" style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    left: '10px',
                                    right: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    zIndex: 5
                                }}>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${aspectRatio === 'cover' ? 'btn-primary' : 'btn-ghost'}`}
                                            onClick={() => setAspectRatio('cover')}
                                            style={{ padding: '0 var(--space-2)', fontSize: '10px', background: aspectRatio === 'cover' ? '' : 'rgba(0,0,0,0.5)', color: '#fff' }}
                                        >
                                            Cover
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${aspectRatio === 'contain' ? 'btn-primary' : 'btn-ghost'}`}
                                            onClick={() => setAspectRatio('contain')}
                                            style={{ padding: '0 var(--space-2)', fontSize: '10px', background: aspectRatio === 'contain' ? '' : 'rgba(0,0,0,0.5)', color: '#fff' }}
                                        >
                                            Fit
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        style={{
                                            background: 'var(--error)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px'
                                        }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current.click()}
                                style={{
                                    border: '2px dashed var(--border-default)',
                                    padding: 'var(--space-6)',
                                    textAlign: 'center',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    marginBottom: 'var(--space-2)'
                                }}
                            >
                                <i className="fas fa-image" style={{ fontSize: '24px', marginBottom: 'var(--space-2)' }}></i>
                                <p>Click to upload image</p>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*,video/*"
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div className="modal-footer" style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPostModal;
