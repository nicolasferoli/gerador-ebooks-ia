'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

type ToastProps = {
  message: string;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>([]);

  const addToast = React.useCallback((toast: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 3000);
    }
    
    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

type ToastContextType = {
  addToast: (toast: ToastProps) => string;
  removeToast: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast: React.FC<ToastProps & { id: string }> = ({
  message,
  type = 'default',
  onClose,
}) => {
  const typeClasses = {
    default: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
    success: 'bg-green-50 border-green-600 text-green-800 dark:bg-green-900 dark:text-green-100',
    error: 'bg-red-50 border-red-600 text-red-800 dark:bg-red-900 dark:text-red-100',
    warning: 'bg-yellow-50 border-yellow-600 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    info: 'bg-blue-50 border-blue-600 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  };

  return (
    <div
      className={cn(
        'p-4 rounded-md shadow-md border-l-4 max-w-sm min-w-72 transform transition-all duration-300 ease-in-out',
        typeClasses[type]
      )}
      role="alert"
    >
      <div className="flex justify-between items-center">
        <div className="mr-3 text-sm">{message}</div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <span className="sr-only">Close</span>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}; 