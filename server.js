'use strict'

const logger = require('log4js').getLogger()
const pkg = require('./package.json')
const express = require('express')
const xtend = require('xtend')
const path = require('path')
const fs = require('fs-extra')
if (!fs.existsSync('./config.json')) {
  fs.copySync('./config.default.json', './config.json')
}
const config = Object.assign({}, require('./config.default.json'), require('./config.json'))
const app = express()

var port = config.port

app.use('/api', require('./server/api')(config))
app.use(express.static('./app/public'))

app.listen(port)
logger.info('%s started at http://localhost:%s', pkg.name, port)
