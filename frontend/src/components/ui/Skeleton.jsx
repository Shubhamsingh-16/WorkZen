export function Skeleton({ w = '100%', h = 16, r = 8, style = {} }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...style }} />;
}

export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Skeleton w={40} h={40} r={9999} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton w="60%" h={14} />
          <Skeleton w="40%" h={12} />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} w={i % 2 === 0 ? '100%' : '75%'} h={12} />)}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', gap: 16 }}>
        {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} w={80} h={10} />)}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'center' }}>
          <Skeleton w={32} h={32} r={9999} />
          {Array.from({ length: cols - 1 }).map((_, i) => <Skeleton key={i} w={`${60 + Math.random() * 40}%`} h={12} />)}
        </div>
      ))}
    </div>
  );
}
