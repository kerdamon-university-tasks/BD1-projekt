const { Router } = require('express');

const controller = require('../controllers/db-controller');
const middlewares = require('../middlewares/middleware-functions');

const router = Router();

router.get('/', middlewares.checkSignIn, controller.selectCzlonek);

module.exports = router;
