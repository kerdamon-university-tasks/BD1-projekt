const pool = require('../db/database-connection');
const { complexTableNames, complexFormNames, tableNamesWithAutonumeratedFirstId } = require('../db/table-info');

class DbDeleteController
{
  showDeleteForm = async (req, res) => {
    const tableName = req.params.tableName;

    if(tableName === 'typ_zasobu')
      res.render('pages/db-delete-table-form', { isLogged: req.session.loggedin, tableName, idFieldName: 'typ_zasobu_id'});

    if(tableName === 'zasob')
      res.render('pages/db-delete-table-form', { isLogged: req.session.loggedin, tableName, idFieldName: 'zasob_id'});

    if(tableName === 'wydarzenie')
      res.render('pages/db-delete-table-form', { isLogged: req.session.loggedin, tableName, idFieldName: 'wydarzenie_id'});
  }

  deleteFromTable = async (req, res) => {
    const tableData = req.body;
    const tableName = req.params.tableName;
    let queryString;
    let queryValues;

    if(tableName === 'typ_zasobu'){
      queryString = ('DELETE FROM typ_zasobu WHERE typ_zasobu_id=$1');
      queryValues = [tableData.typ_zasobu_id];
    }

    
    if(tableName === 'zasob'){
      queryString = ('DELETE FROM zasob WHERE zasob_id=$1');
      queryValues = [tableData.zasob_id];
    }

    
    if(tableName === 'wydarzenie'){
      queryString = ('DELETE FROM wydarzenie WHERE wydarzenie_id=$1');
      queryValues = [tableData.wydarzenie_id];
    }

    try{
      await pool.query(queryString, queryValues);
      res.redirect(`/db/allTables#${tableName}`);
    } catch (err) {
      console.error(err);
      res.render('pages/db-error', { isLogged: req.session.loggedin, err });
    }
  }
}

const controller = new DbDeleteController();
module.exports = controller;