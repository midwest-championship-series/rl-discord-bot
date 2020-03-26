import { Request, Response, NextFunction } from 'express'
import { create, ModuleOptions } from 'simple-oauth2'

import rlStats from '../../../services/rl-stats'
import { getConnections, getUser } from '../../../services/discord'
import { v4 as uuid } from 'uuid'

// Initialize the OAuth2 Library
const initialize = () => {
  const credentials: ModuleOptions = {
    client: {
      id: process.env.DISCORD_CLIENT_ID,
      secret: process.env.DISCORD_CLIENT_SECRET,
    },
    auth: {
      tokenHost: 'https://discordapp.com',
      authorizePath: '/api/oauth2/authorize',
      tokenPath: '/api/oauth2/token',
    },
  }
  return create(credentials)
}
const getRedirect = () => `${process.env.PROTOCOL}://${process.env.HOST}/api/v1/auth/discord/callback`
const scope = 'identify connections'

const syncMembers = (knownMembers, discordUser) => {
  const insert = discordUser.connections
    .filter(c => c.type === 'steam' || c.type === 'xbox')
    .map(connection => ({
      id: uuid(),
      discord_id: discordUser.id,
      platform: connection.type,
      platform_id: connection.id,
      screen_name: discordUser.username,
    }))
  return rlStats.put('members', { members: insert })
}

export function DiscordRedirect(req: Request, res: Response, next: NextFunction): void {
  // Authorization oauth2 URI
  const oauth2 = initialize()
  const authorizationUri = oauth2.authorizationCode.authorizeURL({
    redirect_uri: getRedirect(),
    scope, // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
    // state: '<state>'
  })
  return res.redirect(authorizationUri)
}

export async function DiscordCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { code } = req.query
  // Get the access token object (the authorization code is given from the previous step).
  const tokenConfig = { code, redirect_uri: getRedirect(), scope }

  // Save the access token
  try {
    // discord oauth
    const oauth2 = initialize()
    const result = await oauth2.authorizationCode.getToken(tokenConfig)
    const { token } = oauth2.accessToken.create(result)
    // get user's discord info
    const user = await getUser(token.access_token)
    user.connections = await getConnections(token.access_token)
    const members = await rlStats.get('members', { discord_id: user.id })
    // add user to spreadsheet
    res.body = await syncMembers(members, user)
    return next()
  } catch (error) {
    return next(error)
  }
}
