import { Router } from 'express'

import { bot } from '../../../services/discord/bot'

const router = Router()
const mncsErrorsChannel = '692994579305332806'

router.post('/', async (req, res, next) => {
  const channel: any = await bot.channels.fetch(mncsErrorsChannel)
  let error = req.body.error
  if (error && error.length > 2000) {
    error = error.substring(0, 1999)
  }
  channel.send(error)
  res.status(200).send()
})

export default router
