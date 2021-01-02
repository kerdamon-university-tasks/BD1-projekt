const { Router } = require('express');

const controller = require('../controllers/db-controller');
const authController = require('../controllers/auth-controller');

const router = Router();

router.get('/', authController.checkSignIn, controller.selectCzlonek);

module.exports = router;
