const pool = require('../db/database-connection');
const { complexTableNames, complexFormNames, tableNamesWithAutonumeratedFirstId } = require('../db/table-info');

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

    let fields = results.fields;
    if (tableNamesWithAutonumeratedFirstId.includes(tableName))
      fields = fields.slice(1);

    let query = this.createInsertQuery(tableName, fields);
    let insertValues = Object.values(tableData);

    for (let i = 0; i < insertValues.length; i++) {
      if(insertValues[i] === '')
        insertValues[i] = null;
    }

    try{
      await pool.query(query, insertValues);
      res.redirect(`/db/allTables#${tableName}`);
    } catch (err) {
      console.error(err);
      res.render('pages/db-error', { isLogged: req.session.loggedin, err });
    }
  }

  createInsertQuery = (tableName, fields) => {
    let dollars = [];
    for (let i = 1; i <= fields.length; i++) {
      dollars.push(`$${i}`);
    }
    let fieldsString = [];
    fields.forEach(field => {
      fieldsString.push(field.name);
    });
    return `INSERT INTO ${tableName} (${fieldsString.join()}) VALUES (${dollars.join()})`;
  }

  showSimpleInsertForm = async (req, res, tableName) => {
    const results = await pool.query(`SELECT * FROM ${tableName}`);
    let excludeFirst = false;
    if(tableNamesWithAutonumeratedFirstId.includes(tableName))
      excludeFirst = true;
    res.render('pages/db-insert-table-form', { isLogged: req.session.loggedin, tableName, results, excludeFirst});
  }

  showComplexInsertForm = async (req, res) => {
    res.send("complex");
  }
}

const controller = new DbInsertController();
module.exports = controller;