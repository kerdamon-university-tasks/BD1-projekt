const pool = require('../db/database-connection');
const notSimpleInstertTables = require('../db/table-info');

class DbInsertController
{
  showInsertForm = async (req, res) => {
    const tableName = req.params.tableName;
    if(!notSimpleInstertTables.includes(tableName)){
      const results = await pool.query(`SELECT * FROM ${tableName}`);
      res.render('pages/db-insert-table', { isLogged: req.session.loggedin, tableName, results});
    }
    else
      res.send("complex");
  }
}

const controller = new DbInsertController();
module.exports = controller;