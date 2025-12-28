import React from 'react';
import { NavLink } from 'react-router-dom';

const SuggestedReels = () => {
    // Mock data
    const reels = [1, 2, 3, 4, 5];

    return (
        <div style={{ margin: 'var(--space-6) 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)', padding: '0 var(--space-2)' }}>
                <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-play-circle" style={{ color: 'var(--accent-pink)' }}></i>
                    Suggested Reels
                </h3>
                <NavLink to="/reels" style={{ fontSize: 'var(--text-sm)', fontWeight: '600' }}>See all</NavLink>
            </div>

            <div style={{
                display: 'flex',
                gap: 'var(--space-3)',
                overflowX: 'auto',
                paddingBottom: 'var(--space-2)',
                scrollSnapType: 'x mandatory'
            }} className="no-scrollbar">
                {reels.map(id => (
                    <div key={id} style={{
                        minWidth: '140px',
                        height: '220px',
                        borderRadius: 'var(--radius-lg)',
                        background: `linear-gradient(45deg, #4158D0, #C850C0, #FFCC70)`,
                        position: 'relative',
                        scrollSnapAlign: 'start',
                        cursor: 'pointer',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
                            <i className="fas fa-play" style={{ fontSize: '10px', marginRight: '4px' }}></i>
                            10.{id}k
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuggestedReels;
