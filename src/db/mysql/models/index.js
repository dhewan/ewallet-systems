'use strict'

import { readdirSync } from 'fs'
import { basename as _basename, dirname } from 'path'
import { fileURLToPath } from 'url'
import Sequelize, { DataTypes } from 'sequelize'

import appConfig from '../../../config.js'
import dbConfigList from '../config/config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const basename = _basename(__filename)
const config = dbConfigList[appConfig.env]
const db = {}

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
)

sequelize
  .authenticate()
  .then(() => {
    console.info('Connection has been established successfully.')
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err)
  })

const files = readdirSync(__dirname).filter((file) => {
  return (
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js' &&
    file.indexOf('.test.js') === -1
  )
})

await Promise.all(
  files.map(async (file) => {
    const model = await import(`./${file}`)
    const modelInstance = model.default(sequelize, DataTypes)
    db[modelInstance.name] = modelInstance
  })
)

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

export default db
