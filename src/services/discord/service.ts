import request from '../../utils/request'

const baseUrl = 'https://discord.com/api'

/**
 * Gets a user's Discord identity
 * @param token user's access token from oauth2
 */
export const getUser = token => {
  return request({
    method: 'GET',
    url: [baseUrl, 'users', '@me'].join('/'),
    auth: { bearer: token },
  })
}

/**
 * Gets a list of user's connections
 * @param token user's access token from oauth2
 */
export const getConnections = token => {
  return request({
    method: 'GET',
    url: [baseUrl, 'users', '@me', 'connections'].join('/'),
    auth: { bearer: token },
  })
}
