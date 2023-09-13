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

const report = ({
  urls,
  leagueId,
  replyToChannel,
  manualReports,
  mentionedTeamIds,
}: {
  urls: string[]
  leagueId: string
  replyToChannel: string
  manualReports?: {
    game_number: number
    winning_team_id: string
    forfeit: boolean
  }[]
  mentionedTeamIds?: string[]
}) => {
  const body: any = {
    type: 'MATCH_PROCESS_GAMES_REPORTED',
    detail: {
      urls,
      league_id: leagueId,
      reply_to_channel: replyToChannel,
    },
  }
  if (manualReports && manualReports.length > 0) {
    body.detail.manual_reports = manualReports
    body.detail.mentioned_team_ids = mentionedTeamIds
  }
  console.log(
    `reporting games: ${urls.join(', ')} ${manualReports &&
      manualReports.map(r => `${r.winning_team_id} ${r.forfeit ? 'won due to ff' : 'won'}`)}`,
  )
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

const reprocess = (collection: string, params: any, channelId: string) => {
  const body = {
    type: 'MATCH_REPROCESS',
    detail: {
      collection,
      params,
      reply_to_channel: channelId,
    },
  }

  return request({
    method: 'POST',
    url: [baseUrl, 'v2', 'events'].join('/'),
    body,
    headers: { 'x-api-key': process.env.RL_STATS_KEY },
  })
}

const getSeasonStandings = async (seasonId: string) => {
  return get('stats/modules/standings', { season_id: seasonId })
}

const getPlayerStats = async (filters: { property: string; value: string }[], stats: string[]) => {
  const response = await post('stats/modules/player-totals', {
    filters,
    stats,
  })
  return response
}

const ballchasing = {
  getGamePlayers: gameId => {
    return get(`modules/ballchasing/${gameId}/player-info`)
  },
}

const legacyGetPlayerStats = async (playerID: string, seasonID: string) => {
  if (seasonID === 'all') {
    const Response = await get('leagues')
    const seasonIDs = {
      mncs: Response[1].current_season_id,
      clmn: Response[0].current_season_id,
      mnrs: Response[2].current_season_id,
    }
    const postQuery = {
      size: 0,
      query: {
        bool: {
          filter: {
            bool: {
              must: [
                {
                  bool: {
                    should: [
                      { term: { season_id: seasonIDs.mncs } },
                      { term: { season_id: seasonIDs.clmn } },
                      { term: { season_id: seasonIDs.mnrs } },
                    ],
                  },
                },
                { term: { player_id: playerID } },
              ],
            },
          },
        },
      },
      aggs: {
        total_goals: {
          terms: {
            field: 'season_id.keyword',
          },
          aggs: {
            goals: {
              stats: {
                field: 'goals',
              },
            },
          },
        },
        total_assists: {
          terms: {
            field: 'season_id.keyword',
          },
          aggs: {
            assists: {
              stats: {
                field: 'assists',
              },
            },
          },
        },
        total_saves: {
          terms: {
            field: 'season_id.keyword',
          },
          aggs: {
            saves: {
              stats: {
                field: 'saves',
              },
            },
          },
        },
      },
    }

    const basic_stats = await post('stats/player_games', postQuery)
    // add logic to handle a return with 1, 2, or 3 season keys
    return basic_stats.aggregations
  } else {
    const postQuery = {
      size: 0,
      query: {
        bool: {
          filter: [{ term: { 'season_id.keyword': seasonID } }, { term: { 'player_id.keyword': playerID } }],
        },
      },
      aggs: {
        total_goals: {
          stats: {
            field: 'goals',
          },
        },
        total_assists: {
          stats: {
            field: 'assists',
          },
        },
        total_saves: {
          stats: {
            field: 'saves',
          },
        },
      },
    }
    const basic_stats = await post('stats/player_games', postQuery)
    return basic_stats.aggregations
  }
}
export default {
  get,
  put,
  post,
  del,
  report,
  reprocess,
  forfeit,
  legacyGetPlayerStats,
  getSeasonStandings,
  getPlayerStats,
  ballchasing,
}
