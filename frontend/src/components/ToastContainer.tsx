import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
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
  }
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      
      if (toast.duration) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, toast.duration);
      }
    };

    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-amber-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`${getStyles(t.type)} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-right`}
        >
          {getIcon(t.type)}
          <span className="flex-1 font-medium">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="hover:bg-white/20 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
