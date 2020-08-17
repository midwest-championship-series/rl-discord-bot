import { Router } from 'express'

import { bot } from '../../../services/discord/bot'

const router = Router()

router.post('/:channelId', async (req, res, next) => {
  const { channelId } = req.params
  const channel: any = await bot.channels.fetch(channelId)
  let { message, embed } = req.body
  if (message) {
    if (message.length > 2000) {
      message = message.substring(0, 1999)
    }
    channel.send(message)
  }
  if (embed) {
    embed.timestamp = new Date()
    channel.send({ embed })
  }
  res.status(200).send({ success: true })
})

export default router
