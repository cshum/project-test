'use strict'

const log4js = require('log4js')
const logger = log4js.getLogger()
const pkg = require('./package.json')
const express = require('express')
const fs = require('fs-extra')
const NODE_ENV = process.env.NODE_ENV
const mode = (NODE_ENV && NODE_ENV !== 'default') ? NODE_ENV : 'production'

const configFile = `./config.${mode}.json`
if (!fs.existsSync(configFile)) {
  fs.copySync('./config.default.json', configFile)
}
const config = require(configFile)
const port = parseInt(process.argv[2]) || config.port

const app = express()
if (mode === 'development') {
  app.use('/api', log4js.connectLogger(logger, {
    level: 'auto',
    format: ':method :url :status'
  }))
}
app.use('/api', require('./server/api')(config))
app.use(express.static('./app/public'))
app.listen(port)

logger.info('%s mode: %s, port: %s', pkg.name, mode, port)
