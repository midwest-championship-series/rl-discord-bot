import { Router } from 'express'

import { bot } from '../../../services/discord/bot'

const router = Router()

router.post('/:channelId', async (req, res, next) => {
  const { channelId } = req.params
  const channel: any = await bot.channels.fetch(channelId)
  let message = req.body.message
  if (message && message.length > 2000) {
    message = message.substring(0, 1999)
  }
  channel.send(message)
  res.status(200).send()
})

export default router
