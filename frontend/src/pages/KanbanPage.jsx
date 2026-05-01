import { useState, useEffect, useCallback } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../api';
import { fmtDate, isOverdue } from '../utils/helpers';
import { AlertTriangle, GripVertical, Calendar, User, Kanban } from 'lucide-react';
import { useToast } from '../store/ToastContext';

const COLUMNS = [
  { id: 'TODO',        label: 'Todo',        color: '#71717a', headerBg: 'rgba(113,113,122,0.1)', dot: '#71717a' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#60a5fa', headerBg: 'rgba(59,130,246,0.1)', dot: '#3b82f6' },
  { id: 'REVIEW',      label: 'Review',      color: '#fbbf24', headerBg: 'rgba(245,158,11,0.1)', dot: '#f59e0b' },
  { id: 'DONE',        label: 'Done',        color: '#34d399', headerBg: 'rgba(16,185,129,0.1)', dot: '#10b981' },
];

const PRIORITY_LEFT = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' };

function KanbanCard({ task, isDragging }) {
  const overdue = isOverdue(task.dueDate, task.status);
  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${overdue ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
      borderLeft: `3px solid ${PRIORITY_LEFT[task.priority] || '#6b7280'}`,
      borderRadius: 10,
      padding: '12px 14px',
      cursor: 'grab',
      boxShadow: isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
      opacity: isDragging ? 0.5 : 1,
      transition: 'box-shadow 0.2s, transform 0.15s',
      background: overdue ? 'rgba(239,68,68,0.04)' : 'var(--surface)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: overdue ? '#fca5a5' : 'var(--text-1)', lineHeight: 1.4, margin: 0 }}>{task.title}</p>
        <span style={{ padding: '2px 7px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 700, background: `${PRIORITY_LEFT[task.priority]}20`, color: PRIORITY_LEFT[task.priority], flexShrink: 0, border: `1px solid ${PRIORITY_LEFT[task.priority]}40` }}>
          {task.priority}
        </span>
      </div>
      {task.description && <p style={{ fontSize: '0.75rem', color: 'var(--text-4)', margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{task.description}</p>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{task.project?.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {overdue && <AlertTriangle size={11} style={{ color: '#f87171' }} />}
          {task.dueDate && (
            <span style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 3, color: overdue ? '#f87171' : 'var(--text-4)' }}>
              <Calendar size={10} />{fmtDate(task.dueDate)}
            </span>
          )}
          {task.assignedTo && (
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-light), var(--brand-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6rem', fontWeight: 700 }}>
              {task.assignedTo.name[0]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SortableCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes} {...listeners}>
      <KanbanCard task={task} isDragging={isDragging} />
    </div>
  );
}

export default function KanbanPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const toast = useToast();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchTasks = useCallback(() => {
    setLoading(true);
    api.get('/api/tasks').then(r => setTasks(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleDragStart = e => setActiveTask(tasks.find(t => t.id === e.active.id));
  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;
    const task = tasks.find(t => t.id === active.id);
    const overCol = COLUMNS.find(c => c.id === over.id);
    const overTask = tasks.find(t => t.id === over.id);
    const newStatus = overCol?.id || overTask?.status;
    if (!newStatus || newStatus === task?.status) return;
    setTasks(prev => prev.map(t => t.id === active.id ? { ...t, status: newStatus } : t));
    try {
      await api.patch(`/api/tasks/${active.id}/status`, { status: newStatus });
      toast.success(`Moved to ${newStatus.replace('_', ' ')}`);
    } catch { fetchTasks(); toast.error('Failed to update task status'); }
  };

  const byStatus = s => tasks.filter(t => t.status === s);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--brand-light), var(--brand-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Kanban size={14} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Kanban Board</h1>
        </div>
        <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', marginLeft: 38 }}>Drag tasks between columns to update status</p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {COLUMNS.map(c => (
            <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="skeleton" style={{ height: 40, borderRadius: 10 }} />
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 10 }} />)}
            </div>
          ))}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {COLUMNS.map(col => {
              const colTasks = byStatus(col.id);
              return (
                <div key={col.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Column header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: col.headerBg, borderRadius: 10, border: `1px solid ${col.color}30`, position: 'sticky', top: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot, flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: col.color }}>{col.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: col.color, background: `${col.color}25`, padding: '2px 8px', borderRadius: 99 }}>{colTasks.length}</span>
                  </div>

                  {/* Column body */}
                  <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div style={{
                      flex: 1, display: 'flex', flexDirection: 'column', gap: 8,
                      minHeight: 180, padding: 8,
                      borderRadius: 12,
                      border: '2px dashed var(--border)',
                      transition: 'border-color 0.2s, background 0.2s',
                    }}>
                      {colTasks.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-4)', fontSize: '0.8125rem', padding: '2rem 0', flexDirection: 'column', gap: 8 }}>
                          <span style={{ opacity: 0.4, fontSize: '1.5rem' }}>📋</span>
                          <span>Drop tasks here</span>
                        </div>
                      ) : colTasks.map(task => <SortableCard key={task.id} task={task} />)}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>
          <DragOverlay>{activeTask && <div style={{ transform: 'rotate(2deg)', boxShadow: 'var(--shadow-lg)' }}><KanbanCard task={activeTask} /></div>}</DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
