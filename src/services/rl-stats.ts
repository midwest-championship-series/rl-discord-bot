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
    retries: 3,
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

const report = ({
  gameIds,
  leagueId,
  replyToChannel,
}: {
  gameIds: string[]
  leagueId: string
  replyToChannel: string
}) => {
  const body = {
    game_ids: gameIds,
    league_id: leagueId,
    reply_to_channel: replyToChannel,
  }
  console.log(`reporting games: ${gameIds.join(', ')}`)
  return request({
    method: 'POST',
    url: [baseUrl, 'platform', 'games', '_report'].join('/'),
    body,
    headers: {
      'x-api-key': process.env.RL_STATS_KEY,
    },
  })
}

const reprocess = (collection: string, params: any) => {
  return request({
    method: 'POST',
    url: [baseUrl, 'platform', collection, '_reprocess'].join('/'),
    qs: params,
    headers: {
      'x-api-key': process.env.RL_STATS_KEY,
    },
  })
}

export default { get, put, post, report, reprocess }
