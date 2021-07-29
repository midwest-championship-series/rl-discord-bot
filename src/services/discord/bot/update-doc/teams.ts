import { UpdateMap, overwrite } from './common'

const update: UpdateMap = {
  name: overwrite,
  avatar: overwrite,
  hex_color: overwrite,
  discord_id: overwrite,
  vars: data => {
    const [property, value] = data.value.split(',')
    const vars = data.doc.vars.filter(x => x.key !== property)
    if (value !== 'undefined') {
      vars.push({ key: property, value: value })
    }
    return { vars }
  },
}

export default update
