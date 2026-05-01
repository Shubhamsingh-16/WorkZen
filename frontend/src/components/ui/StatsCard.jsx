const COLOR_MAP = {
  brand:  { bg: 'rgba(99,102,241,0.12)',  text: '#818cf8',  border: 'rgba(99,102,241,0.2)'  },
  green:  { bg: 'rgba(34,197,94,0.12)',   text: '#4ade80',  border: 'rgba(34,197,94,0.2)'   },
  yellow: { bg: 'rgba(234,179,8,0.12)',   text: '#facc15',  border: 'rgba(234,179,8,0.2)'   },
  red:    { bg: 'rgba(239,68,68,0.12)',   text: '#f87171',  border: 'rgba(239,68,68,0.2)'   },
  blue:   { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa',  border: 'rgba(59,130,246,0.2)'  },
};

export function StatsCard({ label, value, icon: Icon, color = 'brand', sub, trend }) {
  const c = COLOR_MAP[color] || COLOR_MAP.brand;
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</p>
        <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1, marginBottom: sub ? 4 : 0 }}>{value ?? '—'}</p>
        {sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 4 }}>{sub}</p>}
      </div>
      {Icon && (
        <div style={{
          padding: '0.6rem', borderRadius: 10,
          background: c.bg, color: c.text, border: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
