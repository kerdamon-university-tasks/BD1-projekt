const { Router } = require('express');

const infoController = require('../controllers/report-controller');
const controller = new infoController();

const router = Router();

router.get('/', controller.showInfo);

module.exports = router;
