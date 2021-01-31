const { Router } = require('express');

const controller = require('../controllers/db-controller');
const middlewares = require('../middlewares/middleware-functions');
const insertRouter = require('./db-insert-router');
const deleteRouter = require('./db-delete-router');


const router = Router();

router.get('/', middlewares.checkSignIn, controller.showDBHub);
router.get('/allTables', middlewares.checkSignIn, controller.selectAllTables);
router.get('/allViews', middlewares.checkSignIn, controller.selectAllViews);

router.get('/report', controller.showReport);
router.get('/czlonek/:id', controller.showSpecifiedMember);

router.get('/updateWypozyczenie', middlewares.checkSignIn, controller.showUpdateWypozyczenieForm);
router.post('/updateWypozyczenie', middlewares.checkSignIn, controller.updateWypozyczenie);

router.get('/updateObecnosc', middlewares.checkSignIn, controller.showUpdateObecnoscForm);
router.post('/updateObecnosc', middlewares.checkSignIn, controller.updateObecnosc);

router.use('/insert', insertRouter);
router.use('/delete', deleteRouter);

module.exports = router;
