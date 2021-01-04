const pool = require('../db/database-connection');

class DbController {
  selectAll = async (req, res) => {
    try {
      const allTableNames = await pool.query("select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE'");
      const resultTables = [];

      for (const table of allTableNames.rows){
        const results = await pool.query(`SELECT * FROM ${table.table_name}`);
        if(results){
          resultTables.push({tableName: table.table_name, results});
        }
      }

      res.render('pages/db', { resultTables, isLogged: req.session.loggedin });
    }
    catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  }
}

const controller = new DbController();
module.exports = controller;