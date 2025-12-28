import React, { useState } from 'react';

const EditScreen = ({ mediaFile, onNext, onBack }) => {
    // Basic Stub for Edit Logic
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(15);
    const [totalDuration, setTotalDuration] = useState(60); // Stub max

    // In a real app, we would use loadedmetadata event from video to set max duration

    return (
        <div style={{ height: '100%', background: '#000', display: 'flex', flexDirection: 'column' }}>
            {/* Preview Area (70%) */}
            <div style={{ flex: 7, position: 'relative', background: '#222' }}>
                {mediaFile && (
                    <video
                        src={URL.createObjectURL(mediaFile)}
                        controls
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    // Simulate trimming visuals by seeking (stub)
                    />
                )}
            </div>

            {/* Timeline Toolbar (30%) */}
            <div style={{ flex: 3, background: '#111', borderTop: '1px solid #333', padding: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#fff', fontSize: '12px' }}>{startTime}s</span>
                    <span style={{ color: '#fff', fontSize: '12px' }}>{endTime}s</span>
                </div>

                {/* Timeline Visualization */}
                <div style={{
                    height: '60px', background: '#333', borderRadius: '4px', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
                    position: 'relative'
                }}>
                    {/* Film strip simulation */}
                    <div style={{ display: 'flex', width: '100%', opacity: 0.5 }}>
                        {[...Array(10)].map((_, i) => (
                            <div key={i} style={{ flex: 1, borderRight: '1px solid #444', height: '60px', background: i % 2 === 0 ? '#555' : '#444' }}></div>
                        ))}
                    </div>

                    {/* Trim Handles Overlay (Active Area) */}
                    <div style={{
                        position: 'absolute', top: 0, bottom: 0,
                        left: `${(startTime / totalDuration) * 100}%`, right: `${100 - (endTime / totalDuration) * 100}%`,
                        border: '2px solid #ff2d55', borderRadius: '4px', pointerEvents: 'none'
                    }}></div>
                </div>

                {/* Sliders (Quick Hack for Interaction) */}
                <div style={{ width: '100%', padding: '0 10px', marginBottom: '10px' }}>
                    <input
                        type="range" min="0" max={totalDuration} value={startTime}
                        onChange={(e) => setStartTime(Math.min(e.target.value, endTime - 1))}
                        style={{ width: '100%', marginBottom: '5px' }}
                    />
                    <input
                        type="range" min="0" max={totalDuration} value={endTime}
                        onChange={(e) => setEndTime(Math.max(e.target.value, startTime + 1))}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Tools */}
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <button style={{ background: 'none', border: 'none', color: '#ff2d55', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <i className="fas fa-cut"></i> <span style={{ fontSize: '10px' }}>Trim</span>
                    </button>
                    <button style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <i className="fas fa-font"></i> <span style={{ fontSize: '10px' }}>Text</span>
                    </button>
                    <button style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <i className="fas fa-music"></i> <span style={{ fontSize: '10px' }}>Audio</span>
                    </button>
                </div>
            </div>

            {/* Nav */}
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={onBack} style={{ color: '#fff', background: 'none', border: 'none' }}>Back</button>
                <button
                    onClick={() => onNext(mediaFile)}
                    style={{ background: '#ff2d55', color: '#fff', border: 'none', borderRadius: '20px', padding: '8px 24px', fontWeight: 'bold' }}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default EditScreen;
