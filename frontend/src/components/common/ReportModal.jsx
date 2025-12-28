import React, { useState } from 'react';
import { API_BASE_URL } from '../../api/config';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/PostMenu.css'; // Reusing styles or creating specific ones

const ReportModal = ({ targetId, targetType = 'post', targetOwnerId, isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const reportOptions = [
        { id: 'spam', label: 'Spam', tier: 1 },
        { id: 'misinformation', label: 'False Information', tier: 1 },
        { id: 'nudity', label: 'Nudity or Sexual Activity', tier: 1 },
        { id: 'harassment', label: 'Harassment or Bullying', tier: 2 },
        { id: 'hate_speech', label: 'Hate Speech', tier: 2 },
        { id: 'violence', label: 'Violence or Dangerous Orgs', tier: 2 },
        { id: 'self_harm', label: 'Suicide or Self-Injury', tier: 2 },
        { id: 'other', label: 'Something Else', tier: 3 },
    ];

    const handleNext = () => {
        const option = reportOptions.find(o => o.id === category);
        if (option.tier === 3 || option.tier === 2) {
            setStep(2); // Ask for details for Tier 2/3
        } else {
            handleSubmit(); // Auto-submit for Tier 1
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reporter: currentUser?.uid,
                    reporterName: currentUser?.displayName,
                    targetId,
                    targetType,
                    targetOwnerId,
                    reasonCategory: category,
                    description: description || 'Tier 1/2 Quick Report'
                })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setStep(1);
                    setCategory('');
                    setDescription('');
                }, 2000);
            } else {
                alert("Failed to submit report. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("Error submitting report.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay active" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)'
        }}>
            <div className="card" style={{ width: '90%', maxWidth: '400px', borderRadius: '16px', background: 'var(--background-elevated)', padding: '0', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                {success ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ width: '60px', height: '60px', background: '#ecfdf5', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-check" style={{ fontSize: '30px', color: '#10b981' }}></i>
                        </div>
                        <h3 style={{ margin: '0 0 10px' }}>Thanks for reporting</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>We'll review this shortly to keep G-Network safe.</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontWeight: 'bold' }}>
                                {step === 1 ? 'Report' : 'Add Details'}
                            </div>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>&times;</button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
                            {step === 1 ? (
                                <div>
                                    <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Why are you reporting this?</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {reportOptions.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setCategory(opt.id)}
                                                style={{
                                                    textAlign: 'left', padding: '12px 15px', borderRadius: '8px', border: '1px solid var(--border-light)',
                                                    background: category === opt.id ? 'var(--primary-light)' : 'transparent',
                                                    color: category === opt.id ? 'var(--primary)' : 'var(--text-primary)',
                                                    cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between'
                                                }}
                                            >
                                                {opt.label}
                                                {category === opt.id && <i className="fas fa-check-circle"></i>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h4 style={{ marginTop: 0 }}>Anything else we should know?</h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Please provide more details about why this violates our community guidelines.</p>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="4"
                                        placeholder="Add details..."
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-default)', background: 'var(--bg-secondary)', resize: 'none', outline: 'none' }}
                                    ></textarea>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '15px 20px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            {step === 2 && (
                                <button onClick={() => setStep(1)} className="btn btn-ghost" disabled={loading}>Back</button>
                            )}
                            <button
                                onClick={step === 1 ? handleNext : handleSubmit}
                                className="btn btn-primary"
                                disabled={!category || loading}
                                style={{ width: step === 1 ? '100%' : 'auto' }}
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportModal;
