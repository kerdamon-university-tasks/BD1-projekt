const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});

class DbController 
{
    selectCzlonek = async (req, res) => {
        try{
          const client = await pool.connect();
          const result = await client.query('SELECT * FROM czlonek');
          const results = {'results': (result) ? result.rows : null};
          res.render('pages/db', results );
          client.release();
        }
        catch (err) {
          console.error(err);
          res.send("Error " + err);
        }
      }
}

const controller = new DbController();
module.exports = controller;