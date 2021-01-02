class LoginController 
{
    showLoginForm = (req, res) => {
        res.render('pages/login');
    }
}

module.exports = LoginController;