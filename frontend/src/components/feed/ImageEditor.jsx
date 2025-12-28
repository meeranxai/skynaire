import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

const FILTERS = [
    { name: 'Normal', filter: '' },
    { name: 'Clarendon', filter: 'contrast(1.2) brightness(1.1) saturate(1.1)' },
    { name: 'Gingham', filter: 'sepia(0.2) contrast(0.9) brightness(1.1)' },
    { name: 'Moon', filter: 'grayscale(1) contrast(1.1) brightness(1.1)' },
    { name: 'Lark', filter: 'brightness(1.1) contrast(0.9) saturate(1.2)' },
    { name: 'Reyes', filter: 'sepia(0.2) contrast(0.85) brightness(1.1) saturate(0.75)' },
    { name: 'Juno', filter: 'contrast(1.2) brightness(1.1) saturate(1.4) sepia(0.2)' },
];

const ImageEditor = ({ image, onSave, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [aspect, setAspect] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // Filters
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [selectedFilter, setSelectedFilter] = useState('');

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc, pixelCrop, filters) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        // Apply filters to canvas
        ctx.filter = filters;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const handleSave = async () => {
        const filterString = `${selectedFilter} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels, filterString);
        onSave(croppedImageBlob);
    };

    return (
        <div className="image-editor-modal" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', flexDirection: 'column'
        }}>
            <div className="editor-header" style={{
                padding: '15px 20px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', borderBottom: '1px solid #333'
            }}>
                <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer' }}>Cancel</button>
                <h4 style={{ color: '#fff', margin: 0 }}>Edit Photo</h4>
                <button onClick={handleSave} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>Done</button>
            </div>

            <div className="editor-content" style={{ flex: 1, position: 'relative', background: '#000' }}>
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                />
            </div>

            <div className="editor-controls" style={{
                padding: '20px', background: '#111', borderTop: '1px solid #333'
            }}>
                {/* Aspect Ratio Selectors */}
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setAspect(1)} style={{ color: aspect === 1 ? 'var(--primary)' : '#888', background: 'none', border: 'none', cursor: 'pointer' }}>1:1</button>
                    <button onClick={() => setAspect(4 / 5)} style={{ color: aspect === 4 / 5 ? 'var(--primary)' : '#888', background: 'none', border: 'none', cursor: 'pointer' }}>4:5</button>
                    <button onClick={() => setAspect(16 / 9)} style={{ color: aspect === 16 / 9 ? 'var(--primary)' : '#888', background: 'none', border: 'none', cursor: 'pointer' }}>16:9</button>
                </div>

                {/* Filters Scroller */}
                <div style={{
                    display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '15px',
                    marginBottom: '20px', scrollbarWidth: 'none'
                }}>
                    {FILTERS.map(f => (
                        <div
                            key={f.name}
                            onClick={() => setSelectedFilter(f.filter)}
                            style={{ textAlign: 'center', cursor: 'pointer', minWidth: '80px' }}
                        >
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '8px', margin: '0 auto 8px',
                                background: `url(${image}) center/cover`,
                                filter: f.filter, border: selectedFilter === f.filter ? '2px solid var(--primary)' : '1px solid #333'
                            }}></div>
                            <span style={{ fontSize: '10px', color: '#fff' }}>{f.name}</span>
                        </div>
                    ))}
                </div>

                {/* Adjustments */}
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px', alignItems: 'center' }}>
                    <span style={{ color: '#fff', fontSize: '12px' }}>Brightness</span>
                    <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(e.target.value)} style={{ width: '100%' }} />

                    <span style={{ color: '#fff', fontSize: '12px' }}>Contrast</span>
                    <input type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(e.target.value)} style={{ width: '100%' }} />

                    <span style={{ color: '#fff', fontSize: '12px' }}>Saturation</span>
                    <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(e.target.value)} style={{ width: '100%' }} />
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
