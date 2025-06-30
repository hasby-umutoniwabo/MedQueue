import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', duration = 5000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500 border-green-600';
            case 'error':
                return 'bg-red-500 border-red-600';
            case 'warning':
                return 'bg-yellow-500 border-yellow-600';
            case 'info':
                return 'bg-blue-500 border-blue-600';
            default:
                return 'bg-gray-500 border-gray-600';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return 'fas fa-check-circle';
            case 'error':
                return 'fas fa-times-circle';
            case 'warning':
                return 'fas fa-exclamation-triangle';
            case 'info':
                return 'fas fa-info-circle';
            default:
                return 'fas fa-bell';
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border text-white transform transition-all duration-300 ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        } ${getToastStyles()}`}>
            <div className="flex items-center justify-between max-w-sm">
                <div className="flex items-center">
                    <i className={`${getIcon()} mr-3 text-lg`}></i>
                    <span className="text-sm font-medium">{message}</span>
                </div>
                <button 
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    className="ml-4 text-white hover:text-gray-200 transition-colors"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>
        </div>
    );
};

const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    // Function to add toast (can be called from anywhere in the app)
    window.showToast = (message, type = 'success', duration = 5000) => {
        const id = Date.now();
        const newToast = { id, message, type, duration };
        setToasts(prev => [...prev, newToast]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

export default ToastContainer;