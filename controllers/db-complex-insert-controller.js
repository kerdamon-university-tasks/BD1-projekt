const pool = require('../db/database-connection');
const { complexTableNames, complexFormNames, tableNamesWithAutonumeratedFirstId } = require('../db/table-info');

class ComplexInsertController
{
  showForm_spotkanie_obecnosc = async (req, res) => {
    const tableName = req.params.tableName;
    const results_spotkanie = await pool.query(`SELECT * FROM spotkanie`);
    const results_obecnosc = await pool.query(`SELECT * FROM obecnosc`);
    const results_czlonek = await pool.query('SELECT * FROM czlonek');

    let results_spotkanie_fields = [];
    results_spotkanie.fields.forEach(field => {
      results_spotkanie_fields.push({name: field.name, state: 'autonumerated'});
    });

    let results_obecnosc_fields = [];
    results_obecnosc.fields.forEach(field => {
      results_obecnosc_fields.push({name: field.name, state: 'normal'});
    });

    let results_obecnosc_values = [];
    results_czlonek.rows.forEach(row => {
      results_obecnosc_values.push(row.czlonek_id);
    });

    let singleInsert = [{name: 'spotkanie', fields: results_spotkanie_fields}];
    let multipleInsert = [{name: 'obecnosc', commonFieldName: 'spotkanie_id', secondPkField: {name: 'czlonek_id', values: results_obecnosc_values}, fields: results_obecnosc_fields}];

    let tables = {
      singleInsert,
      multipleInsert
    }

    let excludeFirst = true;
    res.render('pages/db/insert-form/extended-insert-form', { isLogged: req.session.loggedin, tables});
  }

  showForm_wydarzenie_uczestnik = async (req, res) => {
    const tableName = req.params.tableName;
    const results_wydarzenie = await pool.query(`SELECT * FROM wydarzenie`);
    const results_uczestnik = await pool.query(`SELECT * FROM uczestnik`);

    let fields = this.joinTableResults(results_wydarzenie, results_uczestnik, 'wydarzenie_id');

    let excludeFirst = true;
    res.render('pages/db-insert-table-form', { isLogged: req.session.loggedin, tableName, fields, excludeFirst});
  }

  showForm_zarzad_czlonek_zarzadu = async (req, res) => {
    const tableName = req.params.tableName;
    const results_zarzad = await pool.query(`SELECT * FROM zarzad`);
    const results_czlonek_zarzadu = await pool.query(`SELECT * FROM czlonek_zarzadu`);

    let fields = this.joinTableResults(results_zarzad, results_czlonek_zarzadu, 'zarzad_id');

    let excludeFirst = true;
    res.render('pages/db-insert-table-form', { isLogged: req.session.loggedin, tableName, fields, excludeFirst});
  }
}

const controller = new ComplexInsertController();
module.exports = controller;