export const STATUS_STYLES = {
  TODO:        { label: 'Todo',        bg: 'rgba(113,113,122,0.15)', text: '#a1a1aa', border: 'rgba(113,113,122,0.3)' },
  IN_PROGRESS: { label: 'In Progress', bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa', border: 'rgba(59,130,246,0.3)'  },
  REVIEW:      { label: 'Review',      bg: 'rgba(234,179,8,0.15)',   text: '#facc15', border: 'rgba(234,179,8,0.3)'   },
  DONE:        { label: 'Done',        bg: 'rgba(34,197,94,0.15)',   text: '#4ade80', border: 'rgba(34,197,94,0.3)'   },
};

export const PRIORITY_STYLES = {
  LOW:      { label: 'Low',      bg: 'rgba(34,197,94,0.12)',  text: '#4ade80', border: 'rgba(34,197,94,0.25)'  },
  MEDIUM:   { label: 'Medium',   bg: 'rgba(234,179,8,0.12)',  text: '#fbbf24', border: 'rgba(234,179,8,0.25)'  },
  HIGH:     { label: 'High',     bg: 'rgba(249,115,22,0.12)', text: '#fb923c', border: 'rgba(249,115,22,0.25)' },
  CRITICAL: { label: 'Critical', bg: 'rgba(239,68,68,0.15)',  text: '#f87171', border: 'rgba(239,68,68,0.3)'   },
};

function Badge({ bg, text, border, label, prefix }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 600,
      background: bg, color: text, border: `1px solid ${border}`,
    }}>
      {prefix}{label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.TODO;
  return <Badge {...s} />;
}

export function PriorityBadge({ priority }) {
  const p = PRIORITY_STYLES[priority] || PRIORITY_STYLES.MEDIUM;
  return <Badge {...p} />;
}

export function RoleBadge({ role }) {
  const isAdmin = role === 'ADMIN';
  return (
    <Badge
      bg={isAdmin ? 'rgba(99,102,241,0.15)' : 'rgba(113,113,122,0.1)'}
      text={isAdmin ? '#818cf8' : 'var(--text-2)'}
      border={isAdmin ? 'rgba(99,102,241,0.3)' : 'var(--border)'}
      label={role}
    />
  );
}

export function ActiveBadge({ isActive }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 600,
      background: isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
      color: isActive ? '#4ade80' : '#f87171',
      border: `1px solid ${isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#4ade80' : '#f87171', display: 'inline-block' }} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
