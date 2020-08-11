import rlStats from '../../../services/rl-stats'

const checkPermissions = async (authorId: string, { command, permissions }) => {
  if (!permissions) return
  const [user] = await rlStats.get('players', { discord_id: authorId })
  if (!user.permissions || !user.permissions.some(p => permissions.includes(p))) {
    throw new Error(`${user.screen_name} not allowed to perform action: ${command}`)
  }
}

export default checkPermissions
