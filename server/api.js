var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var {
  AppError,
  NotFoundError,
  ServerError,
  wrapError
} = require('./errors')

// util middleware
function util (req, res, next) {
  res.cb = function (error, result) {
    if (error) {
      res.status(error.status || 400)
      res.json(error)
    } else {
      res.json(result)
    }
  }
  next()
}

module.exports = function (config) {
  mongoose.connect(config.mongo.uri, config.mongo)
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

  api.get('/login', function (req, res) {
  })

  api.get('/signup', function (req, res) {
  })

  api.use(function (req, res) {
    // 404 error
    res.status(404).json(new NotFoundError())
  })

  api.use(function (err, req, res, next) {
    // 500 error
    res.status(500).json(err)
  })

  return api
}
