const { Router } = require('express');

const simpleInsertController = require('../controllers/db-insert-controller');
const complexInsertController = require('../controllers/db-complex-insert-controller');
const middlewares = require('../middlewares/middleware-functions');


const router = Router();

router.get('/:tableName', middlewares.checkSignIn, simpleInsertController.showInsertForm);
router.post('/insertIntoTable/:tableName', middlewares.checkSignIn, simpleInsertController.insertIntoTable);
router.post('/complexInsertIntoTable/spotkanie_obecnosc', middlewares.checkSignIn, complexInsertController.insertInto_spotkanie_obecnosc);

module.exports = router;
