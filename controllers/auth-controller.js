var session = require('express-session');

class AuthController 
{
    showLoginForm = (req, res) => {
        res.render('pages/login-form');
    }

    login = (req, res) => {
        req.session.loggedin = true;
        req.session.username = req.body.username;
        res.redirect('/');
    }

    logout = (req, res) => {
        req.session.destroy(function(){
           console.log("User logged out.")
        });
        res.redirect('/auth/login');
     }

    checkSignIn = (req, res, next) => {
        if(req.session.loggedin){
           next();     //If session exists, proceed to page
        } else {
           var err = new Error("Not logged in");
           console.log(req.session.username);
           next(err);  //Error, trying to access unauthorized page!
        }
     }
}

const controller = new AuthController();
module.exports = controller;