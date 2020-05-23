import request from '../utils/request'

const baseUrl = process.env.RL_STATS_URL

const get = (resource: string, query: any = {}) => {
  return request({
    method: 'GET',
    url: [baseUrl, 'v2', resource].join('/'),
    qs: query,
    headers: {
      'x-api-key': process.env.RL_STATS_KEY,
    },
  })
}

const put = (resource: string, body: any) => {
  return request({
    method: 'PUT',
    url: [baseUrl, 'v2', resource].join('/'),
    body,
    headers: {
      'x-api-key': process.env.RL_STATS_KEY,
    },
  })
}

const post = (resource: string, body: any) => {
  return request({
    method: 'POST',
    url: [baseUrl, 'v2', resource].join('/'),
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

const reprocess = (params: any) => {
  return request({
    method: 'POST',
    url: [baseUrl, 'games', '_reprocess'].join('/'),
    qs: params,
    headers: {
      'x-api-key': process.env.RL_STATS_KEY,
    },
  })
}

export default { get, put, post, report, reprocess }
