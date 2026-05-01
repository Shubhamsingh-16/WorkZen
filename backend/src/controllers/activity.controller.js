const prisma = require('../utils/prisma');

// GET /api/activity
exports.getActivity = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const { projectId, limit = '50' } = req.query;

    const where = {
      ...(!isAdmin && { userId: req.user.id }),
      ...(projectId && {}), // activity logs don't have projectId — filter by related tasks if needed
    };

    const logs = await prisma.activityLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: Math.min(parseInt(limit) || 50, 100),
    });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch activity.' });
  }
};
