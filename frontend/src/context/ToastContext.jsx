import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', title = '') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, title }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none">
        {toasts.map(toast => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-5 ${
                isSuccess 
                  ? 'bg-slate-900/95 backdrop-blur-md border-emerald-500/50 text-white shadow-emerald-950/40' 
                  : isError 
                  ? 'bg-slate-900/95 backdrop-blur-md border-rose-500/50 text-white shadow-rose-950/40' 
                  : isWarning 
                  ? 'bg-slate-900/95 backdrop-blur-md border-amber-500/50 text-white shadow-amber-950/40' 
                  : 'bg-slate-900/95 backdrop-blur-md border-cyan-500/50 text-white shadow-cyan-950/40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <XCircle className="w-5 h-5 text-rose-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-cyan-400" />}
              </div>

              <div className="flex-1 space-y-0.5 min-w-0">
                <h4 className={`text-xs font-extrabold uppercase tracking-wider ${
                  isSuccess ? 'text-emerald-400' : isError ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-cyan-400'
                }`}>
                  {toast.title || (isSuccess ? 'Thành công' : isError ? 'Thất bại' : isWarning ? 'Cảnh báo' : 'Thông báo')}
                </h4>
                <p className="text-xs text-slate-200 font-semibold leading-relaxed break-words">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg, type) => {
        if (type === 'error') alert('❌ ' + msg);
        else alert('✅ ' + msg);
      }
    };
  }
  return context;
};
