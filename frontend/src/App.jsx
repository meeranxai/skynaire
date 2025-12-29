import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/layout/Layout';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { AutonomousThemeProvider } from './contexts/AutonomousThemeContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SocketProvider } from './contexts/SocketContext';
import PerformanceMonitor from './components/performance/PerformanceMonitor';
import WebSocketDebug from './components/debug/WebSocketDebug';

// Lazy load components to reduce initial bundle size
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const CreatePostPage = lazy(() => import('./pages/CreatePostPage'));
const Explore = lazy(() => import('./pages/Explore'));
const Reels = lazy(() => import('./pages/Reels'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Messages = lazy(() => import('./pages/Messages'));
const DesignShowcase = lazy(() => import('./pages/DesignShowcase'));
const Archive = lazy(() => import('./pages/Archive'));
const Settings = lazy(() => import('./pages/SettingsComplete'));
const AutonomousTracker = lazy(() => import('./components/ai/AutonomousTracker'));
const AIChatBot = lazy(() => import('./components/ai/AIChatBot'));
const FrontendDebug = lazy(() => import('./components/debug/FrontendDebug'));

// Loading component
const LoadingSpinner = () => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: 'var(--background-primary)',
        color: 'var(--text-primary)'
    }}>
        <div style={{ textAlign: 'center' }}>
            <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '3px solid var(--accent-color)', 
                borderTop: '3px solid transparent', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite',
                margin: '0 auto 10px'
            }}></div>
            Loading...
        </div>
    </div>
);

// Protected Route Wrapper with memory optimization
const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Suspense fallback={<LoadingSpinner />}>
            {children}
            <FrontendDebug />
        </Suspense>
    );
};

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <Router>
                    <ToastProvider>
                        <NavigationProvider>
                            <NotificationProvider>
                                <PerformanceMonitor />
                                <WebSocketDebug />
                                <Suspense fallback={<LoadingSpinner />}>
                                    <Routes>
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/design-showcase" element={<DesignShowcase />} />

                                        {/* Protected Routes */}
                                        <Route element={
                                            <ProtectedRoute>
                                                <AutonomousThemeProvider>
                                                    <Suspense fallback={<div>Loading AI features...</div>}>
                                                        <AutonomousTracker />
                                                        <AIChatBot />
                                                    </Suspense>
                                                    <Layout />
                                                </AutonomousThemeProvider>
                                            </ProtectedRoute>
                                        }>
                                            <Route path="/" element={<Home />} />
                                            <Route path="/profile" element={<Profile />} />
                                            <Route path="/profile/:uid" element={<Profile />} />
                                            <Route path="/explore" element={<Explore />} />
                                            <Route path="/reels" element={<Reels />} />
                                            <Route path="/notifications" element={<Notifications />} />
                                            <Route path="/messages" element={<Messages />} />
                                            <Route path="/create" element={<CreatePostPage />} />
                                            <Route path="/archive" element={<Archive />} />
                                            <Route path="/settings" element={<Settings />} />
                                        </Route>

                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </Suspense>
                            </NotificationProvider>
                        </NavigationProvider>
                    </ToastProvider>
                </Router>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;
