import { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import api from '../api';
import { Skeleton } from '../components/ui/Skeleton';
import { fmtDate, isOverdue, timeAgo, actionLabel } from '../utils/helpers';
import { CheckSquare, Clock, AlertTriangle, TrendingUp, Activity, Zap } from 'lucide-react';

const PRIORITY_C = { LOW:'#10b981', MEDIUM:'#f59e0b', HIGH:'#f97316', CRITICAL:'#ef4444' };
const STATUS_C   = { TODO:'#71717a', IN_PROGRESS:'#3b82f6', REVIEW:'#f59e0b', DONE:'#10b981' };

function greet() { const h = new Date().getHours(); return h<12?'morning':h<17?'afternoon':'evening'; }
function greetEmoji() { const h = new Date().getHours(); return h<12?'☀️':h<17?'👋':'🌙'; }

export default function MemberDashboard() {
  const { user } = useAuth();
  const [tasks,    setTasks]    = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([api.get('/api/tasks'), api.get('/api/activity?limit=8')])
      .then(([t, a]) => { setTasks(t.data); setActivity(a.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <Skeleton w="50%" h={28} /><Skeleton w="30%" h={18} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>{[1,2,3,4].map(i=><Skeleton key={i} h={100} r={14} />)}</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}><Skeleton h={300} r={14} /><Skeleton h={300} r={14} /></div>
    </div>
  );

  const total     = tasks.length;
  const completed = tasks.filter(t => t.status==='DONE').length;
  const pending   = tasks.filter(t => t.status!=='DONE').length;
  const overdue   = tasks.filter(t => isOverdue(t.dueDate, t.status)).length;
  const pct       = total ? Math.round((completed/total)*100) : 0;
  const pctColor  = pct>=70?'#10b981':pct>=40?'#f59e0b':'#ef4444';

  const STATS = [
    { label:'Total Tasks',  value:total,     icon:CheckSquare,   color:'#818cf8', bg:'rgba(99,102,241,0.1)',   border:'rgba(99,102,241,0.2)'  },
    { label:'Completed',    value:completed, icon:TrendingUp,    color:'#34d399', bg:'rgba(16,185,129,0.1)',   border:'rgba(16,185,129,0.2)'  },
    { label:'In Progress',  value:pending,   icon:Clock,         color:'#fbbf24', bg:'rgba(245,158,11,0.1)',   border:'rgba(245,158,11,0.2)'  },
    { label:'Overdue',      value:overdue,   icon:AlertTriangle, color:'#f87171', bg:'rgba(239,68,68,0.1)',    border:'rgba(239,68,68,0.2)'   },
  ];

  return (
    <div className="animate-fade-in" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Greeting */}
      <div style={{ background:'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)', borderRadius:16, padding:'20px 24px', border:'1px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:'1.375rem', fontWeight:800, color:'var(--text-1)', margin:'0 0 4px', letterSpacing:'-0.02em' }}>Good {greet()}, {user?.name?.split(' ')[0]}! {greetEmoji()}</h1>
          <p style={{ color:'var(--text-3)', fontSize:'0.875rem', margin:0 }}>You have <strong style={{ color:'var(--text-1)' }}>{pending}</strong> active tasks{overdue>0&&<> and <strong style={{ color:'#f87171' }}>{overdue} overdue</strong></>}</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ textAlign:'center', padding:'8px 20px', background:'var(--surface)', borderRadius:10, border:'1px solid var(--border)' }}>
            <div style={{ fontSize:'1.5rem', fontWeight:800, color:pctColor }}>{pct}%</div>
            <div style={{ fontSize:'0.7rem', color:'var(--text-4)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>Complete</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:12 }}>
        {STATS.map(s => (
          <div key={s.label} className="card" style={{ padding:'1.125rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div>
              <p style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 6px' }}>{s.label}</p>
              <p style={{ fontSize:'1.875rem', fontWeight:800, color:'var(--text-1)', margin:0, lineHeight:1 }}>{s.value}</p>
            </div>
            <div style={{ padding:'10px', borderRadius:10, background:s.bg, border:`1px solid ${s.border}`, flexShrink:0 }}>
              <s.icon size={18} style={{ color:s.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Completion bar */}
      <div className="card" style={{ padding:'1rem 1.25rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-2)' }}>Overall Progress</span>
          <span style={{ fontSize:'0.875rem', fontWeight:700, color:pctColor }}>{pct}%</span>
        </div>
        <div style={{ height:10, background:'var(--raised)', borderRadius:99, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg, ${pctColor}aa, ${pctColor})`, borderRadius:99, transition:'width 0.8s ease' }} />
        </div>
        <p style={{ fontSize:'0.75rem', color:'var(--text-4)', marginTop:6 }}>{completed} of {total} tasks completed</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Active Tasks */}
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
            <CheckSquare size={14} style={{ color:'var(--brand)' }} />
            <span style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text-1)' }}>Active Tasks</span>
            <span style={{ marginLeft:'auto', fontSize:'0.75rem', fontWeight:700, color:'var(--brand)', background:'rgba(99,102,241,0.1)', padding:'1px 8px', borderRadius:99 }}>{pending}</span>
          </div>
          {pending===0 ? (
            <div style={{ textAlign:'center', padding:'3rem' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:8 }}>🎉</div>
              <p style={{ fontWeight:600, color:'var(--text-2)' }}>All caught up!</p>
              <p style={{ color:'var(--text-3)', fontSize:'0.8125rem' }}>You have no pending tasks</p>
            </div>
          ) : (
            <div style={{ maxHeight:280, overflowY:'auto' }}>
              {tasks.filter(t => t.status!=='DONE').slice(0,8).map(task => {
                const over = isOverdue(task.dueDate, task.status);
                return (
                  <div key={task.id} style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, background:over?'rgba(239,68,68,0.03)':'' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:'0.875rem', fontWeight:500, color:over?'#fca5a5':'var(--text-1)', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{task.title}</p>
                      <p style={{ fontSize:'0.75rem', color:'var(--text-4)', margin:'2px 0 0' }}>{task.project?.name}{task.dueDate&&` · ${fmtDate(task.dueDate)}`}{over&&<span style={{ color:'#f87171', fontWeight:600 }}> · OVERDUE</span>}</p>
                    </div>
                    <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                      <span style={{ padding:'1px 6px', borderRadius:99, fontSize:'0.65rem', fontWeight:700, background:`${PRIORITY_C[task.priority]||'#6b7280'}18`, color:PRIORITY_C[task.priority]||'#6b7280' }}>{task.priority}</span>
                      <span style={{ padding:'1px 6px', borderRadius:99, fontSize:'0.65rem', fontWeight:700, background:`${STATUS_C[task.status]||'#6b7280'}18`, color:STATUS_C[task.status]||'#6b7280' }}>{task.status.replace('_',' ')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="card" style={{ padding:'1rem' }}>
          <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text-1)', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
            <Activity size={14} style={{ color:'var(--brand)' }}/> Recent Activity
          </div>
          {activity.length===0 ? (
            <div style={{ textAlign:'center', paddingTop:'2rem', color:'var(--text-4)', fontSize:'0.875rem' }}>No activity yet</div>
          ) : (
            <div style={{ position:'relative' }}>
              <div style={{ position:'absolute', left:13, top:4, bottom:4, width:2, background:'var(--border)', borderRadius:99 }} />
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {activity.map(log => (
                  <div key={log.id} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(99,102,241,0.12)', border:'1.5px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, zIndex:1 }}>
                      <Zap size={12} style={{ color:'var(--brand)' }} />
                    </div>
                    <div style={{ paddingTop:4 }}>
                      <p style={{ fontSize:'0.8125rem', color:'var(--text-2)', margin:0 }}>{actionLabel(log.action)}</p>
                      <p style={{ fontSize:'0.75rem', color:'var(--text-4)', margin:'2px 0 0' }}>{timeAgo(log.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
