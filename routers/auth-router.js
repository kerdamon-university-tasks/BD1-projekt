const { Router } = require('express');

const controller = require('../controllers/auth-controller');

const router = Router();

router.get('/login', controller.showLoginForm);
router.post('/login', controller.login);
router.get('/logout', controller.logout);

module.exports = router;
