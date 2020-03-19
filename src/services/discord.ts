const Discord = require('discord.js')
const client = new Discord.Client()

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
  // console.log('connected to...', client.guilds)
  client.channels.cache.forEach(guild => console.log(guild.name))
})

client.on('message', msg => {
  console.log(msg)
  // if (msg.content === 'ping') {
  //   msg.reply('pong')
  // }
})

client.login(process.env.DISCORD_SECRET)
