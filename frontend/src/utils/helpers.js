import { formatDistanceToNow, format } from 'date-fns';

export const STATUS_STYLES = {
  TODO:        { label: 'Todo',        cls: 'bg-zinc-700/60 text-zinc-300 border-zinc-600' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  REVIEW:      { label: 'Review',      cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  DONE:        { label: 'Done',        cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
};

export const PRIORITY_STYLES = {
  LOW:      { label: 'Low',      cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
  MEDIUM:   { label: 'Medium',   cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  HIGH:     { label: 'High',     cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  CRITICAL: { label: 'Critical', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

export const ROLE_STYLES = {
  ADMIN:  'bg-brand-500/20 text-brand-400 border-brand-500/30',
  MEMBER: 'bg-zinc-700/60 text-zinc-300 border-zinc-600',
};

export function timeAgo(date) {
  if (!date) return 'Never';
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); }
  catch { return '—'; }
}

export function fmtDate(date) {
  if (!date) return '—';
  try { return format(new Date(date), 'MMM d, yyyy'); }
  catch { return '—'; }
}

export function isOverdue(dueDate, status) {
  if (!dueDate || status === 'DONE') return false;
  return new Date(dueDate) < new Date();
}

export function getInitials(name = '') {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

export function actionLabel(action) {
  const map = {
    TASK_CREATED:       'created a task',
    TASK_UPDATED:       'updated a task',
    TASK_DELETED:       'deleted a task',
    STATUS_CHANGED:     'changed task status',
    TASK_REASSIGNED:    'reassigned a task',
    PROJECT_CREATED:    'created a project',
    PROJECT_UPDATED:    'updated a project',
    PROJECT_DELETED:    'deleted a project',
    MEMBER_ADDED:       'added a member',
    MEMBER_REMOVED:     'removed a member',
    ROLE_CHANGED:       'changed a role',
    ACCOUNT_ACTIVATED:  'activated account',
    ACCOUNT_DEACTIVATED:'deactivated account',
    COMMENT_ADDED:      'added a comment',
    USER_REGISTERED:    'registered',
    USER_LOGGED_IN:     'logged in',
    BULK_DELETE:        'bulk deleted tasks',
    BULK_STATUS_CHANGE: 'bulk updated task statuses',
    BULK_REASSIGN:      'bulk reassigned tasks',
  };
  return map[action] || action;
}
