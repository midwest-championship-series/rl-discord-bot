import request from '../utils/request'

const baseUrl = process.env.RL_STATS_URL

const auth = { bearer: process.env.RL_STATS_SECRET }

const get = (table: string, query: any = {}) => {
  return request({
    method: 'GET',
    url: [baseUrl, 'api', table].join('/'),
    qs: query,
    // auth,
  })
}

const put = (table: string, body: any) => {
  return request({
    method: 'PUT',
    url: [baseUrl, 'api', table].join('/'),
    body,
  })
}

const report = (gameIds, reporterDiscordId) => {
  return request({
    method: 'PUT',
    url: [baseUrl, 'games', '_report'].join('/'),
    body: { game_ids: gameIds },
  })
}

export default { get, put, report }
