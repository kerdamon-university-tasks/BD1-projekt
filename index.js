const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const middlewares = require('./middlewares/middleware-functions');

const PORT = process.env.PORT || 5000;

const infoRouter = require('./routers/info-router');
const dbRouter = require('./routers/db-router');
const authRouter = require('./routers/auth-router');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(session({secret: "iuvb3ourhb38brvoiwjefboviubo38rybvowerhbvoiur5hb4o387htbovijsdfnob8v7h4oitnvowbuefhbowueh"}))

  .use('/', infoRouter)
  .use('/info', infoRouter)
  .use('/db', dbRouter)
  .use('/auth', authRouter)

  .use(middlewares.errorHandler)

  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
