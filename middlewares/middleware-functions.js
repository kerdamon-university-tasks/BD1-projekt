const createError = require('http-errors');

function errorHandler(err, req, res, next) {
  if(createError.isHttpError(err))
    HTTPErrorHandler(res, req, err);

  console.log(err);
  res.render('pages/error', {err, isLogged: req.session.loggedin});
}

function HTTPErrorHandler(res, req, err){
  res.render('pages/HTTPError', {err, isLogged: req.session.loggedin});
}

function checkSignIn (req, res, next) {
  if (req.session.loggedin) {
    next();
  } else {
    var err = createError(401, 'Nie zalogowano');
    next(err);
  }
}

module.exports = {
  errorHandler,
  checkSignIn
};