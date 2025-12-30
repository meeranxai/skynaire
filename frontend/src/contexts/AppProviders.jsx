import { AuthProvider } from './AuthContext';
import { AutonomousThemeProvider } from './AutonomousThemeContext';
import { NavigationProvider } from './NavigationContext';
import { ToastProvider } from './ToastContext';
import { NotificationProvider } from './NotificationContext';
import { SocketProvider } from './SocketContext';

const AppProviders = ({ children }) => {
  return (
    <AutonomousThemeProvider>
      <ToastProvider>
        <NavigationProvider>
          <NotificationProvider>
            <SocketProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </SocketProvider>
          </NotificationProvider>
        </NavigationProvider>
      </ToastProvider>
    </AutonomousThemeProvider>
  );
};

export default AppProviders;
