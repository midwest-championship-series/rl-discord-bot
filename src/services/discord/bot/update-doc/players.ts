import { UpdateMap, overwrite } from './common'

const update: UpdateMap = {
  screen_name: data => {
    const { value, discordUser } = data
    if (value) {
      return overwrite(data)
    } else {
      return { screen_name: discordUser.username }
    }
  },
  avatar: overwrite,
  team_history: data => {
    const [id, property, value] = data.value.split(',')
    const team_history = data.doc.team_history
    const historyToUpdate = team_history.find(h => h._id === id)
    if (value === 'undefined') {
      delete historyToUpdate[property]
    } else {
      historyToUpdate[property] = value
    }
    return { team_history }
  },
}

export default update
