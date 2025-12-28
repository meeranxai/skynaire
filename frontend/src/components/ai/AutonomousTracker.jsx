import React from 'react';
import { useAutonomousTracking } from '../../hooks/useAutonomousTracking';

// Invisible component to handle side-effect tracking
const AutonomousTracker = () => {
    useAutonomousTracking();
    return null;
};

export default AutonomousTracker;
