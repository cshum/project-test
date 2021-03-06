'use strict'

const log4js = require('log4js')
const logger = log4js.getLogger('api')
const User = require('./models/user')
const { AuthError, wrapError } = require('./errors')

// common middleware
const common = (req, res, next) => {
  res.cb = (err, result) => {
    if (err) {
      err = wrapError(err)
      res.status(err.status).json(err)
    } else {
      res.json(result)
    }
  }
  next()
}
// verify jwt token
const auth = () => {
  return (req, res, next) => {
    var token = req.headers.Authorization || req.headers.authorization || req.query.token
    if (typeof token === 'string') {
      if (token.substr(0, 7) === 'Bearer ') token = token.slice(7)
      try {
        req.access = User.verify(token)
        if (!(req.access && req.access._id)) throw new AuthError('Invalid Token')
      } catch (err) {
        if (err && err.name === 'TokenExpiredError') {
          return res.cb(new AuthError('Token Expired', true))
        }
      }
      if (req.access && req.access._id) return next()
      else return res.cb(new AuthError('Invalid token'))
    } else {
      return res.cb(new AuthError('Unauthorized'))
    }
  }
}

module.exports = {
  common, auth
}