const { Router } = require('express');

const deleteController = require('../controllers/db-delete-controller');
const middlewares = require('../middlewares/middleware-functions');


const router = Router();

router.get('/:tableName', middlewares.checkSignIn, deleteController.showDeleteForm);
router.post('/:tableName', middlewares.checkSignIn, deleteController.deleteFromTable);

module.exports = router;
