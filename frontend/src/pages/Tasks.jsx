import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import { Modal } from '../components/ui/Modal';
import { SkeletonTable } from '../components/ui/Skeleton';
import { fmtDate, isOverdue } from '../utils/helpers';
import { Plus, Search, AlertTriangle, Trash2, CheckSquare, Filter, X } from 'lucide-react';

const STATUSES   = ['TODO','IN_PROGRESS','REVIEW','DONE'];
const PRIORITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];
const PRIORITY_COLOR = { LOW:'#10b981', MEDIUM:'#f59e0b', HIGH:'#f97316', CRITICAL:'#ef4444' };
const STATUS_COLOR   = { TODO:'#71717a', IN_PROGRESS:'#3b82f6', REVIEW:'#f59e0b', DONE:'#10b981' };

function PBadge({ priority }) {
  const c = PRIORITY_COLOR[priority] || '#6b7280';
  return <span style={{ padding:'2px 8px', borderRadius:99, fontSize:'0.65rem', fontWeight:700, background:`${c}18`, color:c, border:`1px solid ${c}35` }}>{priority}</span>;
}
function SBadge({ status }) {
  const c = STATUS_COLOR[status] || '#6b7280';
  return <span style={{ padding:'2px 8px', borderRadius:99, fontSize:'0.65rem', fontWeight:700, background:`${c}18`, color:c, border:`1px solid ${c}35` }}>{status.replace('_',' ')}</span>;
}

