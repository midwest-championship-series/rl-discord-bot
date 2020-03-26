import request from '../utils/request'

const Discord = require('discord.js')
const client = new Discord.Client()

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', msg => {
  if (msg.channel.name === 'dev' || msg.channel.name === 'score-report') {
    if (msg.content.startsWith('!report')) {
      const [command, ...urls] = msg.content.split(' ')
      const gameIds = urls.map(
        url =>
          url
            .split('?')[0]
            .split('/')
            .slice(-1)[0],
      )
      msg.channel.send(`Thank you for the report, @${msg.author.username}!\nGames reported: ${gameIds.join(', ')}`)
    }
  }
})

client.login(process.env.DISCORD_BOT_SECRET)

const baseUrl = 'https://discordapp.com/api'

/**
 * Gets a user's Discord identity
 * @param token user's access token from oauth2
 */
export const getUser = token => {
  return request({
    method: 'GET',
    url: [baseUrl, 'users', '@me'].join('/'),
    auth: { bearer: token },
  })
}

/**
 * Gets a list of user's connections
 * @param token user's access token from oauth2
 */
export const getConnections = token => {
  return request({
    method: 'GET',
    url: [baseUrl, 'users', '@me', 'connections'].join('/'),
    auth: { bearer: token },
  })
}
