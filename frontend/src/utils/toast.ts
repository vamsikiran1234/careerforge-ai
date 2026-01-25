/**
 * Toast utility module - separated from ToastContainer component
 * to comply with React Fast Refresh requirements
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

let toastId = 0;
const listeners = new Set<(toast: Toast) => void>();

export const toast = {
  success: (message: string, duration = 3000) => {
    const id = `toast-${++toastId}`;
    listeners.forEach(listener => listener({ id, type: 'success', message, duration }));
  },
  error: (message: string, duration = 4000) => {
    const id = `toast-${++toastId}`;
    listeners.forEach(listener => listener({ id, type: 'error', message, duration }));
  },
  warning: (message: string, duration = 3500) => {
    const id = `toast-${++toastId}`;
    listeners.forEach(listener => listener({ id, type: 'warning', message, duration }));
  },
  info: (message: string, duration = 3000) => {
    const id = `toast-${++toastId}`;
    listeners.forEach(listener => listener({ id, type: 'info', message, duration }));
  },
  custom: (message: string, type: ToastType, action?: { label: string; onClick: () => void }, duration = 5000) => {
    const id = `toast-${++toastId}`;
    listeners.forEach(listener => listener({ id, type, message, duration, action }));
  },
};

export const addToastListener = (listener: (toast: Toast) => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
