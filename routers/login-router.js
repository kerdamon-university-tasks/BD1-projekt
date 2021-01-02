const { Router } = require('express');

const infoController = require('../controllers/login-controller');
const controller = new infoController();

const router = Router();

router.get('/', controller.showLoginForm)

module.exports = router;
