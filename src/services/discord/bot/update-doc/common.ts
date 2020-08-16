export const overwrite: Updater = ({ property, value }) => {
  return { [property]: value }
}

export type Updater = (update: {
  discordRole?: any
  discordUser?: any
  doc: any
  property: string // the property being updated
  value: string // the value of the update
}) => { [key: string]: any }

export type UpdateMap = { [key: string]: Updater }
