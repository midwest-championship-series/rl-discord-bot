import { Router } from 'express'

import { bot } from '../../../services/discord/bot'

const router = Router()
const mncsErrorsChannel = '692994579305332806'

router.post('/', async (req, res, next) => {
  const channel: any = await bot.channels.fetch(mncsErrorsChannel)
  channel.send(req.body.error)
  res.status(200).send()
})

export default router
