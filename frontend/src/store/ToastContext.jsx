import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++toastId;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  const remove = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info:    (msg) => addToast(msg, 'info'),
  };

  const ICONS = {
    success: <CheckCircle2 size={16} />,
    error:   <XCircle size={16} />,
    warning: <AlertTriangle size={16} />,
    info:    <Info size={16} />,
  };

  const COLORS = {
    success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#34d399', title: 'var(--text-1)' },
    error:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  text: '#f87171', title: 'var(--text-1)' },
    warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24', title: 'var(--text-1)' },
    info:    { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#60a5fa', title: 'var(--text-1)' },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column-reverse', gap: 10, maxWidth: 360, pointerEvents: 'none' }}>
        {toasts.map(t => {
          const c = COLORS[t.type];
          return (
            <div key={t.id} className="animate-slide-up" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px',
              background: 'var(--surface)',
              border: `1.5px solid ${c.border}`,
              borderRadius: 12,
              boxShadow: 'var(--shadow-lg)',
              backdropFilter: 'blur(16px)',
              pointerEvents: 'auto',
              minWidth: 280,
            }}>
              <span style={{ color: c.text, flexShrink: 0, display: 'flex' }}>{ICONS[t.type]}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-1)', flex: 1, fontWeight: 500 }}>{t.message}</span>
              <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', display: 'flex', flexShrink: 0, padding: 2 }}>
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};
