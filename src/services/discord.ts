const Discord = require('discord.js')
const client = new Discord.Client()

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', msg => {
  if (msg.channel.name === 'dev' || msg.channel.name === 'score-report') {
    if (msg.content.startsWith('!report')) {
      console.log('msg', msg)
      const [command, ...urls] = msg.content.split(' ')
      const gameIds = urls.map(
        url =>
          url
            .split('?')[0]
            .split('/')
            .slice(-1)[0],
      )
      msg.channel.send(`Thank you for the report, @${msg.author.username}!\nGames reported: ${gameIds.join(', ')}`)
      // if (matchId) {
      // check who message is from
      // if it is from moderator, accept no matter what
      // format: !report @tero <game_id> <game_id> <game_id> <game_id>
      // tell serverless app to store the results of that game
      // report any validation errors provided by serverless app
      // }
    }
  }
  // if (msg.content.startsWith('!kick')) {
  //   msg.channel.send("I can't kick brosia, he's too nice")
  // }
})

client.login(process.env.DISCORD_BOT_SECRET)
