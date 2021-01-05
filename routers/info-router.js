const { Router } = require('express');

const controller = require('../controllers/info-controller');
const middlewares = require('../middlewares/middleware-functions');

const router = Router();

router.get('/', controller.showInfo);

module.exports = router;
