const { Router } = require('express');

const controller = require('../controllers/report-controller');

const router = Router();

router.get('/', controller.selectCzlonek);

module.exports = router;
