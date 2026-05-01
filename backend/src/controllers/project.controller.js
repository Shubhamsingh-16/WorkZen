const prisma = require('../utils/prisma');
const { logActivity } = require('../utils/activity');

// GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const projects = await prisma.project.findMany({
      where: isAdmin ? {} : { members: { some: { userId: req.user.id } } },
      include: {
        createdBy: { select: { id: true, name: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
};

// POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const { name, description, deadline, status } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required.' });

    const project = await prisma.project.create({
      data: {
        name, description,
        deadline: deadline ? new Date(deadline) : null,
        status: status || 'ACTIVE',
        createdById: req.user.id,
        members: { create: { userId: req.user.id } }, // creator auto-joined
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        members:   { include: { user: { select: { id: true, name: true } } } },
      },
    });

    await logActivity({ action: 'PROJECT_CREATED', entityType: 'PROJECT', entityId: project.id, userId: req.user.id, metadata: { name } });
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create project.' });
  }
};

// GET /api/projects/:id
exports.getProjectById = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: { select: { id: true, name: true } },
        members:   { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy:  { select: { id: true, name: true } },
            _count: { select: { comments: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    const isMember = project.members.some(m => m.userId === req.user.id);
    if (!isMember && req.user.role !== 'ADMIN')
      return res.status(403).json({ error: 'Access denied.' });

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project.' });
  }
};

// PUT /api/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const { name, description, deadline, status } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(name        !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(deadline    !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(status      !== undefined && { status }),
      },
    });
    await logActivity({ action: 'PROJECT_UPDATED', entityType: 'PROJECT', entityId: project.id, userId: req.user.id });
    res.json(project);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Project not found.' });
    res.status(500).json({ error: 'Failed to update project.' });
  }
};

// DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    await logActivity({ action: 'PROJECT_DELETED', entityType: 'PROJECT', entityId: req.params.id, userId: req.user.id });
    res.json({ message: 'Project deleted.' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Project not found.' });
    res.status(500).json({ error: 'Failed to delete project.' });
  }
};

// POST /api/projects/:id/members
exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required.' });

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) return res.status(404).json({ error: 'User not found.' });

    const member = await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: req.params.id, userId } },
      update: {},
      create: { projectId: req.params.id, userId },
    });
    await logActivity({ action: 'MEMBER_ADDED', entityType: 'PROJECT', entityId: req.params.id, userId: req.user.id, metadata: { addedUserId: userId } });
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add member.' });
  }
};

// DELETE /api/projects/:id/members/:userId
exports.removeMember = async (req, res) => {
  try {
    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: req.params.id, userId: req.params.userId } },
    });
    await logActivity({ action: 'MEMBER_REMOVED', entityType: 'PROJECT', entityId: req.params.id, userId: req.user.id, metadata: { removedUserId: req.params.userId } });
    res.json({ message: 'Member removed.' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Member not found.' });
    res.status(500).json({ error: 'Failed to remove member.' });
  }
};
