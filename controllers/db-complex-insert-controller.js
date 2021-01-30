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
            obecnoscData[id] = {oplacono_skladke: false};
          }
  
          if(tableData[elem] === 'true'){
            if (elem.includes('oplacono_skladke')){
              obecnoscData[id].oplacono_skladke = true;
            }
          }
        }
      }
  
      for (const key in obecnoscData) {
        querries.push({query: `INSERT INTO obecnosc VALUES ($1, $2, $3)`, values: [parseInt(key), spotkanie_id, obecnoscData[key].oplacono_skladke]})
      }
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      // console.log(querries);

      for (const element of querries) {
        await client.query(element.query, element.values);
      }

      await client.query('COMMIT')
      res.redirect(`/db/allTables#spotkanie`);
    } catch (err) {
      await client.query('ROLLBACK')
      res.render('pages/db-error', { isLogged: req.session.loggedin, err });
    } finally {
      client.release()
    }
  }

  insertInto_wydarzenie_uczestnik = async (req, res) => {
    const tableName = req.params.tableName;
    const tableData = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // get wydarzenie_id
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      let wydarzenie_id_QueryText; 
      let wydarzenie_id_values = [];
      for (const elem in tableData) {
        if(elem.includes('wydarzenie')){
          if(elem.includes('nazwa') || elem.includes('motyw_przewodni') || elem.includes('data_od') || elem.includes('data_do')){
            wydarzenie_id_values.push(tableData[elem]);
          }
        }
      }

      wydarzenie_id_QueryText = `INSERT INTO wydarzenie VALUES (default, $1, $2, $3, $4) RETURNING wydarzenie_id`;


      const result = await client.query(wydarzenie_id_QueryText, wydarzenie_id_values)
      let wydarzenie_id = result.rows[0].wydarzenie_id;
      // console.log(wydarzenie_id);
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      // prepare uczestnik queries
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      let querries = [];
      let uczestnikData = {}
      for (const elem in tableData) {
  
        if(elem.includes('uczestnik')){
          let id = elem.substring(elem.length - 5);
  
          if (tableData[elem] != ''){
            uczestnikData[id] = tableData[elem];
          }
        }
      }
  
      for (const key in uczestnikData) {
        querries.push({query: `INSERT INTO uczestnik VALUES ($1, $2, $3)`, values: [parseInt(key), wydarzenie_id, uczestnikData[key]]});
      }
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      // console.log(querries);

      for (const element of querries) {
        await client.query(element.query, element.values);
      }

      await client.query('COMMIT')
      res.redirect(`/db/allTables#wydarzenie`);
    } catch (err) {
      await client.query('ROLLBACK')
      res.render('pages/db-error', { isLogged: req.session.loggedin, err });
    } finally {
      client.release()
    }
  }

  insertInto_zarzad_czlonek_zarzadu = async (req, res) => {
    const tableName = req.params.tableName;
    const tableData = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // get zarzad_id
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      let zarzad_id_QueryText; 
      let zarzad_id_values = [];
      for (const elem in tableData) {
        if(elem.includes('zarzad-')){
          if(elem.includes('data_od')){
            zarzad_id_values.push(tableData[elem]);
          }
          if(elem.includes('data_do')){
            zarzad_id_values.push(null);
          }
        }
      }

      zarzad_id_QueryText = `INSERT INTO zarzad VALUES (default, $1, $2) RETURNING zarzad_id`;

      const result = await client.query(zarzad_id_QueryText, zarzad_id_values)
      let zarzad_id = result.rows[0].zarzad_id;
      // console.log(zarzad_id);
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      // prepare czlonek_zarzadu queries
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      let querries = [];
      let czlonek_zarzaduData = {}
      for (const elem in tableData) {
  
        if(elem.includes('czlonek_zarzadu')){
          let id = elem.substring(elem.length - 5);
  
          if (tableData[elem] != ''){
            czlonek_zarzaduData[id] = tableData[elem];
          }
        }
      }
  
      for (const key in czlonek_zarzaduData) {
        querries.push({query: `INSERT INTO czlonek_zarzadu VALUES ($1, $2, $3)`, values: [zarzad_id, parseInt(key), czlonek_zarzaduData[key]]});
      }
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      for (const element of querries) {
        await client.query(element.query, element.values);
      }

      await client.query('COMMIT')
      res.redirect(`/db/allTables#zarzad`);
    } catch (err) {
      await client.query('ROLLBACK')
      res.render('pages/db-error', { isLogged: req.session.loggedin, err });
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
      results_obecnosc_fields.push({name: field.name, type: field.dataTypeID, state: 'normal'});
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
    const results_wydarzenie = await pool.query(`SELECT * FROM wydarzenie`);
    const results_uczestnik = await pool.query(`SELECT * FROM uczestnik`);
    const results_czlonek = await pool.query('SELECT * FROM czlonek');

    let wydarzenie_fields = [];
    results_wydarzenie.fields.forEach(field => {
      let state;
      if(field.name === 'wydarzenie_id')
        state = 'autonumerated';
      else
        state = 'normal';
        wydarzenie_fields.push({name: field.name, state});
    });

    let uczestnik_fields = [];
    results_uczestnik.fields.forEach(field => {
      uczestnik_fields.push({name: field.name, type: field.dataTypeID, state: 'normal'});
    });

    let uczestnik_values = [];
    results_czlonek.rows.forEach(row => {
      uczestnik_values.push(row.czlonek_id);
    });

    let singleInsert = [{name: 'wydarzenie', fields: wydarzenie_fields}];
    let multipleInsert = [{name: 'uczestnik', commonFieldName: 'wydarzenie_id', secondPkField: {name: 'czlonek_id', values: uczestnik_values}, fields: uczestnik_fields}];

    let tables = {
      singleInsert,
      multipleInsert
    }

    res.render('pages/db/insert-form/extended-insert-form', { isLogged: req.session.loggedin, tables});
  }

  showForm_zarzad_czlonek_zarzadu = async (req, res) => {
    const results_zarzad = await pool.query(`SELECT * FROM zarzad`);
    const results_czlonek_zarzadu = await pool.query(`SELECT * FROM czlonek_zarzadu`);
    const results_czlonek = await pool.query('SELECT * FROM czlonek');

    let zarzad_fields = [];
    results_zarzad.fields.forEach(field => {
      let state;
      if(field.name === 'zarzad_id')
        state = 'autonumerated';
      else if (field.name === 'data_do')
        state = 'null'
      else
        state = 'normal';
        zarzad_fields.push({name: field.name, state});
    });

    let czlonek_zarzadu_fields = [];
    results_czlonek_zarzadu.fields.forEach(field => {
      czlonek_zarzadu_fields.push({name: field.name, type: field.dataTypeID, state: 'normal'});
    });

    let czlonek_zarzadu_values = [];
    results_czlonek.rows.forEach(row => {
      czlonek_zarzadu_values.push(row.czlonek_id);
    });

    let singleInsert = [{name: 'zarzad', fields: zarzad_fields}];
    let multipleInsert = [{name: 'czlonek_zarzadu', commonFieldName: 'zarzad_id', secondPkField: {name: 'czlonek_id', values: czlonek_zarzadu_values}, fields: czlonek_zarzadu_fields}];

    let tables = {
      singleInsert,
      multipleInsert
    }

    res.render('pages/db/insert-form/extended-insert-form', { isLogged: req.session.loggedin, tables});
  }
}

const controller = new ComplexInsertController();
module.exports = controller;