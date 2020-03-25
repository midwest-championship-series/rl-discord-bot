import { Request, Response, NextFunction } from 'express'

export function SendRequest(req: Request, res: Response, next: NextFunction) {
  const { body } = res
  if (body) {
    return res.send(body)
  } else {
    return res.send(res.body)
  }
}
