'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./models/user')
const Project = require('./models/project')
const { common, auth } = require('./middlewares')

const log4js = require('log4js')
const logger = log4js.getLogger('api')
const { NotFoundError, wrapError } = require('./errors')

module.exports = function api (config) {
  mongoose.connect(config.mongo.uri, config.mongo, (err) => {
    if (err) logger.error(err)
  })
  if (config.secret) User.setSecret(config.secret)

  const api = express()

  api.use(bodyParser.urlencoded({ limit: '1mb', extended: false }))
  api.use(bodyParser.json({ limit: '1mb' }))
  api.use(log4js.connectLogger(logger, { level: 'auto', format: ':method :url :status' }))
  api.use(common)

  api.post('/login', (req, res) => User.login(req.body, res.cb))
  api.post('/signup', (req, res) => new User(req.body).signup(res.cb))

  api.get('/me', auth(), (req, res) => User.get(req.access._id, res.cb))
  api.put('/me', auth(), (req, res) => User.update(req.access._id, req.body, res.cb))

  api.get('/projects', auth(), (req, res) => {
    Project.find(res.cb)
  })
  api.post('/projects', auth(), (req, res) => {
    new Project(req.body).save(res.cb)
  })
  api.get('/projects/:project_id', auth(), (req, res) => {
    Project.findById(req.params.project_id, res.cb)
  })
  api.put('/projects/:project_id', auth(), (req, res) => {
    Project.update(req.params.project_id, req.body, res.cb)
  })

  api.get('/profile', (req, res) => {
    let token = '5a9b09c86195b8d8b01ee219d7d9794e2abb6641a2351850c49c309f'
    User.getProfile(token, res.cb)
  })

  api.use((req, res) => {
    // 404 error
    res.status(404).json(new NotFoundError('Page not found', req.originalUrl))
  })

  api.use((err, req, res, next) => {
    err = wrapError(err)
    res.status(err.status).json(err)
  })

  return api
}
