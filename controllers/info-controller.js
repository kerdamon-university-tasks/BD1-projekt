class InfoController {
  showInfo = (req, res) => {
    res.render('pages/index', { isLogged: req.session.loggedin });
  }
}

const controller = new InfoController();
module.exports = controller;