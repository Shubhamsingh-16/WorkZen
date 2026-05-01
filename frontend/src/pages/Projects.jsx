import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../store/AuthContext';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../store/ToastContext';
import { fmtDate } from '../utils/helpers';
import { Plus, Pencil, Trash2, FolderKanban, Users, CheckSquare, UserPlus } from 'lucide-react';

function ProgressBar({ value, color = 'var(--brand)' }) {
  return (
    <div style={{ height: 5, background: 'var(--raised)', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, value))}%`, background: color, borderRadius: 99, transition: 'width 0.8s ease' }} />
    </div>
  );
}

export default function Projects() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [addMemberModal, setAddMemberModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [memberToAdd, setMemberToAdd] = useState('');
  const [form, setForm] = useState({ name: '', description: '', deadline: '', status: 'ACTIVE' });

  const fetchProjects = useCallback(() => {
    setLoading(true);
    api.get('/api/projects').then(r => setProjects(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useEffect(() => { if (isAdmin) api.get('/api/admin/members').then(r => setMembers(r.data)); }, [isAdmin]);

  const openCreate = () => { setEditItem(null); setForm({ name: '', description: '', deadline: '', status: 'ACTIVE' }); setShowModal(true); };
  const openEdit   = p   => { setEditItem(p); setForm({ name: p.name, description: p.description || '', deadline: p.deadline ? p.deadline.split('T')[0] : '', status: p.status }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, deadline: form.deadline || null };
      if (editItem) await api.put(`/api/projects/${editItem.id}`, payload);
      else await api.post('/api/projects', payload);
      setShowModal(false);
      fetchProjects();
      toast.success(editItem ? 'Project updated!' : 'Project created! 🎉');
    } catch { toast.error('Failed to save project'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try { await api.delete(`/api/projects/${id}`); fetchProjects(); toast.success('Project deleted'); }
    catch { toast.error('Failed to delete project'); }
  };

  const handleAddMember = async () => {
    if (!memberToAdd) return;
    try { await api.post(`/api/projects/${addMemberModal.id}/members`, { userId: memberToAdd }); setAddMemberModal(null); setMemberToAdd(''); fetchProjects(); toast.success('Member added!'); }
    catch { toast.error('Failed to add member'); }
  };

  const handleRemoveMember = async (projectId, userId) => {
    if (!confirm('Remove this member?')) return;
    try { await api.delete(`/api/projects/${projectId}/members/${userId}`); fetchProjects(); toast.success('Member removed'); }
    catch { toast.error('Failed to remove member'); }
  };

  // Calculate completion pct from tasks
  const completionPct = p => {
    const total = p._count?.tasks || 0;
    if (!total) return 0;
    return Math.round(((p._count?.doneTasks || 0) / total) * 100);
  };

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--brand-light), var(--brand-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderKanban size={14} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Projects</h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', margin: 0 }}>{projects.length} projects</p>
          </div>
        </div>
        {isAdmin && <button className="btn-primary" onClick={openCreate}><Plus size={15} />New Project</button>}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 16 }}>
          {[1,2,3].map(i => <Skeleton key={i} w="100%" h={180} r={14} />)}
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>📁</div>
          <p style={{ fontWeight: 600, color: 'var(--text-2)', fontSize: '1.0625rem' }}>No projects yet</p>
          <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', marginBottom: 20 }}>Create a project to start organizing your team's work</p>
          {isAdmin && <button className="btn-primary" onClick={openCreate}><Plus size={15} />Create First Project</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 16 }}>
          {projects.map(p => {
            const pct = completionPct(p);
            const isActive = p.status === 'ACTIVE';
            return (
              <div key={p.id} className="card card-hover" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.2s', cursor: 'default' }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? 'var(--success)' : 'var(--text-4)', flexShrink: 0 }} />
                      <h3 className="truncate" style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-1)', margin: 0 }}>{p.name}</h3>
                      <span style={{ padding: '2px 7px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 700, background: isActive ? 'rgba(16,185,129,0.12)' : 'var(--raised)', color: isActive ? '#34d399' : 'var(--text-4)', border: `1px solid ${isActive ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`, flexShrink: 0 }}>
                        {p.status}
                      </span>
                    </div>
                    {p.description && <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>{p.description}</p>}
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => openEdit(p)}><Pencil size={12} /></button>
                      <button className="btn-icon" style={{ width: 28, height: 28, color: '#f87171' }} onClick={() => handleDelete(p.id)}><Trash2 size={12} /></button>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8125rem', color: 'var(--text-3)' }}>
                    <CheckSquare size={13} />{p._count?.tasks || 0} tasks
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8125rem', color: 'var(--text-3)' }}>
                    <Users size={13} />{p.members?.length || 0} members
                  </span>
                  {p.deadline && <span style={{ fontSize: '0.8125rem', color: 'var(--text-4)' }}>Due {fmtDate(p.deadline)}</span>}
                </div>

                {/* Progress */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>Progress</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: pct === 100 ? '#34d399' : 'var(--brand)' }}>{pct}%</span>
                  </div>
                  <ProgressBar value={pct} color={pct === 100 ? '#10b981' : 'var(--brand)'} />
                </div>

                {/* Members */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex' }}>
                    {(p.members || []).slice(0, 5).map((m, i) => (
                      <div key={m.userId} title={m.user?.name} style={{
                        width: 26, height: 26, borderRadius: '50%', border: '2px solid var(--surface)',
                        background: 'linear-gradient(135deg, var(--brand-light), var(--brand-dark))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '0.6rem', fontWeight: 700, marginLeft: i > 0 ? -8 : 0,
                        zIndex: 10 - i, position: 'relative', flexShrink: 0, cursor: 'default',
                      }}>
                        {m.user?.name?.[0]}
                      </div>
                    ))}
                    {(p.members?.length || 0) > 5 && (
                      <div style={{ width: 26, height: 26, borderRadius: '50%', border: '2px solid var(--surface)', background: 'var(--raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '0.6rem', fontWeight: 700, marginLeft: -8, zIndex: 1 }}>
                        +{p.members.length - 5}
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <button className="btn-icon" style={{ width: 26, height: 26, borderStyle: 'dashed', marginLeft: 4 }} onClick={() => setAddMemberModal(p)} title="Add member">
                      <UserPlus size={11} />
                    </button>
                  )}
                  {isAdmin && p.members?.length > 0 && (
                    <button style={{ fontSize: '0.7rem', color: 'var(--text-4)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}
                      onClick={() => {
                        const m = p.members[p.members.length - 1];
                        if (confirm(`Remove ${m.user?.name}?`)) handleRemoveMember(p.id, m.userId);
                      }}>
                      Remove last
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Project' : 'New Project'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label className="label">Project Name *</label><input className="input" placeholder="e.g. Mobile App v2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label">Description</label><textarea className="input" style={{ minHeight: 80, resize: 'none' }} placeholder="What's this project about?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label className="label">Status</label><select className="select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option value="ACTIVE">Active</option><option value="ARCHIVED">Archived</option></select></div>
            <div><label className="label">Deadline</label><input type="date" className="input" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving || !form.name}>{saving ? 'Saving…' : editItem ? 'Save Changes' : 'Create Project'}</button>
          </div>
        </div>
      </Modal>

      {/* Add Member Modal */}
      <Modal open={!!addMemberModal} onClose={() => setAddMemberModal(null)} title={`Add Member to "${addMemberModal?.name}"`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label className="label">Select Member</label>
            <select className="select" value={memberToAdd} onChange={e => setMemberToAdd(e.target.value)}>
              <option value="">Choose a team member…</option>
              {members.filter(m => !addMemberModal?.members?.some(pm => pm.userId === m.id)).map(m => <option key={m.id} value={m.id}>{m.name} — {m.email}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setAddMemberModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleAddMember} disabled={!memberToAdd}><UserPlus size={14} />Add Member</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
