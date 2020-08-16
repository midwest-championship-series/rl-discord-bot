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
}

export default update
