var mongoose = require('mongoose')
var Schema = mongoose.Schema
var crypto = require('crypto')
var { createHash, createSalt, isPassword, async } = require('../utils')
var { AppError } = require('../errors')
var { isEmail } = require('validator')
var jwt = require('jsonwebtoken')

var userSchema = new Schema({
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


userSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.salt = createSalt()
    this.password = createHash(this.password, this.salt)
  }
  if (!this.created_at) {
    this.created_at = Date.now()
  }
  this.updated_at = Date.now()
  next()
})

var secret = 'asdfghjkl'

var sign = (email, _id) => jwt.sign({email, _id}, secret, { expiresIn: '1h' })

var response = ({ email, _id }) => {
  return { email, _id, token: sign(email, _id) }
}

userSchema.statics.setSecret = (_secret) => secret = _secret

userSchema.statics.verify = (token) => jwt.verify(token, secret)

userSchema.statics.login = async(function * ({ email, password }, next) {
  var user = yield this.findOne({ email }, next)
  var isValid = user && user.password === createHash(password, user.salt)
  if (!isValid) throw new AppError('Invalid email or password.')
  return response(user)
})

userSchema.methods.signup = async(function * (next) {
  var user = yield this.save(next)
  return response(user)
})

module.exports = mongoose.model('User', userSchema)