export default function Tasks() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [tasks,    setTasks]    = useState([]);
  const [projects, setProjects] = useState([]);
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState([]);
  const [search,   setSearch]   = useState(searchParams.get('search') || '');
  const [filters,  setFilters]  = useState({ status:'', priority:'', projectId:'', overdue:'' });
  const [showModal,  setShowModal]  = useState(false);
  const [editTask,   setEditTask]   = useState(null);
  const [viewTask,   setViewTask]   = useState(null);
  const [comments,   setComments]   = useState([]);
  const [newComment, setNewComment] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkValue,  setBulkValue]  = useState('');
  const [form, setForm] = useState({ title:'', description:'', priority:'MEDIUM', status:'TODO', dueDate:'', projectId:'', assignedToId:'' });

  const buildQuery = useCallback(() => {
    const p = new URLSearchParams();
    if (search)          p.set('search',    search);
    if (filters.status)  p.set('status',    filters.status);
    if (filters.priority)p.set('priority',  filters.priority);
    if (filters.projectId)p.set('projectId',filters.projectId);
    if (filters.overdue) p.set('overdue',   'true');
    return p.toString();
  }, [search, filters]);

  const fetchTasks = useCallback(() => {
    setLoading(true);
    api.get(`/api/tasks?${buildQuery()}`).then(r => setTasks(r.data)).catch(() => toast.error('Failed to load tasks')).finally(() => setLoading(false));
  }, [buildQuery]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => {
    api.get('/api/projects').then(r => setProjects(r.data));
    if (isAdmin) api.get('/api/admin/members').then(r => setMembers(r.data));
  }, [isAdmin]);

  const openCreate = () => { setEditTask(null); setForm({ title:'',description:'',priority:'MEDIUM',status:'TODO',dueDate:'',projectId:'',assignedToId:'' }); setShowModal(true); };
  const openEdit   = (t,e) => { e?.stopPropagation(); setEditTask(t); setForm({ title:t.title, description:t.description||'', priority:t.priority, status:t.status, dueDate:t.dueDate?t.dueDate.split('T')[0]:'', projectId:t.projectId, assignedToId:t.assignedToId||'' }); setShowModal(true); };

  const openView = async (t) => {
    setViewTask(t);
    try { const r = await api.get(`/api/tasks/${t.id}/comments`); setComments(r.data); } catch {}
  };

  const handleSave = async () => {
    if (!form.title || !form.projectId) return toast.error('Title and project are required');
    setSaving(true);
    try {
      const p = { ...form, dueDate: form.dueDate||null, assignedToId: form.assignedToId||null };
      if (editTask) await api.put(`/api/tasks/${editTask.id}`, p);
      else await api.post('/api/tasks', p);
      setShowModal(false); fetchTasks();
      toast.success(editTask ? 'Task updated!' : 'Task created! 🎉');
    } catch { toast.error('Failed to save task'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, e) => { e?.stopPropagation(); if (!confirm('Delete task?')) return; await api.delete(`/api/tasks/${id}`); fetchTasks(); toast.success('Task deleted'); };

  const handleStatus = async (taskId, status) => {
    await api.patch(`/api/tasks/${taskId}/status`, { status });
    fetchTasks();
    if (viewTask?.id === taskId) setViewTask(t => ({ ...t, status }));
  };

  const handleBulk = async () => {
    if (!selected.length || !bulkAction) return;
    try {
      await api.patch('/api/tasks/bulk', { taskIds: selected, action: bulkAction, value: bulkValue });
      setSelected([]); setBulkAction(''); setBulkValue(''); fetchTasks();
      toast.success(`Bulk ${bulkAction} applied`);
    } catch { toast.error('Bulk action failed'); }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !viewTask) return;
    await api.post(`/api/tasks/${viewTask.id}/comments`, { content: newComment });
    setNewComment('');
    const r = await api.get(`/api/tasks/${viewTask.id}/comments`); setComments(r.data);
  };

  const toggle    = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = ()  => setSelected(s => s.length === tasks.length ? [] : tasks.map(t => t.id));

  const setF = k => v => setFilters(f => ({ ...f, [k]: v }));

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg, var(--brand-light), var(--brand-dark))', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <CheckSquare size={14} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize:'1.25rem', fontWeight:700, color:'var(--text-1)', margin:0 }}>{isAdmin?'All Tasks':'My Tasks'}</h1>
            <p style={{ fontSize:'0.8125rem', color:'var(--text-3)', margin:0 }}>{tasks.length} tasks</p>
          </div>
        </div>
        {isAdmin && <button className="btn-primary" onClick={openCreate}><Plus size={15}/>New Task</button>}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
        <div style={{ position:'relative', flex:'1', minWidth:200, maxWidth:320 }}>
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-4)', pointerEvents:'none' }} />
          <input className="input" style={{ paddingLeft:32 }} placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ width:'auto', minWidth:130 }} value={filters.status}    onChange={e => setF('status')(e.target.value)}>
          <option value="">All Status</option>{STATUSES.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select className="select" style={{ width:'auto', minWidth:130 }} value={filters.priority}  onChange={e => setF('priority')(e.target.value)}>
          <option value="">All Priority</option>{PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
        </select>
        <select className="select" style={{ width:'auto', minWidth:140 }} value={filters.projectId} onChange={e => setF('projectId')(e.target.value)}>
          <option value="">All Projects</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button onClick={() => setF('overdue')(filters.overdue?'':'true')} style={{ display:'flex', alignItems:'center', gap:6, padding:'0 14px', height:38, borderRadius:10, border:`1.5px solid ${filters.overdue?'#ef4444':'var(--border)'}`, background:filters.overdue?'rgba(239,68,68,0.1)':'var(--surface)', color:filters.overdue?'#f87171':'var(--text-3)', fontWeight:600, fontSize:'0.8125rem', cursor:'pointer', transition:'all 0.15s', fontFamily:'inherit' }}>
          <AlertTriangle size={13}/> Overdue
        </button>
        {(search||filters.status||filters.priority||filters.projectId||filters.overdue) && (
          <button onClick={() => { setSearch(''); setFilters({ status:'',priority:'',projectId:'',overdue:'' }); }} className="btn-ghost" style={{ display:'flex', alignItems:'center', gap:5 }}>
            <X size={13}/> Clear
          </button>
        )}
      </div>

      {/* Floating Bulk Toolbar */}
      {isAdmin && selected.length > 0 && (
        <div className="animate-slide-up" style={{ position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)', zIndex:50, display:'flex', alignItems:'center', gap:10, padding:'10px 16px', background:'var(--surface)', border:'1.5px solid var(--brand-light)', borderRadius:14, boxShadow:'var(--shadow-lg)', backdropFilter:'blur(12px)', flexWrap:'wrap' }}>
          <span style={{ fontSize:'0.8125rem', fontWeight:700, color:'var(--brand)', whiteSpace:'nowrap' }}>{selected.length} selected</span>
          <div style={{ width:1, height:20, background:'var(--border)' }} />
          <select className="select" style={{ width:'auto', minWidth:140 }} value={bulkAction} onChange={e => { setBulkAction(e.target.value); setBulkValue(''); }}>
            <option value="">Bulk Action…</option>
            <option value="status">Change Status</option>
            <option value="reassign">Reassign</option>
            <option value="delete">Delete All</option>
          </select>
          {bulkAction==='status'   && <select className="select" style={{ width:'auto' }} value={bulkValue} onChange={e => setBulkValue(e.target.value)}><option value="">Status…</option>{STATUSES.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}</select>}
          {bulkAction==='reassign' && <select className="select" style={{ width:'auto' }} value={bulkValue} onChange={e => setBulkValue(e.target.value)}><option value="">Member…</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>}
          <button className="btn-primary" onClick={handleBulk} style={{ padding:'6px 14px' }}>Apply</button>
          <button className="btn-ghost"   onClick={() => setSelected([])}>Cancel</button>
        </div>
      )}

      {/* Table */}
      {loading ? <SkeletonTable rows={6} cols={isAdmin?7:6} /> : tasks.length===0 ? (
        <div style={{ textAlign:'center', padding:'5rem 1rem' }}>
          <div style={{ fontSize:'3.5rem', marginBottom:12 }}>✅</div>
          <p style={{ fontWeight:600, color:'var(--text-2)' }}>No tasks found</p>
          <p style={{ color:'var(--text-3)', fontSize:'0.875rem', marginBottom:20 }}>Try adjusting your filters or create a new task</p>
          {isAdmin && <button className="btn-primary" onClick={openCreate}><Plus size={14}/>New Task</button>}
        </div>
      ) : (
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--raised)', position:'sticky', top:0, zIndex:2 }}>
                  {isAdmin && <th className="table-header" style={{ width:40 }}><input type="checkbox" checked={selected.length===tasks.length&&tasks.length>0} onChange={toggleAll} style={{ accentColor:'var(--brand)', cursor:'pointer' }} /></th>}
                  {['Task','Project','Assignee','Priority','Status','Due',''].filter((h,i)=>isAdmin||i!==6).map(h=><th key={h} className="table-header">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => {
                  const over = isOverdue(task.dueDate, task.status);
                  return (
                    <tr key={task.id} className="table-row" onClick={() => openView(task)} style={{ background: over?'rgba(239,68,68,0.03)':'' }}>
                      {isAdmin && <td className="table-cell" onClick={e => { e.stopPropagation(); toggle(task.id); }}>
                        <input type="checkbox" checked={selected.includes(task.id)} onChange={()=>{}} style={{ accentColor:'var(--brand)', cursor:'pointer' }} />
                      </td>}
                      <td className="table-cell" style={{ maxWidth:260 }}>
                        <div style={{ fontWeight:600, color:over?'#fca5a5':'var(--text-1)', fontSize:'0.875rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{task.title}</div>
                        {over && <div style={{ display:'flex', alignItems:'center', gap:4, color:'#f87171', fontSize:'0.7rem', marginTop:2, fontWeight:600 }}><AlertTriangle size={10}/> Overdue</div>}
                      </td>
                      <td className="table-cell" style={{ fontSize:'0.8125rem', color:'var(--text-3)', maxWidth:140, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{task.project?.name}</td>
                      <td className="table-cell">
                        {task.assignedTo ? (
                          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                            <div style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg, var(--brand-light), var(--brand-dark))', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'0.6rem', fontWeight:700, flexShrink:0 }}>{task.assignedTo.name[0]}</div>
                            <span style={{ fontSize:'0.8125rem', color:'var(--text-2)' }}>{task.assignedTo.name}</span>
                          </div>
                        ) : <span style={{ fontSize:'0.8125rem', color:'var(--text-4)' }}>Unassigned</span>}
                      </td>
                      <td className="table-cell"><PBadge priority={task.priority} /></td>
                      <td className="table-cell" onClick={e => e.stopPropagation()}>
                        <select value={task.status} onChange={e => handleStatus(task.id, e.target.value)} style={{ background:'transparent', border:'none', color:STATUS_COLOR[task.status]||'var(--text-2)', fontWeight:700, fontSize:'0.8125rem', cursor:'pointer', outline:'none', fontFamily:'inherit' }}>
                          {STATUSES.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
                        </select>
                      </td>
                      <td className="table-cell" style={{ fontSize:'0.8125rem', color:over?'#f87171':'var(--text-4)', whiteSpace:'nowrap' }}>{fmtDate(task.dueDate)}</td>
                      {isAdmin && <td className="table-cell" onClick={e => e.stopPropagation()}>
                        <div style={{ display:'flex', gap:4 }}>
                          <button className="btn-ghost" style={{ padding:'4px 8px', fontSize:'0.75rem' }} onClick={e => openEdit(task,e)}>Edit</button>
                          <button className="btn-icon" style={{ width:28, height:28, color:'#f87171' }} onClick={e => handleDelete(task.id,e)}><Trash2 size={12}/></button>
                        </div>
                      </td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editTask?'Edit Task':'New Task'} size="lg">
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div><label className="label">Title *</label><input className="input" placeholder="Task title" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} /></div>
          <div><label className="label">Description</label><textarea className="input" style={{ minHeight:80, resize:'none' }} placeholder="Optional…" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label className="label">Priority</label><select className="select" value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))}>{PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
            <div><label className="label">Status</label><select className="select" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>{STATUSES.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}</select></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label className="label">Project *</label><select className="select" value={form.projectId} onChange={e => setForm(f=>({...f,projectId:e.target.value}))}><option value="">Select…</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            <div><label className="label">Due Date</label><input type="date" className="input" value={form.dueDate} onChange={e => setForm(f=>({...f,dueDate:e.target.value}))} /></div>
          </div>
          {isAdmin && <div><label className="label">Assignee</label><select className="select" value={form.assignedToId} onChange={e => setForm(f=>({...f,assignedToId:e.target.value}))}><option value="">Unassigned</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>}
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', paddingTop:4 }}>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving||!form.title||!form.projectId}>{saving?'Saving…':editTask?'Save Changes':'Create Task'}</button>
          </div>
        </div>
      </Modal>

      {/* Task Detail + Comments Modal */}
      <Modal open={!!viewTask} onClose={() => { setViewTask(null); setComments([]); }} title="Task Detail" size="lg">
        {viewTask && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <PBadge priority={viewTask.priority} />
              <SBadge status={viewTask.status} />
              {isOverdue(viewTask.dueDate, viewTask.status) && <span style={{ display:'flex', alignItems:'center', gap:4, color:'#f87171', fontSize:'0.75rem', fontWeight:700 }}><AlertTriangle size={12}/>Overdue</span>}
            </div>
            <h3 style={{ fontSize:'1.125rem', fontWeight:700, color:'var(--text-1)', margin:0 }}>{viewTask.title}</h3>
            {viewTask.description && <p style={{ fontSize:'0.875rem', color:'var(--text-3)', margin:0, lineHeight:1.6 }}>{viewTask.description}</p>}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'12px 14px', background:'var(--raised)', borderRadius:10 }}>
              {[['Project', viewTask.project?.name], ['Assignee', viewTask.assignedTo?.name||'Unassigned'], ['Due', fmtDate(viewTask.dueDate)]].map(([k,v]) => (
                <div key={k}><span style={{ fontSize:'0.75rem', color:'var(--text-4)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{k}</span><div style={{ fontSize:'0.875rem', color:'var(--text-1)', fontWeight:500, marginTop:2 }}>{v||'—'}</div></div>
              ))}
            </div>
            <div><label className="label">Update Status</label><select className="select" value={viewTask.status} onChange={e => handleStatus(viewTask.id, e.target.value)}>{STATUSES.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}</select></div>
            <div style={{ borderTop:'1px solid var(--border)', paddingTop:16 }}>
              <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text-2)', marginBottom:12 }}>Comments ({comments.length})</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, maxHeight:200, overflowY:'auto', marginBottom:12 }}>
                {comments.length===0 ? <p style={{ color:'var(--text-4)', fontSize:'0.8125rem' }}>No comments yet. Start the conversation!</p> : comments.map(c=>(
                  <div key={c.id} style={{ display:'flex', gap:10 }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg, var(--brand-light), var(--brand-dark))', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'0.65rem', fontWeight:700, flexShrink:0 }}>{c.user?.name?.[0]}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:3 }}>
                        <span style={{ fontSize:'0.8125rem', fontWeight:600, color:'var(--text-1)' }}>{c.user?.name}</span>
                        <span style={{ fontSize:'0.7rem', color:'var(--text-4)' }}>{fmtDate(c.createdAt)}</span>
                      </div>
                      <p style={{ fontSize:'0.875rem', color:'var(--text-2)', margin:0, lineHeight:1.5 }}>{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <input className="input" placeholder="Add a comment…" value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key==='Enter' && submitComment()} style={{ flex:1 }} />
                <button className="btn-primary" onClick={submitComment} style={{ padding:'0 16px' }}>Post</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
