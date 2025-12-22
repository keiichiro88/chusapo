import { useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '../components/Toast';

let toastIdCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = `toast-${++toastIdCounter}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    return addToast('success', message, duration);
  }, [addToast]);

  const showError = useCallback((message: string, duration?: number) => {
    return addToast('error', message, duration || 5000); // エラーは少し長めに表示
  }, [addToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    return addToast('info', message, duration);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo
  };
};

export default useToast;

