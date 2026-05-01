import { useState, useEffect } from 'react';
import api from '../api';
import { timeAgo, actionLabel } from '../utils/helpers';
import { Spinner } from '../components/ui/Spinner';
import { useToast } from '../store/ToastContext';
import { Activity as ActivityIcon, Zap, GitCommit, MessageSquare, FolderKanban, Users, Shield, LogIn, Trash2, RefreshCw } from 'lucide-react';

const ACTION_CONFIG = {
  TASK_CREATED:       { icon: Zap,           color: '#818cf8', bg: 'rgba(99,102,241,0.12)'  },
  TASK_UPDATED:       { icon: RefreshCw,      color: '#60a5fa', bg: 'rgba(59,130,246,0.12)'  },
  TASK_DELETED:       { icon: Trash2,         color: '#f87171', bg: 'rgba(239,68,68,0.12)'   },
  STATUS_CHANGED:     { icon: GitCommit,      color: '#34d399', bg: 'rgba(16,185,129,0.12)'  },
  TASK_REASSIGNED:    { icon: Users,          color: '#fbbf24', bg: 'rgba(245,158,11,0.12)'  },
  PROJECT_CREATED:    { icon: FolderKanban,   color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
  PROJECT_UPDATED:    { icon: FolderKanban,   color: '#818cf8', bg: 'rgba(99,102,241,0.12)'  },
  PROJECT_DELETED:    { icon: Trash2,         color: '#f87171', bg: 'rgba(239,68,68,0.12)'   },
  COMMENT_ADDED:      { icon: MessageSquare,  color: '#34d399', bg: 'rgba(16,185,129,0.12)'  },
  ROLE_CHANGED:       { icon: Shield,         color: '#fbbf24', bg: 'rgba(245,158,11,0.12)'  },
  ACCOUNT_ACTIVATED:  { icon: Shield,         color: '#34d399', bg: 'rgba(16,185,129,0.12)'  },
  ACCOUNT_DEACTIVATED:{ icon: Shield,         color: '#f87171', bg: 'rgba(239,68,68,0.12)'   },
  USER_LOGGED_IN:     { icon: LogIn,          color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
  BULK_DELETE:        { icon: Trash2,         color: '#f87171', bg: 'rgba(239,68,68,0.12)'   },
  BULK_STATUS_CHANGE: { icon: GitCommit,      color: '#60a5fa', bg: 'rgba(59,130,246,0.12)'  },
};

export default function Activity() {
  const [logs, setLogs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');
  const toast = useToast();

  useEffect(() => {
    api.get('/api/activity?limit=100')
      .then(r => setLogs(r.data))
      .catch(() => toast.error('Failed to load activity'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? logs.filter(l => l.action === filter) : logs;
  const uniqueActions = [...new Set(logs.map(l => l.action))];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 760 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--brand-light), var(--brand-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIcon size={14} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Activity Feed</h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', margin: 0 }}>{filtered.length} events</p>
          </div>
        </div>
        <select className="select" style={{ width: 'auto', minWidth: 160 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
              <div className="card" style={{ flex: 1, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ width: '60%', height: 13 }} />
                <div className="skeleton" style={{ width: '40%', height: 11 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
          <p style={{ color: 'var(--text-3)', fontWeight: 500 }}>No activity yet</p>
          <p style={{ color: 'var(--text-4)', fontSize: '0.8125rem' }}>Actions will appear here as they happen</p>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Timeline spine */}
          <div style={{ position: 'absolute', left: 17, top: 18, bottom: 18, width: 2, background: 'var(--border)', borderRadius: 99 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(log => {
              const cfg = ACTION_CONFIG[log.action] || { icon: Zap, color: 'var(--brand)', bg: 'var(--raised)' };
              const Icon = cfg.icon;
              return (
                <div key={log.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }} className="animate-fade-in">
                  {/* Icon node */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                    background: cfg.bg, border: `1.5px solid ${cfg.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <Icon size={14} style={{ color: cfg.color }} />
                  </div>

                  {/* Card */}
                  <div className="card" style={{ flex: 1, padding: '12px 14px' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = `${cfg.color}40`}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', margin: 0 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{log.user?.name}</span>
                        {' '}{actionLabel(log.action)}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-4)', flexShrink: 0 }}>{timeAgo(log.createdAt)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99, background: cfg.bg, color: cfg.color, fontWeight: 600, border: `1px solid ${cfg.color}30` }}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-4)' }}>{log.entityType}</span>
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div style={{ marginTop: 8, padding: '6px 10px', background: 'var(--raised)', borderRadius: 6, fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
                        {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
