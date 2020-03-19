import { spy, SinonSpy, assert } from 'sinon'
import { Request, Response, NextFunction } from 'express'
import { expect } from 'chai'

import { HealthCheckHandler } from './healthcheck'

describe('HealthCheckHandler', () => {
  it('should pass', () => {
    let value: boolean = true
    expect(value).to.be.true
  })
})
