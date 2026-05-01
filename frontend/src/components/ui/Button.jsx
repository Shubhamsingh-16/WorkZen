import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export function Button({ children, variant = 'primary', loading, className, ...props }) {
  const base = 'btn-' + variant;
  return (
    <button className={clsx(base, className)} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
