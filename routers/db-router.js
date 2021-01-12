const { Router } = require('express');

const controller = require('../controllers/db-controller');
const middlewares = require('../middlewares/middleware-functions');
const insertRouter = require('./db-insert-router');


const router = Router();

router.get('/', middlewares.checkSignIn, controller.showDBHub);
router.get('/allTables', middlewares.checkSignIn, controller.selectAllTables);
router.get('/allViews', middlewares.checkSignIn, controller.selectAllViews);

router.get('/report', controller.showReport);
router.get('/czlonek/:id', controller.showSpecifiedMember);

router.use('/insert', insertRouter)

module.exports = router;
