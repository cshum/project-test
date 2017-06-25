var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var logger = require('log4js').getLogger()
var User = require('./models/user')
var Project = require('./models/project')
var request = require('superagent')

var { md } = require('./utils')
var {
  AppError,
  NotFoundError,
  ServerError,
  wrapError
} = require('./errors')

// util middleware
var util = (req, res, next) => {
  res.cb = (err, result) => {
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
// verify jwt token
var auth = () => {
  return (req, res, next) => {
    var token = req.headers.Authorization || req.headers.authorization || req.query.token
    if (typeof token === 'string') {
      if (token.substr(0, 7) === 'Bearer ') token = token.slice(7)
      req.access = User.verify(token)
      if (!(req.access && req.access._id)) return res.cb(new AppError('Invalid Token'))
      next()
    } else {
      return res.cb(new AppError('User unauthorized'))
    }
  }
}

module.exports = function api (config) {
  mongoose.connect(config.mongo.uri, config.mongo, (err) => {
    if (err) logger.error(err)
  })
  if (config.secret) User.setSecret(config.secret)

  var api = express()

  api.use(bodyParser.urlencoded({ limit: '1mb', extended: false }))
  api.use(bodyParser.json({ limit: '1mb' }))
  api.use(util)

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

  api.get('/profile', md(function * (req, res, next) {
    var result, user, extra, friends
    var token = '5a9b09c86195b8d8b01ee219d7d9794e2abb6641a2351850c49c309f'

    result = yield request.get('http://dev.the-straits-network.com/me/basic')
      .query({ token })
      .end(next)
    user = result.body
    if (!(user && user.id)) throw new NotFoundError()

    result = yield request.get(`http://dev.the-straits-network.com/${user.id}/extra`)
      .query({ token })
      .end(next)
    extra = result.body
    
    result = yield request.get(`http://dev.the-straits-network.com/${user.id}/friends`)
      .query({ token })
      .end(next)
    friends = result.body

    Object.assign(user, extra, { friends })

    res.cb(null, user)
  }))

  api.use((req, res) => {
    // 404 error
    res.status(404).json(new NotFoundError())
  })

  api.use((err, req, res, next) => {
    // 500 error
    logger.error(err)
    res.status(500).json(err)
  })

  return api
}
