import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// CSS imported via individual imports in main.jsx ✅

const Login = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { currentUser, loading: authLoading } = useAuth();

    useEffect(() => {
        if (currentUser && !authLoading) {
            console.log("User detected, navigating to home...");
            navigate('/', { replace: true });
        }
    }, [currentUser, authLoading, navigate]);

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        console.log("🚀 Initiating Google Popup Login...");
        
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider);
            console.log("✅ Google Popup Login Success:", result.user.email);
            // onAuthStateChanged in AuthContext will handle the rest
        } catch (err) {
            console.error("❌ Google Login Failed:", err.code, err.message);
            if (err.code === 'auth/popup-blocked') {
                setError('Popup blocked! Please allow popups for this site or try again.');
            } else if (err.code === 'auth/popup-closed-by-user') {
                setError('Login cancelled. Please try again.');
            } else {
                setError(`Login Error: ${err.message.replace('Firebase:', '').trim()}`);
            }
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                if (name) {
                    await updateProfile(userCredential.user, { displayName: name });
                }
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            console.error("Login/Signup error:", err);
            setError(err.message.replace('Firebase:', '').trim());
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="auth-page-wrapper">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div className="logo-container">
                        <span className="logo-text">G-NETWORK</span>
                    </div>
                    <h2 className="auth-title">Loading...</h2>
                    <p className="auth-subtitle">Verifying authentication status</p>
                    <div className="loading-spinner"></div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--login-text-light)', marginTop: '15px' }}>
                        Checking Firebase and Backend synchronization...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page-wrapper">
            {/* Animated Background */}
            <div className="auth-background">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>

            {/* Main Login Card */}
            <div className="auth-card">
                {/* Header Section */}
                <div className="auth-header">
                    <div className="logo-container">
                        <span className="logo-text">G-NETWORK</span>
                    </div>
                    <h1 className="auth-title">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="auth-subtitle">
                        {isSignUp 
                            ? 'Join our professional developer community today' 
                            : 'Sign in to access your account and continue'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="auth-error-message">
                        {error}
                    </div>
                )}

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Name Field (Sign Up Only) */}
                    {isSignUp && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                className="form-input"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoComplete="name"
                            />
                        </div>
                    )}

                    {/* Email Field */}
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <div className="label-row">
                            <label htmlFor="password">Password</label>
                            {!isSignUp && (
                                <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
                                    Forgot password?
                                </a>
                            )}
                        </div>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete={isSignUp ? "new-password" : "current-password"}
                        />
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? (
                            <div className="spinner-small"></div>
                        ) : (
                            isSignUp ? 'Create Account' : 'Sign In'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="divider">
                    <span>or continue with</span>
                </div>

                {/* Social Login Buttons */}
                <div className="social-actions">
                    <button 
                        type="button" 
                        onClick={handleGoogleLogin} 
                        className="social-btn"
                        disabled={loading}
                    >
                        <img src="/images/Google_Favicon_2025.svg.webp" alt="Google" />
                        Google
                    </button>
                    <button 
                        type="button" 
                        className="social-btn"
                        disabled={loading}
                        onClick={() => setError('GitHub login coming soon!')}
                    >
                        <img src="/images/github.png" alt="GitHub" />
                        GitHub
                    </button>
                </div>

                {/* Footer */}
                <div className="auth-footer">
                    <p>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button 
                            type="button" 
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                                setEmail('');
                                setPassword('');
                                setName('');
                            }} 
                            className="toggle-auth-btn"
                            disabled={loading}
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                    <a href="/" className="back-link">← Back to Home</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
