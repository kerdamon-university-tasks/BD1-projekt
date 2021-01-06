const pool = require('../db/database-connection');
const { complexTableNames, complexFormNames, TableNamesWithIdFirst } = require('../db/table-info');

class DbInsertController
{
  showInsertForm = async (req, res) => {
    const tableName = req.params.tableName;
    if(!(complexTableNames.includes(tableName) || complexFormNames.includes(tableName))){
      await this.showSimpleInsertForm(req, res, tableName);
    }
    else
      await this.showComplexInsertForm(req, res);
  }

  insertIntoTable = async (req, res) => {
    const tableName = req.params.tableName;
    const tableData = req.body;
    let query = `insert into ${tableName} values (${Object.values(tableData).reverse().reduce((value, str) => `${str}, ${value}`)})`;
    res.redirect('/db/allTables');
  }

  showSimpleInsertForm = async (req, res, tableName) => {
    const results = await pool.query(`SELECT * FROM ${tableName}`);
    let excludeFirst = false;
    if(TableNamesWithIdFirst.includes(tableName))
      excludeFirst = true;
    res.render('pages/db-insert-table-form', { isLogged: req.session.loggedin, tableName, results, excludeFirst});
  }

  showComplexInsertForm = async (req, res) => {
    res.send("complex");
  }
}

const controller = new DbInsertController();
module.exports = controller;