import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../store/ToastContext';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { fmtDate, timeAgo, isOverdue } from '../utils/helpers';
import { ArrowLeft, Mail, Calendar, Clock, CheckSquare, FolderKanban, ShieldCheck, ShieldOff, UserCheck, UserX, RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react';

const PRIORITY_C = { LOW:'#10b981', MEDIUM:'#f59e0b', HIGH:'#f97316', CRITICAL:'#ef4444' };
const STATUS_C   = { TODO:'#71717a', IN_PROGRESS:'#3b82f6', REVIEW:'#f59e0b', DONE:'#10b981' };

function StatMini({ label, value, color }) {
  return (
    <div style={{ textAlign:'center', padding:'14px 12px', background:'var(--raised)', borderRadius:10, border:'1px solid var(--border)' }}>
      <div style={{ fontSize:'1.75rem', fontWeight:800, color: color||'var(--text-1)', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:'0.7rem', color:'var(--text-4)', marginTop:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
    </div>
  );
}

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [member, setMember]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [actionLoading, setAL]    = useState(false);
  const [reassignModal, setRM]    = useState(false);
  const [allMembers, setAM]       = useState([]);
  const [reassignTo, setRT]       = useState('');

  const fetchProfile = () => { setLoading(true); api.get(`/api/admin/members/${id}/profile`).then(r => setMember(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { fetchProfile(); }, [id]);

  const act = async (fn, msg) => { setAL(true); try { await fn(); fetchProfile(); toast.success(msg); } catch { toast.error('Action failed'); } finally { setAL(false); }};

  const handleRole   = () => act(() => api.patch(`/api/admin/members/${id}/role`,   { role:    member.role==='ADMIN'?'MEMBER':'ADMIN' }), `Role changed to ${member.role==='ADMIN'?'MEMBER':'ADMIN'}`);
  const handleStatus = () => act(() => api.patch(`/api/admin/members/${id}/status`, { isActive:!member.isActive }), member.isActive?'Account deactivated':'Account activated');

  const openReassign = async () => { const r = await api.get('/api/admin/members'); setAM(r.data.filter(m => m.id !== id)); setRM(true); };

  const handleReassign = async () => {
    if (!reassignTo) return;
    const ids = member.assignedTasks.filter(t => t.status !== 'DONE').map(t => t.id);
    if (ids.length > 0) await api.patch('/api/tasks/bulk', { taskIds:ids, action:'reassign', value:reassignTo });
    setRM(false); setRT(''); fetchProfile(); toast.success(`${ids.length} tasks reassigned`);
  };

  if (loading) return (
    <div style={{ maxWidth:900 }}>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Skeleton w={140} h={14} /><Skeleton w="100%" h={140} r={14} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>{[1,2,3,4,5].map(i=><Skeleton key={i} h={80} r={10} />)}</div>
      </div>
    </div>
  );
  if (!member) return <div style={{ textAlign:'center', paddingTop:80, color:'var(--text-3)' }}>Member not found</div>;

  const { stats } = member;
  const completionColor = stats.completionRate >= 70 ? '#10b981' : stats.completionRate >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="animate-fade-in" style={{ maxWidth:960 }}>
      {/* Back */}
      <button onClick={() => navigate('/admin/members')} style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-3)', fontSize:'0.875rem', background:'none', border:'none', cursor:'pointer', marginBottom:20, fontFamily:'inherit', padding:0 }}
        onMouseEnter={e => e.currentTarget.style.color='var(--brand)'} onMouseLeave={e => e.currentTarget.style.color='var(--text-3)'}>
        <ArrowLeft size={15}/> Back to Members
      </button>

      {/* Profile card */}
      <div className="card" style={{ padding:'1.75rem', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:64, height:64, borderRadius:18, background:'linear-gradient(135deg, var(--brand-light), var(--brand-dark))', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'1.5rem', fontWeight:800, boxShadow:'0 8px 24px var(--brand-glow)', flexShrink:0 }}>
              {member.name.split(' ').map(p=>p[0]).join('').slice(0,2)}
            </div>
            <div>
              <h1 style={{ fontSize:'1.375rem', fontWeight:800, color:'var(--text-1)', margin:'0 0 6px', letterSpacing:'-0.02em' }}>{member.name}</h1>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, alignItems:'center' }}>
                <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.8125rem', color:'var(--text-3)' }}><Mail size={13}/>{member.email}</span>
                <span style={{ padding:'2px 9px', borderRadius:99, fontSize:'0.7rem', fontWeight:700, background:member.role==='ADMIN'?'rgba(99,102,241,0.12)':'var(--raised)', color:member.role==='ADMIN'?'var(--brand)':'var(--text-3)', border:`1px solid ${member.role==='ADMIN'?'rgba(99,102,241,0.25)':'var(--border)'}` }}>{member.role}</span>
                <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'2px 9px', borderRadius:99, fontSize:'0.7rem', fontWeight:700, background:member.isActive?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.1)', color:member.isActive?'#34d399':'#f87171', border:`1px solid ${member.isActive?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.2)'}` }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:member.isActive?'#34d399':'#f87171' }}/>{member.isActive?'Active':'Inactive'}
                </span>
              </div>
              <div style={{ display:'flex', gap:16, marginTop:8 }}>
                <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.8125rem', color:'var(--text-4)' }}><Calendar size={12}/>Joined {fmtDate(member.joinedAt)}</span>
                <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.8125rem', color:'var(--text-4)' }}><Clock size={12}/>Active {timeAgo(member.lastActive)}</span>
              </div>
            </div>
          </div>
          {/* Actions */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button className="btn-secondary" onClick={handleRole} disabled={actionLoading} style={{ fontSize:'0.8125rem' }}>
              {member.role==='ADMIN'?<><ShieldOff size={13}/>Demote</>:<><ShieldCheck size={13}/>Promote</>}
            </button>
            <button className={member.isActive?'btn-danger':'btn-secondary'} onClick={handleStatus} disabled={actionLoading} style={{ fontSize:'0.8125rem' }}>
              {member.isActive?<><UserX size={13}/>Deactivate</>:<><UserCheck size={13}/>Activate</>}
            </button>
            <button className="btn-secondary" onClick={openReassign} disabled={actionLoading} style={{ fontSize:'0.8125rem' }}>
              <RefreshCw size={13}/>Reassign Tasks
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20 }}>
        <StatMini label="Total"     value={stats.total}          color="var(--text-1)" />
        <StatMini label="Done"      value={stats.completed}      color="#10b981" />
        <StatMini label="Pending"   value={stats.pending}        color="#f59e0b" />
        <StatMini label="Overdue"   value={stats.overdue}        color="#ef4444" />
        <StatMini label="Rate"      value={`${stats.completionRate}%`} color={completionColor} />
      </div>

      {/* Completion bar */}
      <div className="card" style={{ padding:'1rem 1.25rem', marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-2)' }}>Completion Rate</span>
          <span style={{ fontSize:'0.875rem', fontWeight:700, color:completionColor }}>{stats.completionRate}%</span>
        </div>
        <div style={{ height:10, background:'var(--raised)', borderRadius:99, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${stats.completionRate}%`, background:`linear-gradient(90deg, ${completionColor}aa, ${completionColor})`, borderRadius:99, transition:'width 0.8s ease' }} />
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Tasks */}
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
            <CheckSquare size={14} style={{ color:'var(--brand)' }} />
            <span style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text-1)' }}>Assigned Tasks ({member.assignedTasks.length})</span>
          </div>
          <div style={{ maxHeight:300, overflowY:'auto' }}>
            {member.assignedTasks.length===0 ? (
              <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-4)', fontSize:'0.875rem' }}>No tasks assigned</div>
            ) : member.assignedTasks.map(t => {
              const over = isOverdue(t.dueDate, t.status);
              return (
                <div key={t.id} style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', background:over?'rgba(239,68,68,0.03)':'' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontSize:'0.875rem', fontWeight:500, color:over?'#fca5a5':'var(--text-1)', flex:1, minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.title}</span>
                    <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                      <span style={{ padding:'1px 6px', borderRadius:99, fontSize:'0.65rem', fontWeight:700, background:`${PRIORITY_C[t.priority]||'#6b7280'}18`, color:PRIORITY_C[t.priority]||'#6b7280' }}>{t.priority}</span>
                      <span style={{ padding:'1px 6px', borderRadius:99, fontSize:'0.65rem', fontWeight:700, background:`${STATUS_C[t.status]||'#6b7280'}18`, color:STATUS_C[t.status]||'#6b7280' }}>{t.status.replace('_',' ')}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-4)', marginTop:3 }}>{t.project?.name}{t.dueDate&&` · ${fmtDate(t.dueDate)}`}{over&&<span style={{ color:'#f87171', fontWeight:600 }}> · OVERDUE</span>}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Projects */}
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
              <FolderKanban size={14} style={{ color:'var(--brand)' }} />
              <span style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text-1)' }}>Projects ({member.projects.length})</span>
            </div>
            <div>
              {member.projects.length===0 ? (
                <div style={{ padding:'1.5rem', textAlign:'center', color:'var(--text-4)', fontSize:'0.875rem' }}>No projects</div>
              ) : member.projects.map(p => (
                <div key={p.id} style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'0.875rem', color:'var(--text-1)', fontWeight:500 }}>{p.name}</span>
                  <span style={{ padding:'2px 8px', borderRadius:99, fontSize:'0.65rem', fontWeight:700, background:p.status==='ACTIVE'?'rgba(16,185,129,0.12)':'var(--raised)', color:p.status==='ACTIVE'?'#34d399':'var(--text-4)', border:`1px solid ${p.status==='ACTIVE'?'rgba(16,185,129,0.25)':'var(--border)'}` }}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="card" style={{ padding:'1rem' }}>
            <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text-1)', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
              <Clock size={14} style={{ color:'var(--brand)' }} /> Activity Timeline
            </div>
            <div style={{ position:'relative', maxHeight:200, overflowY:'auto' }}>
              <div style={{ position:'absolute', left:7, top:4, bottom:4, width:2, background:'var(--border)', borderRadius:99 }} />
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {member.activityLogs.length===0 ? (
                  <p style={{ fontSize:'0.8125rem', color:'var(--text-4)', paddingLeft:20 }}>No activity yet</p>
                ) : member.activityLogs.map(log => (
                  <div key={log.id} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                    <div style={{ width:16, height:16, borderRadius:'50%', background:'linear-gradient(135deg, var(--brand-light), var(--brand-dark))', flexShrink:0, marginTop:2, zIndex:1 }} />
                    <div>
                      <p style={{ fontSize:'0.8125rem', color:'var(--text-2)', margin:0 }}>{log.action.replace(/_/g,' ')}</p>
                      <p style={{ fontSize:'0.75rem', color:'var(--text-4)', margin:'2px 0 0' }}>{timeAgo(log.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reassign Modal */}
      <Modal open={reassignModal} onClose={() => setRM(false)} title="Reassign All Active Tasks">
        <p style={{ fontSize:'0.875rem', color:'var(--text-3)', marginBottom:16 }}>
          Reassign all active tasks from <strong style={{ color:'var(--text-1)' }}>{member.name}</strong> to:
        </p>
        <div><label className="label">Select Member</label>
          <select className="select" value={reassignTo} onChange={e => setRT(e.target.value)}>
            <option value="">Choose member…</option>
            {allMembers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
          </select>
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:16 }}>
          <button className="btn-secondary" onClick={() => setRM(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleReassign} disabled={!reassignTo||actionLoading}><RefreshCw size={13}/>Reassign</button>
        </div>
      </Modal>
    </div>
  );
}
