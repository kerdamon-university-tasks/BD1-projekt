const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

const infoRouter = require('./routers/info-router');
const reportRouter = require('./routers/report-router');
const dbRouter = require('./routers/db-router');
const loginRouter = require('./routers/login-router');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

  .use('/', infoRouter)
  .use('/info', infoRouter)
  .use('/report', reportRouter)
  .use('/db', dbRouter)
  .use('/login', loginRouter)

  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
