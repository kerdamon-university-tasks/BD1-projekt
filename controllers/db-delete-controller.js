const pool = require('../db/database-connection');
const { complexTableNames, complexFormNames, tableNamesWithAutonumeratedFirstId } = require('../db/table-info');

class DbDeleteController
{
  showDeleteForm = async (req, res) => {
    const tableName = req.params.tableName;

    if(tableName === 'typ_zasobu'){
      const tables = [];
      let results = await pool.query(`SELECT * FROM typ_zasobu`);
      tables.push({tableName: 'typ_zasobu', results});
      res.render('pages/db-delete-table-form', { isLogged: req.session.loggedin, tableName, idFieldName: 'typ_zasobu_id', tables});
    }


    if(tableName === 'zasob'){
      const tables = [];
      let results = await pool.query(`SELECT * FROM zasob`);
      tables.push({tableName: 'zasob', results});
      res.render('pages/db-delete-table-form', { isLogged: req.session.loggedin, tableName, idFieldName: 'zasob_id', tables});
    }

    if(tableName === 'wydarzenie'){
      const tables = [];
      let results = await pool.query(`SELECT * FROM wydarzenie`);
      tables.push({tableName: 'wydarzenie', results});
      res.render('pages/db-delete-table-form', { isLogged: req.session.loggedin, tableName, idFieldName: 'wydarzenie_id', tables});
    }
  }

  deleteFromTable = async (req, res) => {
    const tableData = req.body;
    const tableName = req.params.tableName;

    try{
      if(tableName === 'typ_zasobu'){
        let queryString = ('DELETE FROM typ_zasobu WHERE typ_zasobu_id=$1 RETURNING *');
        let queryValues = [tableData.typ_zasobu_id];
        let tableName = 'typ_zasobu';
        let results = await pool.query(queryString, queryValues);
        res.render('pages/db-successfully-deleted-single', { isLogged: req.session.loggedin, tableName, results});
      }

      if(tableName === 'zasob'){
        let queryString = ('DELETE FROM zasob WHERE zasob_id=$1 RETURNING *');
        let queryValues = [tableData.zasob_id];
        let tableName = 'zasob';
        let results = await pool.query(queryString, queryValues);
        res.render('pages/db-successfully-deleted-single', { isLogged: req.session.loggedin, tableName, results});
      }
  
      if(tableName === 'wydarzenie'){
        let queryString = ('DELETE FROM wydarzenie WHERE wydarzenie_id=$1 RETURNING *');
        let queryValues = [tableData.wydarzenie_id];
        let tableNameMany = 'uczestnik';
        let resultsMany = await pool.query('SELECT * FROM uczestnik WHERE wydarzenie_id=$1', queryValues);
        let tableNameOne = 'wydarzenie';
        let resultsOne = await pool.query(queryString, queryValues);
        res.render('pages/db-successfully-deleted', { isLogged: req.session.loggedin, tableNameOne, tableNameMany, resultsOne, resultsMany });
      }

    } catch (err) {
      console.error(err);
      res.render('pages/db-error', { isLogged: req.session.loggedin, err });
    }
  }
}

const controller = new DbDeleteController();
module.exports = controller;