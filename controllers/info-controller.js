class InfoController {
  showInfo = (req, res) => {
    res.render('pages/info', { isLogged: req.session.loggedin });
  }
}

const controller = new InfoController();
module.exports = controller;