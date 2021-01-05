const pool = require('../db/database-connection');

class DbInsertController
{
  insertIntoTable = async (req, res) => {
    const tableName = req.params.tableName;
    const results = await pool.query(`SELECT * FROM ${tableName}`);
    res.render('pages/db-insert-table', { isLogged: req.session.loggedin, tableName, results});
    res.send(results);
  }
}

const controller = new DbInsertController();
module.exports = controller;