const router = require('express').Router();
const c = require('../controllers/task.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// ─── List & Create ─────────────────────────────────────────────────────
router.get('/',   c.getTasks);
router.post('/',  c.createTask);

// ─── BULK — MUST be before /:id ────────────────────────────────────────
router.patch('/bulk', adminMiddleware, c.bulkAction);

// ─── Single Task ───────────────────────────────────────────────────────
router.get('/:id',            c.getTaskById);
router.put('/:id',            c.updateTask);
router.delete('/:id',         adminMiddleware, c.deleteTask);
router.patch('/:id/status',   c.updateStatus);
router.patch('/:id/reassign', adminMiddleware, c.reassignTask);

// ─── Comments ──────────────────────────────────────────────────────────
router.get('/:id/comments',  c.getComments);
router.post('/:id/comments', c.createComment);

module.exports = router;
