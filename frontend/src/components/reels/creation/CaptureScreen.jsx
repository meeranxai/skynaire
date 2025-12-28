import React, { useRef, useState } from 'react';

const CaptureScreen = ({ onNext }) => {
    const fileInputRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);

    // Stub for Camera Access - In a real app we'd use navigator.mediaDevices.getUserMedia
    // For web MVP, we focus on File Upload primarily as browser camera API can be flaky without HTTPS/Permissions

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            onNext(file);
        }
    };

    const toggleRecord = () => {
        // Simulation of recording
        setIsRecording(!isRecording);
        if (!isRecording) {
            setTimeout(() => {
                alert("Simulated Recording Finished (Use Upload for now)");
                setIsRecording(false);
            }, 3000);
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111' }}>

            {/* Camera Viewfinder Placeholder */}
            <div style={{
                width: '100%', height: '100%', position: 'absolute', top: 0, left: 0,
                background: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555'
            }}>
                <i className="fas fa-camera" style={{ fontSize: '100px', opacity: 0.2 }}></i>
                <p style={{ position: 'absolute', bottom: '150px', color: '#aaa' }}>Camera Mode (Preview)</p>
            </div>

            {/* Controls */}
            <div style={{ position: 'absolute', bottom: '40px', width: '100%', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 20px' }}>

                {/* Gallery Import */}
                <div onClick={() => fileInputRef.current.click()} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', border: '2px solid #fff', overflow: 'hidden', background: '#333' }}>
                        <img src="https://via.placeholder.com/40" alt="Gallery" />
                    </div>
                    <span style={{ color: '#fff', fontSize: '12px' }}>Gallery</span>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="video/*" style={{ display: 'none' }} />

                {/* Shutter Button */}
                <div onClick={toggleRecord} style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    border: '5px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s'
                }}>
                    <div style={{
                        width: isRecording ? '30px' : '65px',
                        height: isRecording ? '30px' : '65px',
                        borderRadius: isRecording ? '4px' : '50%',
                        background: '#ff2d55', transition: 'all 0.2s'
                    }}></div>
                </div>

                {/* Effects / Flip (Stubs) */}
                <div style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-magic" style={{ color: '#fff' }}></i>
                    </div>
                    <span style={{ color: '#fff', fontSize: '12px' }}>Effects</span>
                </div>
            </div>

            {/* Side Tools */}
            <div style={{ position: 'absolute', top: '60px', right: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <i className="fas fa-sync-alt" style={{ color: '#fff', fontSize: '20px', cursor: 'pointer' }}></i>
                <i className="fas fa-bolt" style={{ color: '#fff', fontSize: '20px', cursor: 'pointer' }}></i>
                <i className="fas fa-clock" style={{ color: '#fff', fontSize: '20px', cursor: 'pointer' }}></i>
            </div>
        </div>
    );
};

export default CaptureScreen;
