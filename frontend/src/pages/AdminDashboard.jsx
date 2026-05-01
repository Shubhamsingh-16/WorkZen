import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../store/AuthContext';
import { StatsCard } from '../components/ui/StatsCard';
import { Spinner } from '../components/ui/Spinner';
import { timeAgo, actionLabel } from '../utils/helpers';
import { Users, FolderKanban, CheckSquare, AlertTriangle, Star, Zap } from 'lucide-react';

const GREETINGS = ['morning', 'afternoon', 'evening'];
function greet() { const h = new Date().getHours(); return h < 12 ? GREETINGS[0] : h < 17 ? GREETINGS[1] : GREETINGS[2]; }

const ACTION_DOT = {
  TASK_CREATED: '#818cf8', STATUS_CHANGED: '#60a5fa', COMMENT_ADDED: '#4ade80',
  PROJECT_CREATED: '#c084fc', ROLE_CHANGED: '#fbbf24', USER_LOGGED_IN: 'var(--text-3)',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats]    = useState(null);
  const [activity, setAct]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/api/admin/stats'), api.get('/api/activity?limit=8')])
      .then(([s, a]) => { setStats(s.data); setAct(a.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner size={28} /></div>;

  const { members, projects, tasks, topPerformers, membersWithOverdue } = stats;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Greeting hero */}
      <div style={{
        borderRadius: 16, padding: '1.5rem 2rem',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', margin: 0, letterSpacing: '-0.02em' }}>
            Good {greet()}, {user?.name?.split(' ')[0]}! {greet() === 'morning' ? '☀️' : greet() === 'afternoon' ? '👋' : '🌙'}
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', marginTop: 4, marginBottom: 0 }}>
            Here's the pulse of your workspace today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {tasks.overdue > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '0.8125rem', fontWeight: 600 }}>
              <AlertTriangle size={14} /> {tasks.overdue} overdue
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80', fontSize: '0.8125rem', fontWeight: 600 }}>
            <CheckSquare size={14} /> {tasks.done} completed
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatsCard label="Total Members"  value={members.total}   icon={Users}         color="brand" sub={`${members.active} active · ${members.deactivated} inactive`} />
        <StatsCard label="Projects"       value={projects.total}  icon={FolderKanban}  color="blue"  sub={`${projects.active} active`} />
        <StatsCard label="Total Tasks"    value={tasks.total}     icon={CheckSquare}   color="green" sub={`${tasks.done} done · ${tasks.inProgress} in progress`} />
        <StatsCard label="Overdue"        value={tasks.overdue}   icon={AlertTriangle} color="red"   sub="Needs immediate attention" />
      </div>

      {/* Task pipeline */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1rem 0' }}>
          Task Pipeline
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
          {[
            { label: 'Todo',        value: tasks.todo,       color: '#71717a', bar: '#52525b' },
            { label: 'In Progress', value: tasks.inProgress, color: '#60a5fa', bar: '#3b82f6' },
            { label: 'Review',      value: tasks.review,     color: '#fbbf24', bar: '#f59e0b' },
            { label: 'Done',        value: tasks.done,       color: '#4ade80', bar: '#22c55e' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: 8 }}>{s.label}</div>
              <div style={{ height: 4, background: 'var(--raised)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: s.bar, borderRadius: 99, width: tasks.total ? `${Math.round((s.value / tasks.total) * 100)}%` : '0%', transition: 'width 0.8s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom 3-col */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>

        {/* Top Performers */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Star size={13} style={{ color: '#fbbf24' }} /> Top Performers
          </h2>
          {topPerformers.length === 0 ? <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>No data yet</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topPerformers.map((p, i) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', width: 16, textAlign: 'center' }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-1)' }}>{p.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 700 }}>{p.completionRate}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--raised)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--brand), var(--brand-dk))', borderRadius: 99, width: `${p.completionRate}%`, transition: 'width 0.8s' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue members */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={13} style={{ color: '#f87171' }} /> Needs Attention
          </h2>
          {membersWithOverdue.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: 4 }}>🎉</div>
              <p style={{ color: 'var(--text-3)', fontSize: '0.8125rem' }}>No overdue tasks! Great work team.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {membersWithOverdue.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', borderRadius: 8, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-1)' }}>{m.name}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f87171', background: 'rgba(239,68,68,0.15)', padding: '2px 8px', borderRadius: 99 }}>
                    {m.overdueCount} overdue
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={13} style={{ color: 'var(--brand)' }} /> Recent Activity
          </h2>
          {activity.length === 0 ? <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>No activity yet</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activity.map(log => (
                <div key={log.id} style={{ display: 'flex', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: `color-mix(in srgb, ${ACTION_DOT[log.action] || 'var(--brand)'} 20%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: ACTION_DOT[log.action] || 'var(--brand)', fontSize: '0.7rem', fontWeight: 700,
                  }}>
                    {log.user?.name?.[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', margin: 0, lineHeight: 1.4 }}>
                      <strong style={{ color: 'var(--text-1)' }}>{log.user?.name}</strong>{' '}{actionLabel(log.action)}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', margin: '2px 0 0 0' }}>{timeAgo(log.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
