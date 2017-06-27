'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const crypto = require('crypto')
const { async, hook } = require('../utils')
const { AuthError, ServerError, ValidationError } = require('../errors')
const { isEmail, isMongoId } = require('validator')
const jwt = require('jsonwebtoken')
const request = require('superagent')

// jwt secret, should be overriden by config
var _secret = 'keyboardcat' 

// random generated password salt
const createSalt = async(function * (next) {
  var buf = yield crypto.randomBytes(18, next)
  return buf.toString('base64')
})
// password hash from plain & salt
const createHash = async(function * (str, salt, next) {
  var buf = yield crypto.pbkdf2(str, salt, 4096, 64, 'SHA1', next)
  return buf.toString('base64')
})

const PWD_REGEX = /^[a-zA-Z0-9]{8,}$/i // min 8 chars, only letters and numbers
const isPassword = (pwd) => PWD_REGEX.test(pwd)

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: [isEmail, 'Email address invalid.']
  },
  password: {
    type: String,
    trim: true,
    validate: [isPassword, 'Password invalid.']
  },
  hash: String,
  salt: String,
  created_at: Date,
  updated_at: Date 
})

UserSchema.pre('save', hook(function * (next) {
  // password required on signup
  if (this.isNew && !this.password) {
    throw new AuthError('Password required.')
  }
  if (this.isModified('password')) {
    // store hash & salt, clear plain text pwd
    this.salt = yield createSalt(next)
    this.hash = yield createHash(this.password, this.salt, next)
    this.set('password', undefined)
  } else if (this.isModified('hash') || this.isModified('salt')) {
    // hash & salt must not be modified by user
    throw new AuthError('Invalid operation')
  }
  this.updated_at = Date.now()
  if (this.isModified('created_at')) throw new AuthError('Invalid operation')
  if (!this.created_at) this.created_at = Date.now()
}))

// clear sensitive user info on display
const clear = (user) => {
  user.set('salt', undefined)
  user.set('hash', undefined)
  return user
}

UserSchema.post('save', clear)

UserSchema.statics.setSecret = (secret) => _secret = secret

UserSchema.statics.verify = (token) => jwt.verify(token, _secret)

// sign jwt token expires 4 hours
UserSchema.statics.sign = ({ email, _id }) => {
  return {
    email, _id,
    token: jwt.sign({ email, _id }, _secret, { expiresIn: '4h' })
  }
}

UserSchema.statics.login = async(function * ({ email, password }, next) {
  var user = yield this.findOne({ email })
  // user exists and password hash matches
  var isValid = 
    password && user && user.salt && 
    user.hash === (yield createHash(password, user.salt, next))
  if (!isValid) throw new AuthError('Invalid email or password.')
  return this.sign(user)
})

UserSchema.methods.signup = async(function * () {
  return this.model('User').sign(yield this.save())
})

UserSchema.statics.get = async(function * (id) {
  if (!isMongoId(id)) throw new ValidationError('Invalid ID')
  return clear(yield this.findById(id))
})

UserSchema.statics.update = async(function * (id, val) {
  var user = yield this.findById(id)
  if (!user) throw new NotFoundError('User not found', id)
  Object.assign(user, val)
  return yield user.save()
})

UserSchema.statics.getProfile = async(function * (token, next) {
  var result, user, extra, friends

  result = yield request.get('http://dev.the-straits-network.com/me/basic')
    .query({ token })
    .end(next)
  user = result.body
  if (!(user && user.id)) throw new NotFoundError('User not found')

  result = yield request.get(`http://dev.the-straits-network.com/${user.id}/extra`)
    .query({ token })
    .end(next)
  extra = result.body
  
  result = yield request.get(`http://dev.the-straits-network.com/${user.id}/friends`)
    .query({ token })
    .end(next)
  friends = result.body

  Object.assign(user, extra, { friends })
  return user
})

module.exports = mongoose.model('User', UserSchema)