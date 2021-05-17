import { UpdateMap, overwrite } from './common'

const update: UpdateMap = {
  name: overwrite,
  avatar: overwrite,
  hex_color: overwrite,
  vars: data => {
    const [property, value] = data.value.split(',')
    const vars = data.doc.vars
    const varToUpdate = vars.find(v => v.key === property)
    if(value === 'undefined') {
      delete varToUpdate[property]
    } else {
      varToUpdate[property] = value
    }
    return { vars }
  },
}

export default update
