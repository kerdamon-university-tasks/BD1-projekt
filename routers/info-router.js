const { Router } = require('express');

const controller = require('../controllers/info-controller');
const middlewares = require('../middlewares/middleware-functions');

const router = Router();

router.get('/', middlewares.checkSignIn, controller.showInfo);

module.exports = router;
