import db from '../db/mysql/models/index.js'

const { Users } = db

export const getUserById = async (id) => {
  const user = await Users.findOne({ where: { id } })
  if (!user) {
    return {
      error: 'User not found.',
      code: 404
    }
  }
  return user
}
