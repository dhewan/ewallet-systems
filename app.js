'use strict'

import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import config from './src/config.js'
import errorHandler from './src/middlewares/error.js'
import route from './src/routes/v1.js'

// EXPRESS
const app = express()
app.set('trust proxy', true)

// REDIS
console.info('Automation run')

// LOGGER
app.use(morgan('dev'))

// I/O
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// COOKIE PARSER
app.use(cookieParser())

// HEADER HELMET
app.use(helmet())

// ROUTES
route(app)

// ERROR HANDLER
app.use(errorHandler)

// SERVER
app.listen(config.port, () => {
  console.info(`Server listening on port ${config.port}`)
})
