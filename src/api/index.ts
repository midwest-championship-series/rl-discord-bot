import { Router } from 'express'

import { V1Router } from './v1'

const router = Router()

router.use(V1Router)

export const APIRouter = router