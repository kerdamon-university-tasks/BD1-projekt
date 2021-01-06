const pool = require('../db/database-connection');
const { complexTableNames, complexFormNames } = require('../db/table-info');

class DbController 
{
  showDBHub = async (req, res) => {
    const allTableNames = await pool.query("select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE'");
    let tableNames = [];
    allTableNames.rows.forEach(element => {
      if(!complexTableNames.includes(element.table_name))
        tableNames.push(element);
    });
    complexFormNames.forEach(element => {
      tableNames.push({table_name: element});
    });
    res.render('pages/dbHub', { isLogged: req.session.loggedin, tableNames });
  }

  selectAllTables = async (req, res) => {
    try {
      const allTableNames = await pool.query("select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE'");
      const resultTables = [];

      for (const table of allTableNames.rows){
        const results = await pool.query(`SELECT * FROM ${table.table_name}`);
        if(results){
          resultTables.push({tableDisplayName: table.table_name, results});
        }
      }

      res.render('pages/db-all-tables', { resultTables, isLogged: req.session.loggedin, headerText:'Wszystkie Tabele' });
    }
    catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  }

  selectAllViews = async (req, res) => {
    try {
      const allTableNames = await pool.query("select table_name from information_schema.tables where table_schema='public' and table_type='VIEW'");
      const resultTables = [];

      for (const table of allTableNames.rows){
        const results = await pool.query(`SELECT * FROM ${table.table_name}`);
        if(results){
          resultTables.push({tableDisplayName: table.table_name, results});
        }
      }

      res.render('pages/db-all-tables', { resultTables, isLogged: req.session.loggedin, headerText: 'Wszystkie Widoki' });
    }
    catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  }

  showReport = async (req, res) => {
    try {
      const resultTables = [];
      let results;
    
      results = await pool.query("select czlonek_id, imie, nazwisko, status_nazwa.nazwa from (select * from czlonek join aktualny_status using(czlonek_id)) czl join status_nazwa on(status=status_id) order by status");
      resultTables.push({tableDisplayName: 'Lista członków', tableName: 'czlonek', idFieldName: 'czlonek_id', results});

      results = await pool.query("select imie, nazwisko, ominietych_skladek from liczba_ominietych_skladek join czlonek using(czlonek_id)");
      resultTables.push({tableDisplayName: 'Zalegający', tableName: 'liczba_ominietych_skladek', results});

      results = await pool.query("select imie, nazwisko, nazwa_zasobu, typ_zasobu, data_od from czlonek_przetrzymuje_zasob");
      resultTables.push({tableDisplayName: 'Przetrzymujący', tableName: 'czlonek_przetrzymuje_zasob', results});

      results = await pool.query("select nazwa_zasobu, nazwa as typ, wydawca, uwagi, imie, nazwisko from (select nazwa as nazwa_zasobu, typ_zasobu_id, wydawca, uwagi, imie, nazwisko from (select * from zasob left join wypozyczenie using (zasob_id)) zw left join czlonek using (czlonek_id)) ntwuin join typ_zasobu using (typ_zasobu_id)");
      resultTables.push({tableDisplayName: 'Zasoby', tableName: 'zasoby', results});

      res.render('pages/reports', { resultTables, isLogged: req.session.loggedin });
    }
    catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  }
  
  showSpecifiedMember = async (req, res) => {
    try {
      const resultTables = [];
      let results;
      const memberId = parseInt(req.params.id);

      results = await pool.query("select imie, nazwisko from czlonek where czlonek_id=$1", [memberId]);
      resultTables.push({tableDisplayName: 'Imię i nazwisko', results});

      results = await pool.query("select nazwa from aktualny_status join status_nazwa on(status=status_id) where czlonek_id=$1;", [memberId]);
      resultTables.push({tableDisplayName: 'Aktualny status', results});

      results = await pool.query("select pozycja_nazwa, data_od, data_do from (select czlonek_zarzadu.pozycja, data_od, data_do from czlonek_zarzadu join zarzad using(zarzad_id) where czlonek_id=$1) pdd join pozycja_w_zarzadzie on pozycja=pozycja_w_zarzadzie.pozycja_id", [memberId]);
      resultTables.push({tableDisplayName: 'Historia w zarządzie', results});

      results = await pool.query("select nazwa as funkcja, nazwa_wydarzenia, data_od, data_do from (select funkcja, nazwa as nazwa_wydarzenia, data_od, data_do from uczestnik join wydarzenie using(wydarzenie_id) where czlonek_id=$1) fndd join uczestnik_funkcja on funkcja=uczestnik_funkcja_id", [memberId]);
      resultTables.push({tableDisplayName: 'Wydarzenia', results});

      results = await pool.query("select nazwa, data_od, data_do from status_czlonka join status_nazwa on status_czlonka.status = status_nazwa.status_id where czlonek_id=$1 order by data_od", [memberId]);
      resultTables.push({tableDisplayName: 'Historia statusu', results});

      results = await pool.query("select nazwa_zasobu, nazwa, data_od from (select zasob_id, nazwa as nazwa_zasobu, typ_zasobu_id, data_od from aktualne_wypozyczenia join zasob using(zasob_id) where czlonek_id=$1) zntd join typ_zasobu using(typ_zasobu_id)", [memberId]);
      resultTables.push({tableDisplayName: 'Aktualne wypożyczenia', results});

      results = await pool.query("select nazwa_zasobu, typ_zasobu, data_od from czlonek_przetrzymuje_zasob where czlonek_id=$1", [memberId]);
      resultTables.push({tableDisplayName: 'Przetrzymane zasoby', results});

      results = await pool.query("select ominietych_skladek from liczba_ominietych_skladek where czlonek_id=$1", [memberId]);
      resultTables.push({tableDisplayName: 'Nie zapłacone składki', results});

      results = await pool.query("select oplacono_skladke, data from obecnosc join spotkanie using(spotkanie_id) where czlonek_id=$1 and obecny=true", [memberId]);
      resultTables.push({tableDisplayName: 'Obecności na spotkaniach', results});

      res.render('pages/specified-member', { resultTables, isLogged: req.session.loggedin });
    }
    catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  }
}

const controller = new DbController();
module.exports = controller;