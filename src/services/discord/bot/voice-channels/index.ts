import { Client, VoiceState, PermissionsBitField, VoiceBasedChannel } from 'discord.js'

const CHANNEL_NAME_SLUG = 'mcs'

const isCreateChannel = (channel: VoiceBasedChannel) => {
  return channel.name.split(' ')[0].toLowerCase() === 'create'
}

const handleConnect = async (state: VoiceState) => {
  if (state.channel && isCreateChannel(state.channel)) {
    console.log('handling channel create')
    const newChannel = await state.channel.clone({
      name: `${state.channel.name
        .split(' ')
        .slice(1)
        .join(' ')} ${CHANNEL_NAME_SLUG}`,
      permissionOverwrites: [
        {
          id: state.channel.guild.roles.everyone,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Speak],
        },
      ],
    })
    await state.member.voice.setChannel(newChannel)
  }
}

const isManagedVC = (channel: VoiceBasedChannel) => {
  return (
    channel.name
      .split(' ')
      .slice(-1)[0]
      .toLowerCase() === CHANNEL_NAME_SLUG
  )
}

const handleDisconnect = async (state: VoiceState) => {
  if (isManagedVC(state.channel)) {
    if (state.channel.members.size < 1) {
      console.log('disconnecting managed vc')
      await state.channel.delete('AUTO_DELETE_LAST_CONNECTED_LEFT')
    }
  }
}

export default (client: Client) => {
  try {
    if (process.env.MNRL_ENV !== 'prod') return
    client.on('voiceStateUpdate', async (oldState, newState) => {
      if (newState && newState.channel) {
        await handleConnect(newState)
      }
      if (oldState && oldState.channel) {
        await handleDisconnect(oldState)
      }
    })
  } catch (err) {
    console.error(err)
  }
}
