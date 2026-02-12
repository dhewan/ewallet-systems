import config from '../../../config.js'

export default {
  local: {
    username: config.db_user,
    password: config.db_pass,
    database: config.db_name,
    host: config.db_server,
    port: config.db_port,
    dialect: 'mysql'
  },
  development: {
    username: config.db_user,
    password: config.db_pass,
    database: config.db_name,
    host: config.db_server,
    port: config.db_port,
    dialect: 'mysql'
    // logging: false
  },
  production: {
    username: config.db_user,
    password: config.db_pass,
    database: config.db_name,
    host: config.db_server,
    port: config.db_port,
    dialect: 'mysql',
    logging: false
  }
}
