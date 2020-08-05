import { Request, Response, NextFunction } from 'express'
import { create, ModuleOptions } from 'simple-oauth2'

import rlStats from '../../../services/rl-stats'
import { getConnections, getUser } from '../../../services/discord'

// Initialize the OAuth2 Library
const initialize = () => {
  const credentials: ModuleOptions = {
    client: {
      id: process.env.DISCORD_CLIENT_ID,
      secret: process.env.DISCORD_CLIENT_SECRET,
    },
    auth: {
      tokenHost: 'https://discord.com',
      authorizePath: '/api/oauth2/authorize',
      tokenPath: '/api/oauth2/token',
    },
  }
  return create(credentials)
}

const scope = 'identify connections'
const getRedirect = () => `${process.env.PROTOCOL}://${process.env.HOST}/api/v1/auth/discord/callback`

const syncPlayers = async discordUser => {
  const acceptedConnections = ['steam', 'xbox']
  const players = await rlStats.get('players', { discord_id: discordUser.id })
  if (players.length > 1) throw new Error(`multiple players linked with discord id: ${discordUser.id}`)
  const accounts = discordUser.connections
    .filter(c => acceptedConnections.includes(c.type))
    .map(c => ({ platform: c.type, platform_id: c.id }))

  if (!players[0]) {
    return rlStats.post('players', {
      screen_name: discordUser.username,
      discord_id: discordUser.id,
      accounts,
    })
  }

  const player = players[0]
  const uniqueAccounts = accounts.filter(
    a => !player.accounts.some(b => a.platform === b.platform && a.platform_id === b.platform_id),
  ) // remove connections already known
  const allAccounts = player.accounts.concat(uniqueAccounts)
  return rlStats.put(`/players/${player._id}`, { accounts: allAccounts })
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
    // add user to spreadsheet
    await syncPlayers(user)
    return res.redirect(process.env.MNCS_SITE_URL)
  } catch (error) {
    return next(error)
  }
}
