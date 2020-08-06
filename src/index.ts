// sets config variables
require('dotenv').config()
import * as express from 'express'
import { json } from 'body-parser'
import * as methodOverride from 'method-override'

import { HealthCheckHandler } from './healthcheck'
import APIRouter from './api'
import { SendRequest } from './middleware'

// declare constants
const PORT: number = parseInt(process.env.PORT) || 25257

// init express
let app = express()

// middleware stack
app.use(json({ limit: '20mb' }))
app.get('/healthcheck', HealthCheckHandler)
app.use('/api', APIRouter, SendRequest)

// error handling stack
app.use(methodOverride())

// start web server
app.listen(PORT, () => {
  console.log(`app listening at port: ${PORT}`)
})

// start discord bot
try {
  require('./services/discord')
} catch (err) {
  throw err
}
