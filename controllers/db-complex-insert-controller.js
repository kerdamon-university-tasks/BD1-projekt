const pool = require('../db/database-connection');
const { complexTableNames, complexFormNames, tableNamesWithAutonumeratedFirstId } = require('../db/table-info');

class ComplexInsertController
{
  insertInto_spotkanie_obecnosc = async (req, res) => {
    const tableName = req.params.tableName;
    const tableData = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN')

      // get spotkanie_id
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      let spotkanie_id_QueryText; 
      let spotkanie_id_values;
      for (const elem in tableData) {
        if(elem.includes('spotkanie')){
          if(elem.includes('data')){
            spotkanie_id_QueryText = `INSERT INTO spotkanie VALUES (default, $1) RETURNING spotkanie_id`;
            spotkanie_id_values = [tableData[elem]];
          }
        }
      }
      const result = await client.query(spotkanie_id_QueryText, spotkanie_id_values)
      let spotkanie_id = result.rows[0].spotkanie_id;
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      // prepare obecnosc queries
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      let querries = [];
      let obecnoscData = {}
      for (const elem in tableData) {
        // console.log(`${elem} -- ${tableData[elem]}`);
  
        if(elem.includes('obecnosc')){
          let id = elem.substring(elem.length - 5);
          
          if(!(Object.keys(obecnoscData).includes(id))){
            obecnoscData[id] = {obecny: false, oplacono_skladke: false};
          }
  
          if(tableData[elem] === 'true'){
            if(elem.includes('obecny')){
              obecnoscData[id].obecny = true;
            }
            else if (elem.includes('oplacono_skladke')){
              obecnoscData[id].oplacono_skladke = true;
            }
          }
        }
      }
  
      for (const key in obecnoscData) {
        querries.push({query: `UPDATE obecnosc SET obecny=$1, oplacono_skladke=$2 WHERE spotkanie_id=$3 AND czlonek_id=$4`, values: [obecnoscData[key].obecny, obecnoscData[key].oplacono_skladke, spotkanie_id, parseInt(key)]})
      }
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      // console.log(querries);

      querries.forEach(element => {
        client.query(element.query, element.values);
      });

      await client.query('COMMIT')
      res.redirect(`/db/allTables#spotkanie`);
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  }

  showForm_spotkanie_obecnosc = async (req, res) => {
    const results_spotkanie = await pool.query(`SELECT * FROM spotkanie`);
    const results_obecnosc = await pool.query(`SELECT * FROM obecnosc`);
    const results_czlonek = await pool.query('SELECT * FROM czlonek');

    let results_spotkanie_fields = [];
    results_spotkanie.fields.forEach(field => {
      let state;
      if(field.name === 'spotkanie_id')
        state = 'autonumerated';
      else
        state = 'normal';
      results_spotkanie_fields.push({name: field.name, state});
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