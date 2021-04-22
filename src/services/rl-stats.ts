import request from '../utils/request'

const baseUrl = process.env.RL_STATS_URL

const get = (resource: string, query: any = {}) => {
  let url = [baseUrl, 'v2', resource].join('/')
  if (typeof query === 'string') {
    url += `?${query}`
  }
  return request({
    method: 'GET',
    url,
    qs: typeof query === 'object' ? query : undefined,
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

const del = (resource: string) => {
  return request({
    method: 'DELETE',
    url: [baseUrl, 'v2', resource].join('/'),
    headers: {
      'x-api-key': process.env.RL_STATS_KEY,
    },
  })
}

const report = ({ urls, leagueId, replyToChannel }: { urls: string[]; leagueId: string; replyToChannel: string }) => {
  const body = {
    type: 'MATCH_PROCESS_GAMES_REPORTED',
    detail: {
      urls,
      league_id: leagueId,
      reply_to_channel: replyToChannel,
    },
  }
  console.log(`reporting games: ${urls.join(', ')}`)
  return request({
    method: 'POST',
    url: [baseUrl, 'v2', 'events'].join('/'),
    body,
    headers: {
      'x-api-key': process.env.RL_STATS_KEY,
    },
  })
}

const forfeit = (params: { replyToChannel: string; forfeitTeam: any; matchId: string }) => {
  const { replyToChannel, forfeitTeam, matchId } = params
  const body = {
    type: 'MATCH_PROCESS_FORFEIT_REPORTED',
    detail: {
      reply_to_channel: replyToChannel,
      forfeit_team_id: forfeitTeam._id,
      match_id: matchId,
    },
  }
  console.log(`reporting forfeit by ${forfeitTeam.name}`)
  return request({
    method: 'POST',
    url: [baseUrl, 'v2', 'events'].join('/'),
    body,
    headers: { 'x-api-key': process.env.RL_STATS_KEY },
  })
}

const reprocess = (collection: string, params: any) => {
  return request({
    method: 'POST',
    url: [baseUrl, 'platform', collection, '_reprocess'].join('/'),
    qs: params,
    headers: { 'x-api-key': process.env.RL_STATS_KEY },
  })
}

export default { get, put, post, del, report, reprocess, forfeit }
