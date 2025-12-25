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
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // Navigate handled by useEffect
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                if (name) {
                    await updateProfile(userCredential.user, { displayName: name });
                }
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            // Navigate handled by useEffect
        } catch (err) {
            console.error(err);
            setError(err.message.replace('Firebase:', '').trim());
        }
    };

    return (
        <main className="login-container">
            <section className="login-brand-side" style={{
                background: `url('/images/illust.jpg') center/cover no-repeat`
            }}>
                <div className="brand-overlay"></div>
                <div className="brand-content">
                    <nav className="auth-nav">
                        {/* We can't link to index.html directly in React router usually, but for "Back" maybe just reload or go home */}
                        <a href="/" className="back-home">
                            <i className="fas fa-arrow-left"></i>
                            <span>Don't want to login? Back</span>
                        </a>
                    </nav>

                    <header className="brand-header">
                        <h1 className="logo-name">G-<span>Network</span></h1>
                        <h2 className="hero-text">The Gateway to <br />Tech Excellence.</h2>
                        <p className="brand-description">
                            Join the elite community of developers. Login to access personalized roadmaps,
                            premium tutorials, and expert-led tech insights.
                        </p>
                    </header>

                    <div className="brand-stats">
                        <div className="stat-item">
                            <span className="stat-number">50k+</span>
                            <p className="stat-label">Active Readers</p>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">200+</span>
                            <p className="stat-label">Premium Guides</p>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">24/7</span>
                            <p className="stat-label">Support</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="login-form-side">
                <div className="form-box">
                    <header className="form-header">
                        <h2>{isSignUp ? 'Join G-Network' : 'Welcome Back'}</h2>
                        <p>{isSignUp ? 'Create your account' : 'Sign in to continue your journey'}</p>
                    </header>

                    {error && <div className="auth-message error">{error}</div>}

                    <form onSubmit={handleSubmit} autoComplete="on">
                        {isSignUp && (
                            <div className="input-group">
                                <label><i className="fas fa-user"></i> Full Name</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                    <i className="fas fa-user-circle"></i>
                                </div>
                            </div>
                        )}

                        <div className="input-group">
                            <label htmlFor="email"><i className="fas fa-envelope"></i> Email Address</label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="e.g. user@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <i className="fas fa-at"></i>
                            </div>
                        </div>

                        <div className="input-group">
                            <div className="label-row">
                                <label htmlFor="password"><i className="fas fa-lock"></i> Password</label>
                                <a href="#" className="forgot-link">Forgot?</a>
                            </div>
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <i className="fas fa-key"></i>
                            </div>
                        </div>

                        <button type="submit" className="btn-main-login">
                            <span>{isSignUp ? 'Create Account' : 'Sign In to Account'}</span>
                            <i className="fas fa-arrow-right"></i>
                        </button>

                        <div className="auth-separator">
                            <span>Or continue with</span>
                        </div>

                        <div className="social-grid">
                            <button type="button" onClick={handleGoogleLogin} className="social-btn google-auth">
                                <img src="/images/Google_Favicon_2025.svg.webp" alt="Google" />
                                <span>Google</span>
                            </button>
                            <button type="button" className="social-btn github-auth">
                                <img src="/images/github.png" alt="GitHub" />
                                <span>GitHub</span>
                            </button>
                        </div>

                        <footer className="form-footer">
                            <p>
                                {isSignUp ? 'Already have an account? ' : 'New to G-Network? '}
                                <span onClick={() => setIsSignUp(!isSignUp)} className="switch-auth" style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }}>
                                    {isSignUp ? 'Sign In' : 'Create your free account'}
                                </span>
                            </p>
                        </footer>
                    </form>
                </div>
            </section>
        </main>
    );
};

export default Login;
