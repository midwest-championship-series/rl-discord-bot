import { Router } from 'express'

import AuthRouter from './auth'
import ChannelsRouter from './channels'

const router = Router()

router.use('/auth', AuthRouter)
router.use('/channels', ChannelsRouter)

export default router
