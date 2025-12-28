import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import "../styles/Toast.css";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now().toString() + Math.random().toString();
        setToasts(prev => [...prev, { id, message, type, duration }]);
        
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            {createPortal(
                <div className="toast-container">
                    {toasts.map(toast => (
                        <div key={toast.id} className={`toast-notification toast-${toast.type} slide-in`}>
                            <div className="toast-icon">
                                {toast.type === 'success' && <i className="fas fa-check-circle"></i>}
                                {toast.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
                                {toast.type === 'info' && <i className="fas fa-info-circle"></i>}
                                {toast.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
                            </div>
                            <div className="toast-content">{toast.message}</div>
                            <button className="toast-close" onClick={() => removeToast(toast.id)}>&times;</button>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};
