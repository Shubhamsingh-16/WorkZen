const prisma = require('../utils/prisma');
const { logActivity } = require('../utils/activity');

// ── Helper ──────────────────────────────────────────────────────────────
function calcTaskStats(tasks) {
  const now = new Date();
  const total     = tasks.length;
  const completed = tasks.filter(t => t.status === 'DONE').length;
  const pending   = tasks.filter(t => t.status !== 'DONE').length;
  const overdue   = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;
  return { total, completed, pending, overdue, completionRate };
}

// GET /api/admin/members
exports.getMembers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        isActive: true, lastActive: true, createdAt: true,
        projectMembers: { select: { projectId: true } },
        assignedTasks:  { select: { id: true, status: true, dueDate: true } },
      },
    });

    const members = users.map(u => ({
      id: u.id, name: u.name, email: u.email, role: u.role,
      isActive: u.isActive, lastActive: u.lastActive, createdAt: u.createdAt,
      projectsCount: u.projectMembers.length,
      tasks: calcTaskStats(u.assignedTasks),
    }));

    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch members.' });
  }
};

// GET /api/admin/members/:id
exports.getMemberById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, role: true, isActive: true, lastActive: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'Member not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch member.' });
  }
};

// GET /api/admin/members/:id/profile
exports.getMemberProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        assignedTasks: {
          include: { project: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        projectMembers: { include: { project: true } },
        activityLogs:   { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!user) return res.status(404).json({ error: 'Member not found.' });

    const { password, ...safe } = user;
    res.json({
      ...safe,
      joinedAt: user.createdAt,
      stats: calcTaskStats(user.assignedTasks),
      projects: user.projectMembers.map(pm => pm.project),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch member profile.' });
  }
};

// PATCH /api/admin/members/:id/role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['ADMIN', 'MEMBER'].includes(role))
      return res.status(400).json({ error: "role must be 'ADMIN' or 'MEMBER'." });
    if (id === req.user.id)
      return res.status(400).json({ error: 'Cannot change your own role.' });

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, role: true },
    });
    await logActivity({ action: 'ROLE_CHANGED', entityType: 'USER', entityId: id, userId: req.user.id, metadata: { newRole: role } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role.' });
  }
};

// PATCH /api/admin/members/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean')
      return res.status(400).json({ error: 'isActive must be a boolean.' });
    if (id === req.user.id)
      return res.status(400).json({ error: 'Cannot change your own account status.' });

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, isActive: true },
    });
    await logActivity({
      action: isActive ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DEACTIVATED',
      entityType: 'USER', entityId: id, userId: req.user.id,
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
};

// DELETE /api/admin/members/:id
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id)
      return res.status(400).json({ error: 'Cannot delete your own account.' });

    await prisma.user.delete({ where: { id } });
    await logActivity({ action: 'USER_DELETED', entityType: 'USER', entityId: id, userId: req.user.id });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Member not found.' });
    res.status(500).json({ error: 'Failed to delete member.' });
  }
};

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const now = new Date();
    const [totalMembers, activeMembers, deactivatedMembers,
           totalProjects, activeProjects, archivedProjects,
           allTasks, allUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.project.count({ where: { status: 'ARCHIVED' } }),
      prisma.task.findMany({ select: { status: true, dueDate: true } }),
      prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true, name: true,
          assignedTasks: { select: { status: true, dueDate: true } },
        },
      }),
    ]);

    const tasks = {
      total:      allTasks.length,
      todo:       allTasks.filter(t => t.status === 'TODO').length,
      inProgress: allTasks.filter(t => t.status === 'IN_PROGRESS').length,
      review:     allTasks.filter(t => t.status === 'REVIEW').length,
      done:       allTasks.filter(t => t.status === 'DONE').length,
      overdue:    allTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length,
    };

    const userStats = allUsers.map(u => {
      const s = calcTaskStats(u.assignedTasks);
      return { id: u.id, name: u.name, ...s };
    });

    const topPerformers = [...userStats]
      .filter(u => u.total > 0)
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 3)
      .map(({ name, completed: completedTasks, completionRate }) => ({ name, completedTasks, completionRate }));

    const membersWithOverdue = userStats
      .filter(u => u.overdue > 0)
      .map(({ id, name, overdue: overdueCount }) => ({ id, name, overdueCount }));

    res.json({
      members:  { total: totalMembers, active: activeMembers, deactivated: deactivatedMembers },
      projects: { total: totalProjects, active: activeProjects, archived: archivedProjects },
      tasks,
      topPerformers,
      membersWithOverdue,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
};
