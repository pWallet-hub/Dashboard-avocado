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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm p-6 mx-4 bg-white rounded-lg shadow-xl">
            {dialog.title && <h3 className="mb-2 text-lg font-semibold text-gray-800">{dialog.title}</h3>}
            <p className="mb-6 text-sm text-gray-600">{dialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handle(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                {dialog.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={() => handle(true)}
                className={`px-4 py-2 text-white rounded ${dialog.danger === false ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
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
