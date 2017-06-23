var mongoose = require('mongoose')
var Schema = mongoose.Schema
var crypto = require('crypto')
var { async, hook } = require('../utils')
var { AppError } = require('../errors')
var { isEmail } = require('validator')
var { isString } = require('lodash')
var jwt = require('jsonwebtoken')

var _secret = 'asdfghjkl'
var sign = (email, _id) => jwt.sign({email, _id}, _secret, { expiresIn: '1h' })

var createHash = async(function * (str, salt, next) {
  var buf = yield crypto.pbkdf2(str, salt, 4096, 64, 'SHA1', next)
  return buf.toString('base64')
})

var createSalt = async(function * (next) {
  var buf = yield crypto.randomBytes(18, next)
  return buf.toString('base64')
})

var PWD_REGEX = /^[a-zA-Z0-9]{8,}$/i
var isPassword = (pwd) => PWD_REGEX.test(pwd)

var response = ({ email, _id }) => {
  return {
    email,
    _id,
    token: sign(email, _id)
  }
}

var UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: [isEmail, 'Email address invalid.']
  },
  password: {
    type: String,
    required: true,
    trim: true,
    validate: [isPassword, 'Password invalid.']
  },
  salt: String,
  created_at: Date,
  updated_at: Date 
})


UserSchema.pre('save', hook(function * (next) {
  if (this.isModified('password')) {
    this.salt = yield createSalt(next)
    this.password = yield createHash(this.password, this.salt, next)
  }
  if (!this.created_at) {
    this.created_at = Date.now()
  }
  this.updated_at = Date.now()
}))

UserSchema.statics.set_secret = (secret) => _secret = secret

UserSchema.statics.verify = (token) => jwt.verify(token, _secret)

UserSchema.statics.login = async(function * ({ email, password }, next) {
  var user = yield this.findOne({ email })
  // user exists and password hash matches
  var isValid = false
  if (user && user.salt) {
    var hash = yield createHash(password, user.salt, next)
    isValid = user.password === hash
  } else {
    isValid = false
  }
  if (!isValid) throw new AppError('Invalid email or password.')
  return response(user)
})

UserSchema.methods.signup = async(function * (next) {
  return response(yield this.save())
})

module.exports = mongoose.model('User', UserSchema)