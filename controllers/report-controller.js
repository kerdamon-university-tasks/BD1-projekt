const pool = require('../db/database-connection');

class ReportController {
  selectCzlonek = async (req, res) => {
    try {
      const result = await pool.query('select imie, nazwisko, status_nazwa.nazwa from(select * from czlonek join aktualny_status using(czlonek_id)) czl join status_nazwa on(status=status_id) order by status;');
      res.render('pages/reports', { results: (result) ? result.rows : null, isLogged: req.session.loggedin });
    }
    catch (err) {
      console.error(err);
    }
  }
}

const controller = new ReportController();
module.exports = controller;