import { Router } from 'express'

import AuthRouter from './auth'
import ErrorsRouter from './errors'

const router = Router()

router.use('/auth', AuthRouter)
router.use('/errors', ErrorsRouter)

export default router
