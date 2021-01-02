function errorHandler(err, req, res, next)
{
    console.log(err);
    res.redirect('/auth/login');
}

module.exports = errorHandler;