import request from '../utils/request'

const baseUrl = process.env.RL_STATS_URL

const get = (table: string, query: any = {}) => {
  return request({
    method: 'GET',
    url: [baseUrl, 'api', table].join('/'),
    qs: query,
    headers: {
      'x-api-key': process.env.RL_STATS_KEY,
    },
  })
}

const put = (table: string, body: any) => {
  return request({
    method: 'PUT',
    url: [baseUrl, 'api', table].join('/'),
    body,
    headers: {
      'x-api-key': process.env.RL_STATS_KEY,
    },
  })
}

const report = ({ matchId, gameIds }: { gameIds?: string[]; matchId?: string }) => {
  const body: any = {}
  if (gameIds) {
    console.log(`reporting games: ${gameIds.join(', ')}`)
    body.game_ids = gameIds
  } else if (matchId) {
    console.log(`reporting match: ${matchId}`)
    body.match_id = matchId
  } else {
    throw new Error('no game ids or match id to report')
  }
  return request({
    method: 'POST',
    url: [baseUrl, 'games', '_report'].join('/'),
    body,
    headers: {
      'x-api-key': process.env.RL_STATS_KEY,
    },
  })
}

export default { get, put, report }
