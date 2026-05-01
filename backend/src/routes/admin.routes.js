const router = require('express').Router();
const c = require('../controllers/admin.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);

router.get('/stats',           c.getStats);
router.get('/members',         c.getMembers);
router.get('/members/:id',     c.getMemberById);
router.get('/members/:id/profile', c.getMemberProfile);
router.patch('/members/:id/role',   c.updateRole);
router.patch('/members/:id/status', c.updateStatus);
router.delete('/members/:id',  c.deleteMember);

module.exports = router;
