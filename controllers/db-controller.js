const pool = require('../db/database-connection');

class DbController {
  selectCzlonek = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM czlonek');
      res.render('pages/db', { results: (result) ? result.rows : null, isLogged: req.session.loggedin });
    }
    catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  }
}

const controller = new DbController();
module.exports = controller;