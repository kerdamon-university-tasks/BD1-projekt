const { Router } = require('express');

const controller = require('../controllers/db-insert-controller');
const middlewares = require('../middlewares/middleware-functions');


const router = Router();

router.get('/:tableName', middlewares.checkSignIn, controller.showInsertForm);
router.post('/insertIntoTable/:tableName', middlewares.checkSignIn, controller.insertIntoTable);

module.exports = router;
