import * as nodeRequest from 'request'

export class EdjiRequestError extends Error {
  url: string
  method: string
  body: any
  statusCode: number
  arguments: any
  retryCount: number
  constructor(info: {
    message: string
    url: string
    method: String
    body?: any
    statusCode: number
    retryCount?: number
  }) {
    super(info.message)
    this.name = 'EDJI_REQUEST_ERROR'
    Object.assign(this, info)
  }
}

const defaultOptions: Partial<EdjiRequestOptions> = { retries: 0, retryOnStatusCodes: [502, 503], json: true }

export const request = (inputOptions: EdjiRequestOptions) => {
  const options = { ...defaultOptions, ...inputOptions }
  let retryCount = 0
  const makeRequest = () => {
    return new Promise((resolve, reject) => {
      nodeRequest(options, (err, res, body) => {
        if (!err && res.statusCode < 400) {
          return resolve(body)
        } else {
          return reject(
            new EdjiRequestError({
              message:
                (err && err.message) ||
                `error making ${options.method} request to ${options.url} failed with status code ${res &&
                  res.statusCode}`,
              url: options.url.toString(),
              method: options.method,
              body,
              statusCode: res.statusCode,
              retryCount: retryCount,
            }),
          )
        }
      })
    }).catch(err => {
      if (retryCount >= options.retries || !options.retryOnStatusCodes.includes(err.statusCode)) {
        return Promise.reject(err)
      } else {
        retryCount++
        return makeRequest()
      }
    })
  }
  return makeRequest()
}

export interface EdjiRequestOptions extends nodeRequest.OptionsWithUrl {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  retries?: number /** number of times to retry the request */
  retryOnStatusCodes?: number[] /** retries when these status codes are received */
}

export default request
