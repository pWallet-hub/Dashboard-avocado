import { createContext, useCallback, useContext, useState } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setDialog({ message, resolve, ...options });
    });
  }, []);

  const handle = (result) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <div
          className="fixed inset-0 z-[1200] flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center sm:p-4"
          role="alertdialog"
          aria-modal="true"
          onKeyDown={(e) => e.key === 'Escape' && handle(false)}
        >
          <div className="w-full rounded-t-2xl bg-white p-6 shadow-2xl sm:max-w-sm sm:rounded-2xl">
            {dialog.title && <h3 className="mb-2 text-base font-semibold text-slate-900">{dialog.title}</h3>}
            <p className="mb-6 text-sm text-slate-600">{dialog.message}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handle(false)}
                className="h-10 rounded-lg bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                {dialog.cancelLabel || 'Cancel'}
              </button>
              <button
                autoFocus
                onClick={() => handle(true)}
                className={`h-10 rounded-lg px-4 text-sm font-medium text-white ${dialog.danger === false ? 'bg-brand-600 hover:bg-brand-700' : 'bg-rose-600 hover:bg-rose-700'}`}
              >
                {dialog.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
}
