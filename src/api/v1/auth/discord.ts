import { Request, Response, NextFunction } from 'express'
import { AuthorizationCode } from 'simple-oauth2'

import rlStats from '../../../services/rl-stats'
import { getConnections, getUser } from '../../../services/discord'

const mncsSiteUrl = 'https://www.mnchampionshipseries.com/'

const oauth2 = new AuthorizationCode({
  client: {
    id: process.env.DISCORD_CLIENT_ID,
    secret: process.env.DISCORD_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://discord.com',
    authorizePath: '/api/oauth2/authorize',
    tokenPath: '/api/oauth2/token',
  },
})

const scope = 'identify connections email'
const getRedirect = () => `${process.env.PROTOCOL}://${process.env.HOST}/api/v1/auth/discord/callback`

const syncPlayers = async discordUser => {
  const players = await rlStats.get('players', { discord_id: discordUser.id })
  if (players.length > 1) throw new Error(`multiple players linked with discord id: ${discordUser.id}`)
  console.log(JSON.stringify(discordUser, null, 2))
  const accounts = discordUser.connections.map(c => ({ platform: c.type, platform_id: c.id }))

  if (!players[0]) {
    return rlStats.post('players', {
      screen_name: discordUser.username,
      discord_id: discordUser.id,
      accounts,
      email: discordUser.email,
      discord_linked: Date.now(),
    })
  }

  const player = players[0]
  const uniqueAccounts = accounts.filter(
    a => !player.accounts.some(b => a.platform === b.platform && a.platform_id === b.platform_id),
  ) // remove connections already known
  const allAccounts = player.accounts.concat(uniqueAccounts)
  return rlStats.put(`/players/${player._id}`, {
    accounts: allAccounts,
    email: discordUser.email,
    discord_linked: Date.now(),
  })
}

export function DiscordRedirect(req: Request, res: Response, next: NextFunction): void {
  // Authorization oauth2 URI
  const authorizationUri = oauth2.authorizeURL({
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
    const { token } = await oauth2.getToken(tokenConfig)
    // get user's discord info
    const user = await getUser(token.access_token)
    user.connections = await getConnections(token.access_token)
    // add user to spreadsheet
    await syncPlayers(user)
    return res.redirect(mncsSiteUrl)
  } catch (error) {
    return next(error)
  }
}
