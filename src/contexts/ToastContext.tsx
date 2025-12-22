import React, { createContext, useContext, ReactNode } from 'react';
import { ToastContainer, ToastMessage } from '../components/Toast';
import useToast from '../hooks/useToast';

interface ToastContextValue {
  showSuccess: (message: string, duration?: number) => string;
  showError: (message: string, duration?: number) => string;
  showInfo: (message: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;

