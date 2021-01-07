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

    const results = await pool.query(`SELECT * FROM ${tableName}`);
    res.send(results);
    
    // try{
    //   let query = `insert into ${tableName} values (${Object.values(tableData).reverse().reduce((value, str, index) => {
    //     // if(results.fields[index].dataTypeID != 23)
    //     //   return `${str}, '${value}'`;
    //     // else
    //     //   return `${str}, dupa`;
    //     return 'dupa';
    //   })})`;
    //   console.log(query);
    //   // pool.query(query);
    //   res.redirect(`/db/allTables#${tableName}`);
    // } catch (err) {
    //   console.error(err);
    //   res.send(err);
    // }
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