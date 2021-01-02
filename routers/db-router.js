const { Router } = require('express');

const infoController = require('../controllers/db-controller');
const controller = new infoController();

const router = Router();

router.get('/', controller.selectCzlonek);

module.exports = router;
