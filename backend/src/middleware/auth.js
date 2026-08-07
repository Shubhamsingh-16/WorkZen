const jwt  = require('jsonwebtoken');
const prisma = require('../utils/prisma');

/**
 * Verifies JWT, fetches user from DB, checks isActive, updates lastActive.
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Prefer httpOnly cookie; fall back to Authorization header (Postman / legacy clients)
    let token = req.cookies?.token;
    if (!token) {
      const header = req.headers.authorization;
      if (header?.startsWith('Bearer ')) {
        token = header.split(' ')[1];
      }
    }
    if (!token) {
      return res.status(401).json({ error: 'No token provided.' });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: 'User not found.' });

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account deactivated. Contact admin.' });
    }

    // Update lastActive (fire-and-forget — non-blocking)
    prisma.user.update({ where: { id: user.id }, data: { lastActive: new Date() } })
      .catch((e) => console.error('[Auth] lastActive update failed:', e.message));

    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    console.error('[Auth middleware]', err);
    res.status(500).json({ error: 'Authentication error.' });
  }
};

/**
 * Must be used AFTER authMiddleware. Rejects non-ADMIN users.
 */
const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
