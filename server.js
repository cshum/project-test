var logger = require('log4js').getLogger()
var pkg = require('./package.json')
var express = require('express')
var xtend = require('xtend')
var path = require('path')

var fs = require('fs-extra')
if (!fs.existsSync('./config.json')) {
  fs.copySync('./config.default.json', './config.json')
}
var config = Object.assign({}, require('./config.default.json'), require('./config.json'))

var port = config.port

// var api = require('./server/api')(config.mysql)

var app = express()

app.use('/api', require('./server/api')(config, logger))
app.use(express.static('./app/public'))

app.listen(port)
logger.info('%s started at http://localhost:%s', pkg.name, port)
