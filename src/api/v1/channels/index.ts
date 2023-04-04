import { Router } from 'express'

import { bot } from '../../../services/discord/bot'

const router = Router()

router.post('/:channelId', async (req, res, next) => {
  try {
    const { channelId } = req.params
    console.log('sending message to channel', channelId)
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
      channel.send({ embeds: [embed] })
    }
    res.status(200).send({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
