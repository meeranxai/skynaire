import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/login.css';

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
            <div className="auth-page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="auth-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="logo-container" style={{ marginBottom: '20px' }}>
                        <span className="logo-text">G-NETWORK</span>
                    </div>
                    <p>Verifying authentication status...</p>
                    <div className="loading-spinner"></div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '20px' }}>
                        Checking Firebase and Backend synchronization...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page-wrapper">
            <div className="auth-background">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>

            <div className="auth-card">
                <div className="auth-header">
                    <div className="logo-container">
                        <span className="logo-text">G-NETWORK</span>
                    </div>
                    <h2 className="auth-title">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="auth-subtitle">
                        {isSignUp 
                            ? 'Join the professional developer community' 
                            : 'Enter your credentials to access your account'}
                    </p>
                </div>

                {error && <div className="auth-error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    {isSignUp && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div className="label-row">
                            <label>Password</label>
                            {!isSignUp && <a href="#" className="forgot-password">Forgot password?</a>}
                        </div>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? (
                            <span className="spinner-small"></span>
                        ) : (
                            isSignUp ? 'Get Started' : 'Sign In'
                        )}
                    </button>

                    <div className="divider">
                        <span>or continue with</span>
                    </div>

                    <div className="social-actions">
                        <button 
                            type="button" 
                            onClick={handleGoogleLogin} 
                            className="social-btn"
                            disabled={loading}
                        >
                            <img src="/images/Google_Favicon_2025.svg.webp" alt="Google" />
                            {loading ? 'Connecting...' : 'Google'}
                        </button>
                        <button type="button" className="social-btn">
                            <img src="/images/github.png" alt="GitHub" />
                            GitHub
                        </button>
                    </div>
                </form>

                <div className="auth-footer">
                    <p>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button 
                            type="button" 
                            onClick={() => setIsSignUp(!isSignUp)} 
                            className="toggle-auth-btn"
                        >
                            {isSignUp ? 'Sign in' : 'Sign up'}
                        </button>
                    </p>
                    <a href="/" className="back-link">Back to Home</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
