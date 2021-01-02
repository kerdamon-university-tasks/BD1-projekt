const { Router } = require('express');

const controller = require('../controllers/info-controller');

const router = Router();

router.get('/', controller.showInfo);

module.exports = router;
