const router = require('express').Router();
const c = require('../controllers/activity.controller');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', c.getActivity);

module.exports = router;
