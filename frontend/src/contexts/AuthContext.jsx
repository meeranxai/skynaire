import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../api/config';
import { auth } from '../firebase';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("🔑 Initializing Auth Listener...");
        let isMounted = true;
        let redirectCheckDone = false;

        // 1. Listen for auth state changes immediately
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!isMounted) return;

            console.log("🔄 Auth State Changed:", user ? `Logged in as ${user.email}` : "Logged out");
            
            if (user) {
                setCurrentUser(user);
                setLoading(false);

                try {
                    console.log("Syncing user with backend...");
                    const res = await fetch(`${API_BASE_URL}/api/users/sync`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            firebaseUid: user.uid,
                            email: user.email,
                            displayName: user.displayName || 'New User',
                            photoURL: user.photoURL
                        })
                    });

                    if (res.ok) {
                        console.log("✅ User Synced with Backend");
                    } else {
                        const errorData = await res.json().catch(() => ({}));
                        console.error("❌ Sync Error:", res.status, errorData);
                    }
                } catch (err) {
                    console.error("❌ Failed to sync user:", err);
                }
            } else {
                setCurrentUser(null);
                // Only set loading false if we're not waiting for a redirect result
                if (redirectCheckDone) {
                    setLoading(false);
                }
            }
        });

        // 2. Check for redirect results in the background
        const checkRedirect = async () => {
            try {
                console.log("🔍 Checking for redirect result...");
                const result = await getRedirectResult(auth);
                if (result && isMounted) {
                    console.log("✅ Redirect result captured:", result.user.email);
                    setCurrentUser(result.user);
                }
            } catch (err) {
                console.error("❌ Global Redirect Error:", err);
            } finally {
                redirectCheckDone = true;
                // If we're logged out, now we can safely stop loading
                if (isMounted && !auth.currentUser) {
                    setLoading(false);
                }
            }
        };

        checkRedirect();

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    const value = {
        currentUser,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
