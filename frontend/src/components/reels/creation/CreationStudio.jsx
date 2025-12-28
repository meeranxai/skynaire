import React, { useState } from 'react';
import CaptureScreen from './CaptureScreen';
import EditScreen from './EditScreen';
import PublishScreen from './PublishScreen';

const CreationStudio = ({ onClose, onPublishSuccess }) => {
    const [step, setStep] = useState('CAPTURE'); // CAPTURE, EDIT, PUBLISH
    const [mediaFile, setMediaFile] = useState(null); // The raw video file
    const [editedFile, setEditedFile] = useState(null); // Processed file (stub for Phase 2)
    const [metadata, setMetadata] = useState({});

    // Step 1: Media Captured/Imported
    const handleMediaReady = (file) => {
        setMediaFile(file);
        setStep('EDIT');
    };

    // Step 2: Editing Complete
    const handleEditComplete = (finalFile) => {
        setEditedFile(finalFile || mediaFile); // If no edits, use original
        setStep('PUBLISH');
    };

    // Step 3: Publish
    const handlePublish = (finalMetadata) => {
        // Here we would normally trigger the API call or pass back to parent
        // For structure, we'll pass to parent
        onPublishSuccess(editedFile || mediaFile, finalMetadata);
    };

    return (
        <div className="creation-studio-overlay" style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            backgroundColor: '#000', display: 'flex', flexDirection: 'column'
        }}>
            {/* Top Bar for Close (Common) */}
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px' }}>
                    <i className="fas fa-times"></i>
                </button>
                <div style={{ color: '#fff', fontWeight: 'bold' }}>
                    {step === 'CAPTURE' && 'New Reel'}
                    {step === 'EDIT' && 'Edit Reel'}
                    {step === 'PUBLISH' && 'New Post'}
                </div>
                <div style={{ width: '24px' }}></div> {/* Spacer */}
            </div>

            {/* Screens */}
            <div style={{ flex: 1, position: 'relative' }}>
                {step === 'CAPTURE' && <CaptureScreen onNext={handleMediaReady} />}
                {step === 'EDIT' && <EditScreen mediaFile={mediaFile} onNext={handleEditComplete} onBack={() => setStep('CAPTURE')} />}
                {step === 'PUBLISH' && <PublishScreen mediaFile={editedFile || mediaFile} onPublish={handlePublish} onBack={() => setStep('EDIT')} />}
            </div>
        </div>
    );
};

export default CreationStudio;
