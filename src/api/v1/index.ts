import { Router } from 'express'

import AuthRouter from './auth'
import ErrorsRouter from './errors'
import ChannelsRouter from './channels'

const router = Router()

router.use('/auth', AuthRouter)
router.use('/errors', ErrorsRouter)
router.use('/channels', ChannelsRouter)

export default router
