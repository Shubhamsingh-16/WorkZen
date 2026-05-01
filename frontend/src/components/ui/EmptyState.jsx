export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center' }}>
      {Icon && (
        <div style={{ padding: '1rem', borderRadius: '50%', background: 'var(--raised)', marginBottom: '1rem', border: '1.5px dashed var(--border)' }}>
          <Icon size={28} style={{ color: 'var(--text-3)' }} />
        </div>
      )}
      <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-2)', marginBottom: 4, margin: 0 }}>{title}</h3>
      {description && <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', maxWidth: 320, marginTop: 6 }}>{description}</p>}
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
}
