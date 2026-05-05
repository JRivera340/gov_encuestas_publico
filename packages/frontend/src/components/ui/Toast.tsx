import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

let counter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl text-sm font-medium backdrop-blur-sm
              ${t.type === 'success'
                ? 'bg-[#1c2128]/95 border-emerald-500/20 text-[#e6edf3]'
                : 'bg-[#1c2128]/95 border-red-500/20 text-[#e6edf3]'
              }`}
            style={{ animation: 'slideInRight 0.2s ease-out' }}
          >
            {t.type === 'success'
              ? <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              : <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            }
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-[#484f58] hover:text-[#8b949e] transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
