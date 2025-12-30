import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/layout/Layout';
import { useAuth } from './contexts/AuthContext';
import AppProviders from './contexts/AppProviders';
import PerformanceMonitor from './components/performance/PerformanceMonitor';
import WebSocketDebug from './components/debug/WebSocketDebug';
import CSSDebug from './components/debug/CSSDebug';
import FrontendDebug from './components/debug/FrontendDebug';

// Lazy load pages
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

const LoadingSpinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
    </div>
);

const ProtectedRoute = () => {
    const { currentUser, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    if (!currentUser) return <Navigate to="/login" replace />;
    return <Outlet />;
};

function App() {
    return (
        <AppProviders>
            <Router>
                <PerformanceMonitor />
                <WebSocketDebug />
                <CSSDebug />
                <FrontendDebug />
                <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/design-showcase" element={<DesignShowcase />} />
                        <Route element={<Layout />}>
                            <Route element={<ProtectedRoute />}>
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
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </Router>
        </AppProviders>
    );
}

export default App;
