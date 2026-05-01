const prisma = require('../utils/prisma');
const { logActivity } = require('../utils/activity');

// GET /api/tasks  (with filters)
exports.getTasks = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const { status, priority, projectId, assignedToId, search, overdue } = req.query;
    const now = new Date();

    const where = {
      // Non-admins only see their tasks
      ...(!isAdmin && { assignedToId: req.user.id }),
      ...(status       && { status }),
      ...(priority     && { priority }),
      ...(projectId    && { projectId }),
      ...(assignedToId && isAdmin && { assignedToId }),
      ...(search && { title: { contains: search, mode: 'insensitive' } }),
      ...(overdue === 'true' && { dueDate: { lt: now }, status: { not: 'DONE' } }),
    };

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project:    { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy:  { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
};

// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate, projectId, assignedToId } = req.body;
    if (!title)     return res.status(400).json({ error: 'title is required.' });
    if (!projectId) return res.status(400).json({ error: 'projectId is required.' });

    const task = await prisma.task.create({
      data: {
        title, description,
        priority:    priority || 'MEDIUM',
        status:      status   || 'TODO',
        dueDate:     dueDate  ? new Date(dueDate) : null,
        projectId,
        assignedToId: assignedToId || null,
        createdById: req.user.id,
      },
      include: {
        project:    { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy:  { select: { id: true, name: true } },
      },
    });

    await logActivity({ action: 'TASK_CREATED', entityType: 'TASK', entityId: task.id, userId: req.user.id, metadata: { title } });
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task.' });
  }
};

// PATCH /api/tasks/bulk  ← MUST be before /:id
exports.bulkAction = async (req, res) => {
  try {
    const { taskIds, action, value } = req.body;
    if (!Array.isArray(taskIds) || !taskIds.length)
      return res.status(400).json({ error: 'taskIds array is required.' });

    const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

    if (action === 'delete') {
      await prisma.task.deleteMany({ where: { id: { in: taskIds } } });
      await logActivity({ action: 'BULK_DELETE', entityType: 'TASK', userId: req.user.id, metadata: { count: taskIds.length } });
      return res.json({ message: `${taskIds.length} task(s) deleted.` });
    }

    if (action === 'status') {
      if (!VALID_STATUSES.includes(value))
        return res.status(400).json({ error: 'Invalid status value.' });
      await prisma.task.updateMany({ where: { id: { in: taskIds } }, data: { status: value } });
      await logActivity({ action: 'BULK_STATUS_CHANGE', entityType: 'TASK', userId: req.user.id, metadata: { newStatus: value, count: taskIds.length } });
      return res.json({ message: `${taskIds.length} task(s) updated to ${value}.` });
    }

    if (action === 'reassign') {
      await prisma.task.updateMany({ where: { id: { in: taskIds } }, data: { assignedToId: value || null } });
      await logActivity({ action: 'BULK_REASSIGN', entityType: 'TASK', userId: req.user.id, metadata: { assignedToId: value, count: taskIds.length } });
      return res.json({ message: `${taskIds.length} task(s) reassigned.` });
    }

    res.status(400).json({ error: "action must be 'delete', 'status', or 'reassign'." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Bulk action failed.' });
  }
};

// GET /api/tasks/:id
exports.getTaskById = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project:    { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy:  { select: { id: true, name: true } },
        comments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    if (req.user.role !== 'ADMIN' && task.assignedToId !== req.user.id)
      return res.status(403).json({ error: 'Access denied.' });

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task.' });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate, assignedToId } = req.body;

    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Task not found.' });
    if (req.user.role !== 'ADMIN' && existing.assignedToId !== req.user.id)
      return res.status(403).json({ error: 'Access denied.' });

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title        !== undefined && { title }),
        ...(description  !== undefined && { description }),
        ...(priority     !== undefined && { priority }),
        ...(status       !== undefined && { status }),
        ...(dueDate      !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assignedToId !== undefined && { assignedToId: assignedToId || null }),
      },
      include: {
        project:    { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy:  { select: { id: true, name: true } },
      },
    });
    await logActivity({ action: 'TASK_UPDATED', entityType: 'TASK', entityId: task.id, userId: req.user.id });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task.' });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    await logActivity({ action: 'TASK_DELETED', entityType: 'TASK', entityId: req.params.id, userId: req.user.id });
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Task not found.' });
    res.status(500).json({ error: 'Failed to delete task.' });
  }
};

// PATCH /api/tasks/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const VALID = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    if (!VALID.includes(status)) return res.status(400).json({ error: 'Invalid status.' });

    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Task not found.' });
    if (req.user.role !== 'ADMIN' && existing.assignedToId !== req.user.id)
      return res.status(403).json({ error: 'Access denied.' });

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { status },
    });
    await logActivity({
      action: 'STATUS_CHANGED', entityType: 'TASK', entityId: task.id, userId: req.user.id,
      metadata: { from: existing.status, to: status },
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
};

// PATCH /api/tasks/:id/reassign
exports.reassignTask = async (req, res) => {
  try {
    const { assignedToId } = req.body;
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { assignedToId: assignedToId || null },
      include: { assignedTo: { select: { id: true, name: true, email: true } } },
    });
    await logActivity({ action: 'TASK_REASSIGNED', entityType: 'TASK', entityId: task.id, userId: req.user.id, metadata: { assignedToId } });
    res.json(task);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Task not found.' });
    res.status(500).json({ error: 'Failed to reassign task.' });
  }
};

// GET /api/tasks/:id/comments
exports.getComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { taskId: req.params.id },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
};

// POST /api/tasks/:id/comments
exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'content is required.' });

    const taskExists = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!taskExists) return res.status(404).json({ error: 'Task not found.' });

    const comment = await prisma.comment.create({
      data: { content: content.trim(), taskId: req.params.id, userId: req.user.id },
      include: { user: { select: { id: true, name: true } } },
    });
    await logActivity({ action: 'COMMENT_ADDED', entityType: 'TASK', entityId: req.params.id, userId: req.user.id });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create comment.' });
  }
};
