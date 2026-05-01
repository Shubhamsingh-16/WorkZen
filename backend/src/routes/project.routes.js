const router = require('express').Router();
const c = require('../controllers/project.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/',    c.getProjects);
router.post('/',   adminMiddleware, c.createProject);
router.get('/:id', c.getProjectById);
router.put('/:id', adminMiddleware, c.updateProject);
router.delete('/:id', adminMiddleware, c.deleteProject);
router.post('/:id/members',         adminMiddleware, c.addMember);
router.delete('/:id/members/:userId', adminMiddleware, c.removeMember);

module.exports = router;
