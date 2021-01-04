const { Router } = require('express');

const controller = require('../controllers/db-controller');
const middlewares = require('../middlewares/middleware-functions');

const router = Router();

router.get('/', middlewares.checkSignIn, controller.showDBHub);
router.get('/all', middlewares.checkSignIn, controller.selectAll);
router.get('/report', controller.showReport)

module.exports = router;
