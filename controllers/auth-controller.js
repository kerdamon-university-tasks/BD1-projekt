var session = require('express-session');
const pool = require('../db/database-connection');

class AuthController {
  showLoginForm = (req, res) => {
    res.render('pages/login-form', { isLogged: req.session.loggedin });
  }

  login = async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    const result = await pool.query('SELECT * FROM auth_user where username=$1 and password=$2;', [username, password]);

    if (result.rows.length) {
      req.session.loggedin = true;
      req.session.username = req.body.username;
      console.log("User logged in")
    }

    res.redirect('/');
  }

  logout = (req, res) => {
    req.session.destroy(function () {
      console.log("User logged out")
    });
    res.redirect('/auth/login');
  }
}

const controller = new AuthController();
module.exports = controller;