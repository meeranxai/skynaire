import React, { useState } from 'react';

/**
 * Design System Showcase
 * Demo page displaying all components from the G-Network Design System
 */
const DesignShowcase = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('dark-mode');
    };

    return (
        <div style={{ paddingBottom: 'var(--space-16)' }}>
            {/* Header */}
            <nav className="navbar">
                <div className="navbar-brand">
                    <i className="fas fa-palette"></i>
                    G-Network Design System
                </div>
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a href="#buttons" className="nav-link active">Components</a>
                    </li>
                    <li className="nav-item">
                        <a href="#forms" className="nav-link">Forms</a>
                    </li>
                    <li className="nav-item">
                        <button className="btn btn-ghost btn-sm" onClick={toggleDarkMode}>
                            <i className={`fas fa-${darkMode ? 'sun' : 'moon'}`}></i>
                        </button>
                    </li>
                </ul>
            </nav>

            <div className="container" style={{ marginTop: 'var(--space-8)' }}>

                {/* Hero Section */}
                <section className="section text-center">
                    <h1 className="text-gradient">G-Network Design System</h1>
                    <p style={{ fontSize: 'var(--text-xl)', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
                        A comprehensive, modern, and scalable design system built with pure CSS.
                        Professional components for building beautiful web applications.
                    </p>
                    <div className="flex justify-center gap-4" style={{ marginTop: 'var(--space-8)' }}>
                        <button className="btn btn-primary btn-lg">
                            <i className="fas fa-rocket"></i>
                            Get Started
                        </button>
                        <button className="btn btn-outline btn-lg">
                            <i className="fas fa-book"></i>
                            Documentation
                        </button>
                    </div>
                </section>

                {/* Color Palette */}
                <section className="section" id="colors">
                    <h2>Color Palette</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="card">
                            <div style={{ height: '100px', background: 'linear-gradient(135deg, var(--primary-600), var(--primary-700))', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}></div>
                            <div className="card-body">
                                <strong>Primary</strong>
                                <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Brand color</p>
                            </div>
                        </div>
                        <div className="card">
                            <div style={{ height: '100px', background: 'linear-gradient(135deg, var(--secondary-500), var(--secondary-600))', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}></div>
                            <div className="card-body">
                                <strong>Secondary</strong>
                                <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Accent color</p>
                            </div>
                        </div>
                        <div className="card">
                            <div style={{ height: '100px', background: 'linear-gradient(135deg, var(--success), var(--success-dark))', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}></div>
                            <div className="card-body">
                                <strong>Success</strong>
                                <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Positive actions</p>
                            </div>
                        </div>
                        <div className="card">
                            <div style={{ height: '100px', background: 'linear-gradient(135deg, var(--error), var(--error-dark))', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}></div>
                            <div className="card-body">
                                <strong>Error</strong>
                                <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Warnings</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Buttons */}
                <section className="section" id="buttons">
                    <h2>Buttons</h2>
                    <div className="card">
                        <div className="card-body">
                            <h4>Button Variants</h4>
                            <div className="flex flex-wrap gap-3">
                                <button className="btn btn-primary">Primary</button>
                                <button className="btn btn-secondary">Secondary</button>
                                <button className="btn btn-outline">Outline</button>
                                <button className="btn btn-ghost">Ghost</button>
                                <button className="btn btn-success">Success</button>
                                <button className="btn btn-danger">Danger</button>
                                <button className="btn btn-primary" disabled>Disabled</button>
                            </div>

                            <h4 style={{ marginTop: 'var(--space-8)' }}>Button Sizes</h4>
                            <div className="flex flex-wrap items-center gap-3">
                                <button className="btn btn-primary btn-sm">Small</button>
                                <button className="btn btn-primary">Default</button>
                                <button className="btn btn-primary btn-lg">Large</button>
                            </div>

                            <h4 style={{ marginTop: 'var(--space-8)' }}>Button with Icons</h4>
                            <div className="flex flex-wrap gap-3">
                                <button className="btn btn-primary">
                                    <i className="fas fa-download"></i>
                                    Download
                                </button>
                                <button className="btn btn-success">
                                    <i className="fas fa-check"></i>
                                    Confirm
                                </button>
                                <button className="btn btn-danger">
                                    <i className="fas fa-trash"></i>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Forms */}
                <section className="section" id="forms">
                    <h2>Form Elements</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card">
                            <div className="card-header">
                                <h3 style={{ margin: 0 }}>Contact Form</h3>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label className="form-label required">Full Name</label>
                                    <input type="text" className="form-input" placeholder="John Doe" />
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Email</label>
                                    <input type="email" className="form-input is-valid" placeholder="john@example.com" />
                                    <div className="form-feedback valid">Email is available!</div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Country</label>
                                    <select className="form-select">
                                        <option>Select your country</option>
                                        <option>United States</option>
                                        <option>United Kingdom</option>
                                        <option>Canada</option>
                                        <option>Australia</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Message</label>
                                    <textarea className="form-textarea" placeholder="Your message here..."></textarea>
                                </div>

                                <div className="form-check">
                                    <input type="checkbox" className="form-check-input" id="terms" />
                                    <label className="form-check-label" htmlFor="terms">
                                        I agree to the terms and conditions
                                    </label>
                                </div>

                                <button className="btn btn-primary w-full" style={{ marginTop: 'var(--space-4)' }}>
                                    Submit Form
                                </button>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h3 style={{ margin: 0 }}>Form Controls</h3>
                            </div>
                            <div className="card-body">
                                <h5>Toggle Switch</h5>
                                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-6)' }}>
                                    <span>Enable notifications</span>
                                    <label className="form-switch">
                                        <input type="checkbox" />
                                        <span className="form-switch-slider"></span>
                                    </label>
                                </div>

                                <h5>Radio Buttons</h5>
                                <div className="form-check">
                                    <input type="radio" className="form-check-input" name="plan" id="free" />
                                    <label className="form-check-label" htmlFor="free">Free Plan</label>
                                </div>
                                <div className="form-check">
                                    <input type="radio" className="form-check-input" name="plan" id="pro" />
                                    <label className="form-check-label" htmlFor="pro">Pro Plan</label>
                                </div>

                                <h5 style={{ marginTop: 'var(--space-6)' }}>Validation States</h5>
                                <input type="text" className="form-input is-valid" placeholder="Valid input" style={{ marginBottom: 'var(--space-3)' }} />
                                <input type="text" className="form-input is-invalid" placeholder="Invalid input" />
                                <div className="form-feedback invalid">This field is required</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Cards */}
                <section className="section" id="cards">
                    <h2>Cards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="card">
                            <div className="card-body text-center">
                                <i className="fas fa-rocket" style={{ fontSize: '3rem', color: 'var(--primary-600)', marginBottom: 'var(--space-4)' }}></i>
                                <h4>Fast Performance</h4>
                                <p>Lightning-fast load times and smooth interactions for the best user experience.</p>
                                <button className="btn btn-outline btn-sm">Learn More</button>
                            </div>
                        </div>

                        <div className="card card-elevated">
                            <div className="card-body text-center">
                                <i className="fas fa-shield-alt" style={{ fontSize: '3rem', color: 'var(--success)', marginBottom: 'var(--space-4)' }}></i>
                                <h4>Secure</h4>
                                <p>Enterprise-grade security features to keep your data safe and protected.</p>
                                <button className="btn btn-outline btn-sm">Learn More</button>
                            </div>
                        </div>

                        <div className="card card-glass">
                            <div className="card-body text-center">
                                <i className="fas fa-mobile-alt" style={{ fontSize: '3rem', color: 'var(--secondary-500)', marginBottom: 'var(--space-4)' }}></i>
                                <h4>Responsive</h4>
                                <p>Perfectly optimized for all devices from mobile to desktop screens.</p>
                                <button className="btn btn-outline btn-sm">Learn More</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Alerts */}
                <section className="section" id="alerts">
                    <h2>Alerts & Notifications</h2>
                    <div className="alert alert-success">
                        <i className="fas fa-check-circle alert-icon"></i>
                        <div className="alert-content">
                            <div className="alert-title">Success!</div>
                            Your changes have been saved successfully.
                        </div>
                    </div>

                    <div className="alert alert-info">
                        <i className="fas fa-info-circle alert-icon"></i>
                        <div className="alert-content">
                            <div className="alert-title">Information</div>
                            New features are now available. Check out the changelog!
                        </div>
                    </div>

                    <div className="alert alert-warning">
                        <i className="fas fa-exclamation-triangle alert-icon"></i>
                        <div className="alert-content">
                            <div className="alert-title">Warning</div>
                            Your session will expire in 5 minutes. Please save your work.
                        </div>
                    </div>

                    <div className="alert alert-error">
                        <i className="fas fa-times-circle alert-icon"></i>
                        <div className="alert-content">
                            <div className="alert-title">Error</div>
                            Failed to process your request. Please try again.
                        </div>
                    </div>
                </section>

                {/* Badges */}
                <section className="section" id="badges">
                    <h2>Badges & Tags</h2>
                    <div className="card">
                        <div className="card-body">
                            <div className="flex flex-wrap gap-3">
                                <span className="badge badge-primary">New</span>
                                <span className="badge badge-secondary">Featured</span>
                                <span className="badge badge-success">Active</span>
                                <span className="badge badge-error">Urgent</span>
                                <span className="badge badge-warning">Pending</span>
                                <span className="badge badge-info">Info</span>
                            </div>

                            <div className="flex items-center gap-3" style={{ marginTop: 'var(--space-6)' }}>
                                <span>Status: </span>
                                <span className="badge badge-dot" style={{ background: 'var(--success)' }}></span>
                                <span style={{ fontSize: 'var(--text-sm)' }}>Online</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Modal Demo */}
                <section className="section" id="modals">
                    <h2>Modals</h2>
                    <div className="card">
                        <div className="card-body text-center">
                            <p>Click the button below to see a modal in action</p>
                            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                                <i className="fas fa-window-restore"></i>
                                Open Modal
                            </button>
                        </div>
                    </div>
                </section>

                {/* Loading Spinner */}
                <section className="section" id="spinners">
                    <h2>Loading States</h2>
                    <div className="card">
                        <div className="card-body">
                            <div className="flex items-center gap-6">
                                <div>
                                    <p style={{ marginBottom: 'var(--space-2)' }}>Small</p>
                                    <div className="spinner spinner-sm"></div>
                                </div>
                                <div>
                                    <p style={{ marginBottom: 'var(--space-2)' }}>Default</p>
                                    <div className="spinner"></div>
                                </div>
                                <div>
                                    <p style={{ marginBottom: 'var(--space-2)' }}>Large</p>
                                    <div className="spinner spinner-lg"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Typography */}
                <section className="section" id="typography">
                    <h2>Typography</h2>
                    <div className="card">
                        <div className="card-body">
                            <h1>Heading 1 (48px)</h1>
                            <h2>Heading 2 (36px)</h2>
                            <h3>Heading 3 (30px)</h3>
                            <h4>Heading 4 (24px)</h4>
                            <h5>Heading 5 (20px)</h5>
                            <h6>Heading 6 (18px)</h6>
                            <p>This is a paragraph with normal body text. It demonstrates the default styling for regular content across the application.</p>
                            <p><strong>Bold text</strong> and <code>inline code</code> examples.</p>
                            <small>Small text for captions and legal notes</small>
                        </div>
                    </div>
                </section>
            </div>

            {/* Modal */}
            <div className={`modal-overlay ${modalOpen ? 'active' : ''}`} onClick={() => setModalOpen(false)}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3 className="modal-title">Example Modal</h3>
                        <button className="modal-close" onClick={() => setModalOpen(false)}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="modal-body">
                        <p>This is a beautiful modal built with the design system.</p>
                        <p style={{ marginBottom: 0 }}>It features smooth animations, accessibility support, and responsive design.</p>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={() => setModalOpen(false)}>
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignShowcase;
