import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../api/config';

// Buffer for batching events to reduce API calls
const EVENT_BUFFER_SIZE = 10;
const FLUSH_INTERVAL = 30000; // 30 seconds

export const useAutonomousTracking = () => {
    const location = useLocation();
    const { currentUser } = useAuth();
    const eventBuffer = useRef([]);
    const flushTimer = useRef(null);
    const sessionStartTime = useRef(Date.now());
    const sessionId = useRef(`sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    // Flush events to backend
    const flushEvents = useCallback(async () => {
        if (eventBuffer.current.length === 0) return;

        const eventsToSend = [...eventBuffer.current];
        eventBuffer.current = [];

        try {
            // Group events by type for efficient sending
            const interactions = eventsToSend.filter(e => e.category === 'interaction');
            const performance = eventsToSend.filter(e => e.category === 'performance');

            if (interactions.length > 0) {
                // Send in batch (backend handles single event, we'll map loop for now or update backend to accept array)
                // For this implementation, we'll just send the last significant one or loop
                // Optimization: In production, backend should accept batch

                // Sending the most recent/significant event for now to avoid spamming dev server
                const latest = interactions[interactions.length - 1];
                await fetch(`${API_BASE_URL}/api/autonomous/track/interaction`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(latest)
                });
            }

            if (performance.length > 0) {
                const latest = performance[performance.length - 1];
                await fetch(`${API_BASE_URL}/api/autonomous/track/performance`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(latest)
                });
            }

        } catch (error) {
            console.warn('[Autonomous Tracking] Failed to flush events:', error);
            // Re-queue failed events (optional, risky if repetitive error)
        }
    }, []);

    // Add event to buffer
    const trackEvent = useCallback((event) => {
        if (!currentUser) return; // Don't track anonymous for now

        const enrichedEvent = {
            ...event,
            userId: currentUser.uid,
            sessionId: sessionId.current,
            timestamp: Date.now(),
            page: location.pathname,
            device: getDeviceInfo()
        };

        eventBuffer.current.push(enrichedEvent);

        if (eventBuffer.current.length >= EVENT_BUFFER_SIZE) {
            flushEvents();
        }
    }, [currentUser, location.pathname, flushEvents]);

    // Track Page Views & Performance
    useEffect(() => {
        // Reset timer on page change
        sessionStartTime.current = Date.now();

        // Track navigation
        trackEvent({
            category: 'interaction',
            type: 'page_view',
            target: location.pathname
        });

        // Performance Observer
        if (window.PerformanceObserver) {
            const entryHandler = (list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
                        trackEvent({
                            category: 'performance',
                            type: 'fcp',
                            loadTime: entry.startTime,
                            fcp: entry.startTime
                        });
                    }
                }
            };

            const observer = new PerformanceObserver(entryHandler);
            observer.observe({ type: 'paint', buffered: true });

            return () => observer.disconnect();
        }

    }, [location.pathname, trackEvent]);

    // Periodic Flush
    useEffect(() => {
        flushTimer.current = setInterval(flushEvents, FLUSH_INTERVAL);
        return () => clearInterval(flushTimer.current);
    }, [flushEvents]);

    // Click Tracking
    useEffect(() => {
        const handleClick = (e) => {
            // Only track interactions with interactive elements
            const target = e.target.closest('button, a, input, select, .interactive');
            if (!target) return;

            const rect = target.getBoundingClientRect();

            trackEvent({
                category: 'interaction',
                type: 'click',
                target: target.tagName + (target.id ? `#${target.id}` : '') + (target.className ? `.${target.className.split(' ')[0]}` : ''),
                coordinates: { x: e.clientX, y: e.clientY },
                viewport: { width: window.innerWidth, height: window.innerHeight }
            });
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [trackEvent]);

    // Manual Tracking Helpers
    const trackEngagement = (type, targetId, context) => {
        fetch(`${API_BASE_URL}/api/autonomous/track/engagement`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser?.uid,
                type,
                targetId,
                context,
                timestamp: Date.now()
            })
        }).catch(err => console.warn('Engagement track failed', err));
    };

    return { trackEngagement };
};

// Helper: Get Device Info
const getDeviceInfo = () => {
    return {
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        connection: navigator.connection ? navigator.connection.effectiveType : 'unknown'
    };
};
