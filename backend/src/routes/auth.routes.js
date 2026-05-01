const router = require('express').Router();
const c = require('../controllers/auth.controller');

router.post('/signup', c.signup);
router.post('/login',  c.login);
router.post('/logout', c.logout);

module.exports = router;
