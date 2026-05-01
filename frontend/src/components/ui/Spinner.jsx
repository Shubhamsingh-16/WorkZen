import { Loader2 } from 'lucide-react';

export function Spinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-brand-500 ${className}`} />;
}

export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={32} />
        <p className="text-zinc-500 text-sm">Loading…</p>
      </div>
    </div>
  );
}
