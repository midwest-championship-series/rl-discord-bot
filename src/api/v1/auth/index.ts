import { Router } from 'express'

import { DiscordRedirect, DiscordCallback } from './discord'

const router = Router()

router.get('/discord', DiscordRedirect)
router.get('/discord/callback', DiscordCallback)

export default router