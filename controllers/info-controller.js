class InfoController 
{
    showInfo = (req, res) => {
        res.render('pages/index');
    }
}

const controller = new InfoController();
module.exports = controller;