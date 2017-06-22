var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var logger = require('log4js').getLogger()
var User = require('./models/user')
var Project = require('./models/project')
var {
  AppError,
  NotFoundError,
  ServerError,
  wrapError
} = require('./errors')

// util middleware
function util (req, res, next) {
  res.cb = function (err, result) {
    if (err) {
      logger.error(err)
      res.status(err.status || 400)
      res.json(err)
    } else {
      res.json(result)
    }
  }
  next()
}

module.exports = function (config) {
  mongoose.connect(config.mongo.uri, config.mongo, (err) => {
    if (err) logger.error(err)
  })
  if (config.secret) User.setSecret(config.secret)

  var api = express()

  api.use(bodyParser.urlencoded({ limit: '1mb', extended: false }))
  api.use(bodyParser.json({ limit: '1mb' }))
  api.use(util)

  api.get('/projects', function (req, res) {
  })

  api.get('/projects/:project_id', function (req, res) {
  })

  api.put('/projects/:project_id', function (req, res, next) {
  })

  api.post('/login', function (req, res) {
    User.login(req.body, res.cb)
  })

  api.post('/signup', function (req, res) {
    new User(req.body).signup(res.cb)
  })

  api.use(function (req, res) {
    // 404 error
    res.status(404).json(new NotFoundError())
  })

  api.use(function (err, req, res, next) {
    // 500 error
    logger.error(err)
    res.status(500).json(err)
  })

  return api
}
