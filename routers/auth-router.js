const { Router } = require('express');

const controller = require('../controllers/auth-controller');
const middlewares = require('../middlewares/middleware-functions');

const router = Router();

router.get('/login', controller.showLoginForm);
router.post('/login', controller.login);
router.get('/logout', middlewares.checkSignIn, controller.logout);

module.exports = router;
