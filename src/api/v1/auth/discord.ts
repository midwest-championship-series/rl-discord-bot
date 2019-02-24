import { Request, Response, NextFunction } from 'express'
import { create, ModuleOptions } from 'simple-oauth2'

// Set the configuration settings
const credentials: ModuleOptions = {
    client: {
        id: process.env.DISCORD_CLIENT_ID,
        secret: process.env.DISCORD_CLIENT_SECRET
    },
    auth: {
        tokenHost: 'https://discordapp.com',
        authorizePath: '/api/oauth2/authorize',
        tokenPath: '/api/oauth2/token'
    }
}

// Initialize the OAuth2 Library
const oauth2 = create(credentials)
const redirect_uri = `${process.env.PROTOCOL}://${process.env.HOST}/api/v1/auth/discord/callback`
const scope = ['connections']

export function DiscordRedirect(req: Request, res: Response, next: NextFunction): void {
    // Authorization oauth2 URI
    const authorizationUri = oauth2.authorizationCode.authorizeURL({
        redirect_uri,
        scope // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
        // state: '<state>'
    })
    return res.redirect(authorizationUri)
}

export async function DiscordCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { code } = req.query
    // Get the access token object (the authorization code is given from the previous step).
    const tokenConfig = { code, redirect_uri, scope }

    // Save the access token
    try {
        const result = await oauth2.authorizationCode.getToken(tokenConfig)
        const accessToken = oauth2.accessToken.create(result)
        res.body = accessToken
        next()
    } catch (error) {
        return next(error)
    }
}