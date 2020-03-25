import request from '../utils/request'

const baseUrl = process.env.RL_STATS_URL

export const get = (table: string, query: any = {}) => {
  return request({
    method: 'GET',
    url: [baseUrl, table].join('/'),
    qs: query,
    auth: {
      bearer: process.env.RL_STATS_SECRET,
    },
  })
}
