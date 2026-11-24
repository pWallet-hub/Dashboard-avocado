import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    timers.current[id] = setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  // Memoized so consumers can safely list `toast` in hook dependency arrays
  // without re-running effects (and re-fetching) every time a toast appears.
  const toast = useMemo(() => ({
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    info: (message, duration) => showToast(message, 'info', duration),
  }), [showToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed inset-x-4 bottom-4 z-[1300] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className={`flex w-full max-w-sm items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-lg sm:min-w-[260px] ${
              t.type === 'success' ? 'bg-brand-700' : t.type === 'error' ? 'bg-rose-600' : 'bg-slate-800'
            }`}
          >
            <span>{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="text-white/80 hover:text-white" aria-label="Dismiss notification">
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
