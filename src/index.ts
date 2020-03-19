import * as express from 'express'
import { json } from 'body-parser'
import * as methodOverride from 'method-override'

import { HealthCheckHandler } from './healthcheck'
import APIRouter from './api'
import { SendRequest } from './middleware'

// sets config variables
require('dotenv').config()

// declare constants
const PORT: number = parseInt(process.env.PORT) || 25257

// init express
let app = express()

// middleware stack
app.use(json({ limit: '20mb' }))
app.get('/healthcheck', HealthCheckHandler)
app.use('/api', APIRouter)
app.use(SendRequest)

// error handling stack
app.use(methodOverride())

// start web server
app.listen(PORT, () => {
  console.log(`app listening at port: ${PORT}`)
  console.log(process.env.DISCORD_SECRET)
})

// start discord bot
try {
  require('./services/discord')
} catch (err) {
  throw err
}
