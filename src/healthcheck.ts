import { Request, Response, NextFunction } from 'express'

export function HealthCheckHandler(req: Request, res: Response, next: NextFunction) {
  res.status(200)
  res.body = { message: 'your server is running, you should go catch it' }
  next()
}