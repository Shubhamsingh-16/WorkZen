import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../store/ToastContext';
import { SkeletonTable } from '../components/ui/Skeleton';
import { timeAgo } from '../utils/helpers';
import { Users, Search, ChevronRight, AlertTriangle, TrendingUp, UserCheck, UserX } from 'lucide-react';

function Avatar({ name, size = 32, color = 'var(--brand)' }) {
  const initials = name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, var(--brand-light), var(--brand-dark))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size * 0.3125, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function ProgressBar({ value }) {
  const color = value >= 70 ? '#10b981' : value >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 64, height: 5, background: 'var(--raised)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color }}>{value}%</span>
    </div>
  );
}

export default function Members() {
  const navigate = useNavigate();
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    api.get('/api/admin/members')
      .then(r => setMembers(r.data))
      .catch(() => toast.error('Failed to load members'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const active   = members.filter(m => m.isActive).length;
  const inactive = members.filter(m => !m.isActive).length;

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--brand-light), var(--brand-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={14} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Team Members</h1>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: members.length, icon: Users, color: 'var(--brand)' },
            { label: 'Active', value: active, icon: UserCheck, color: '#10b981' },
            { label: 'Inactive', value: inactive, icon: UserX, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-sm)' }}>
              <s.icon size={14} style={{ color: s.color }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-3)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 340, marginBottom: 16 }}>
        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }} />
        <input className="input" style={{ paddingLeft: 34 }} placeholder="Search members…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      {loading ? <SkeletonTable rows={4} cols={6} /> : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔍</div>
              <p style={{ color: 'var(--text-3)' }}>No members match "{search}"</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--raised)' }}>
                    {['Member', 'Role', 'Projects', 'Tasks · Done · Overdue', 'Completion', 'Last Seen', 'Status', ''].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(m => (
                    <tr key={m.id} className="table-row" onClick={() => navigate(`/admin/members/${m.id}`)}>
                      <td className="table-cell">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={m.name} size={34} />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: '0.875rem' }}>{m.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span style={{ padding: '3px 9px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, background: m.role === 'ADMIN' ? 'rgba(99,102,241,0.12)' : 'var(--raised)', color: m.role === 'ADMIN' ? 'var(--brand)' : 'var(--text-3)', border: `1px solid ${m.role === 'ADMIN' ? 'rgba(99,102,241,0.25)' : 'var(--border)'}` }}>
                          {m.role}
                        </span>
                      </td>
                      <td className="table-cell" style={{ fontWeight: 600, color: 'var(--text-2)', textAlign: 'center' }}>{m.projectsCount}</td>
                      <td className="table-cell">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{m.tasks.total}</span>
                          <span style={{ color: 'var(--border)' }}>·</span>
                          <span style={{ color: '#34d399', fontWeight: 600 }}>{m.tasks.done}</span>
                          <span style={{ color: 'var(--border)' }}>·</span>
                          <span style={{ color: m.tasks.overdue > 0 ? '#f87171' : 'var(--text-4)', fontWeight: m.tasks.overdue > 0 ? 700 : 400, display: 'flex', alignItems: 'center', gap: 3 }}>
                            {m.tasks.overdue > 0 && <AlertTriangle size={11} />}{m.tasks.overdue}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell"><ProgressBar value={m.tasks.completionRate ?? 0} /></td>
                      <td className="table-cell" style={{ fontSize: '0.8125rem', color: 'var(--text-4)' }}>{timeAgo(m.lastActive)}</td>
                      <td className="table-cell">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, background: m.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', color: m.isActive ? '#34d399' : '#f87171', border: `1px solid ${m.isActive ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'}` }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.isActive ? '#34d399' : '#f87171' }} />{m.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="table-cell"><ChevronRight size={15} style={{ color: 'var(--text-4)' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
