import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';

import Login from './pages/Login';
import CreatePostPage from './pages/CreatePostPage';
import Explore from './pages/Explore';
import Reels from './pages/Reels';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import DesignShowcase from './pages/DesignShowcase';
import Archive from './pages/Archive';
import Settings from './pages/SettingsComplete';
import { useAuth, AuthProvider } from './contexts/AuthContext';

import { AutonomousThemeProvider } from './contexts/AutonomousThemeContext';
import AutonomousTracker from './components/ai/AutonomousTracker';
import AIChatBot from './components/ai/AIChatBot';
import FrontendDebug from './components/debug/FrontendDebug';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--background-primary)' }}>Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            {children}
            <FrontendDebug />
        </>
    );
};

import { NavigationProvider } from './contexts/NavigationContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SocketProvider } from './contexts/SocketContext';

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <Router>
                    <ToastProvider>
                        <NavigationProvider>
                            <NotificationProvider>
                                <Routes>
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/design-showcase" element={<DesignShowcase />} />

                                    {/* Protected Routes */}
                                    <Route element={
                                        <ProtectedRoute>
                                            <AutonomousThemeProvider>
                                                <AutonomousTracker />
                                                <AIChatBot />
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
                            </NotificationProvider>
                        </NavigationProvider>
                    </ToastProvider>
                </Router>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;
