const { Router } = require('express');

const controller = require('../controllers/db-controller');
const middlewares = require('../middlewares/middleware-functions');

const router = Router();

router.get('/', middlewares.checkSignIn, controller.showDBHub);
router.get('/allTables', middlewares.checkSignIn, controller.selectAllTables);
router.get('/allViews', middlewares.checkSignIn, controller.selectAllViews);
router.get('/insertTables', middlewares.checkSignIn, controller.insertTables);

router.get('/report', controller.showReport)
router.get('/czlonek/:id', controller.showSpecifiedMember)


module.exports = router;
