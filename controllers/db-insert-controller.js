const pool = require('../db/database-connection');
const { complexTableNames, complexFormNames, tableNamesWithAutonumeratedFirstId } = require('../db/table-info');
const complexInsertController = require('./db-complex-insert-controller');

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

  showSimpleInsertForm = async (req, res, tableName) => {
    const results = await pool.query(`SELECT * FROM ${tableName}`);
    let excludeFirst = false;
    if(tableNamesWithAutonumeratedFirstId.includes(tableName))
      excludeFirst = true;

    const tables = [];
    if(tableName === 'status_czlonka'){
      let results = await pool.query(`SELECT * FROM status_czlonka`);
      tables.push({tableName: 'status_czlonka', results});
      results = await pool.query(`SELECT * FROM czlonek`);
      tables.push({tableName: 'czlonek', results});
      results = await pool.query(`SELECT * FROM status_nazwa`);
      tables.push({tableName: 'status_nazwa', results});
    }

    if(tableName === 'zasob'){
      let results = await pool.query(`SELECT * FROM typ_zasobu`);
      tables.push({tableName: 'typ_zasobu', results});
    }

    if(tableName === 'wypozyczenie'){
      let results = await pool.query(`SELECT * FROM dostepne_zasoby`);
      tables.push({tableName: 'dostepne_zasoby', results});
      results = await pool.query(`SELECT * FROM typ_zasobu`);
      tables.push({tableName: 'typ_zasobu', results});
      results = await pool.query(`select czlonek_id, imie, nazwisko from (select * from czlonek join aktualny_status using (czlonek_id) where status=3) a left join wypozyczenia_czlonkow using(czlonek_id) where przetrzymane is null and (wypozyczonych<3 or wypozyczonych is null);`);
      tables.push({tableName: 'Członkowie mogący wypożyczać', results});
    }

    res.render('pages/db-insert-table-form', { isLogged: req.session.loggedin, tableName, fields: results.fields, excludeFirst, tables});
  }

  showComplexInsertForm = async (req, res) => {
    try{
      complexInsertController[`showForm_${req.params.tableName}`](req, res);
    }
    catch (e){
      if (e instanceof TypeError)
      res.send('No handling function found for this table.');
    }
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
      let results = await pool.query(query, insertValues);
      res.render('pages/db-successfully-added', { isLogged: req.session.loggedin, tableName, results} );
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
    return `INSERT INTO ${tableName} (${fieldsString.join()}) VALUES (${dollars.join()}) RETURNING *`;
  }
}

const controller = new DbInsertController();
module.exports = controller;