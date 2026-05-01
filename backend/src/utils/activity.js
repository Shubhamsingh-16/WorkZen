const prisma = require('./prisma');

/**
 * Logs an activity to the DB. Never throws — failures are silent to avoid
 * breaking the main request flow.
 *
 * @param {{ action: string, entityType: string, entityId?: string, userId: string, metadata?: object }} opts
 */
async function logActivity({ action, entityType, entityId = null, userId, metadata = {} }) {
  try {
    await prisma.activityLog.create({
      data: { action, entityType, entityId, userId, metadata },
    });
  } catch (err) {
    console.error('[ActivityLog] Failed to write:', err.message);
  }
}

module.exports = { logActivity };
