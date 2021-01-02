const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const errorHandler = require('./utils/error-handling');

const PORT = process.env.PORT || 5000;

const infoRouter = require('./routers/info-router');
const reportRouter = require('./routers/report-router');
const dbRouter = require('./routers/db-router');
const authRouter = require('./routers/auth-router');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(session({secret: "iuvb3ourhb38brvoiwjefboviubo38rybvowerhbvoiur5hb4o387htbovijsdfnob8v7h4oitnvowbuefhbowueh"}))

  .use('/', infoRouter)
  .use('/info', infoRouter)
  .use('/report', reportRouter)
  .use('/db', dbRouter)
  .use('/auth', authRouter)

  .use(errorHandler)

  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
