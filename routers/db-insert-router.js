const { Router } = require('express');

const simpleInsertController = require('../controllers/db-insert-controller');
const complexInsertController = require('../controllers/db-complex-insert-controller');
const middlewares = require('../middlewares/middleware-functions');


const router = Router();

router.get('/:tableName', simpleInsertController.showInsertForm);
router.post('/insertIntoTable/:tableName', simpleInsertController.insertIntoTable);
router.post('/complexInsertIntoTable/spotkanie_obecnosc', complexInsertController.insertInto_spotkanie_obecnosc);

// router.get('/:tableName', middlewares.checkSignIn, controller.showInsertForm);
// router.post('/insertIntoTable/:tableName', middlewares.checkSignIn, controller.insertIntoTable);

module.exports = router;
