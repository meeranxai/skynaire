import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../api/config';

const AutonomousThemeContext = createContext();

export const useAutonomousTheme = () => useContext(AutonomousThemeContext);

export const AutonomousThemeProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [aiTheme, setAiTheme] = useState(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);

    // Initial Load
    useEffect(() => {
        if (currentUser) {
            fetchAITheme();
        }
    }, [currentUser]);

    // Poll for updates (Every minute - checking for AI decisions)
    useEffect(() => {
        if (!currentUser) return;

        const interval = setInterval(() => {
            fetchAITheme();
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [currentUser]);

    const fetchAITheme = async () => {
        if (!currentUser) return;

        try {
            // Get user personalized theme
            const res = await fetch(`${API_BASE_URL}/api/autonomous/theme/user/${currentUser.uid}`);
            const data = await res.json();

            if (data.success && data.theme) {
                // If theme timestamp is newer than what we have, apply it
                if (!lastUpdate || data.theme.timestamp > lastUpdate) {
                    console.log('[Autonomous Theme] Applying new AI theme:', data.theme);
                    applyTheme(data.theme);
                    setAiTheme(data.theme);
                    setLastUpdate(data.theme.timestamp);

                    // Show subtle visual cue that AI updated something (optional)
                    // showNotification('AI optimized your interface based on usage'); 
                }
            }
        } catch (error) {
            console.warn('[Autonomous Theme] Failed to fetch theme:', error);
        }
    };

    const applyTheme = (theme) => {
        const root = document.documentElement;

        // Colors
        if (theme.colors) {
            root.style.setProperty('--ai-primary-hue', theme.colors.primaryHue);
            root.style.setProperty('--ai-saturation', `${theme.colors.saturation}%`);
            root.style.setProperty('--ai-lightness', `${theme.colors.lightness}%`);

            // Recalculate robust palette based on HSL
            const hue = theme.colors.primaryHue;
            const sat = theme.colors.saturation;
            const lit = theme.colors.lightness;

            root.style.setProperty('--primary', `hsl(${hue}, ${sat}%, ${lit}%)`);
            root.style.setProperty('--primary-hover', `hsl(${hue}, ${sat}%, ${Math.max(0, lit - 10)}%)`);
            root.style.setProperty('--primary-light', `hsl(${hue}, ${sat}%, ${Math.min(100, lit + 25)}%)`);
            root.style.setProperty('--primary-dark', `hsl(${hue}, ${sat}%, ${Math.max(0, lit - 20)}%)`);

            // Background tints
            root.style.setProperty('--primary-bg', `hsl(${hue}, ${sat}%, 96%)`);
        }

        // Spacing
        if (theme.spacing) {
            const factor = theme.spacing.factor || 1;
            root.style.setProperty('--ai-spacing-factor', factor);
            // Updating standard spacing vars if they use the factor
        }

        // Typography
        if (theme.typography) {
            const scale = theme.typography.scale || 1;
            root.style.setProperty('--ai-font-scale', scale);
            root.style.setProperty('font-size', `${16 * scale}px`); // Base font size scaling
        }

        // Layout
        if (theme.layout) {
            root.style.setProperty('--ai-border-radius', `${theme.layout.borderRadius}px`);
            root.style.setProperty('--border-radius-lg', `${theme.layout.borderRadius}px`);
        }
    };

    const triggerManualOptimization = async () => {
        setIsOptimizing(true);
        try {
            await fetch(`${API_BASE_URL}/api/autonomous/optimize`, { method: 'POST' });
            // Fetch immediately after likely update
            setTimeout(fetchAITheme, 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsOptimizing(false);
        }
    };

    const value = {
        aiTheme,
        isOptimizing,
        triggerManualOptimization
    };

    return (
        <AutonomousThemeContext.Provider value={value}>
            {children}
        </AutonomousThemeContext.Provider>
    );
};
