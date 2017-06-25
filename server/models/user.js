var mongoose = require('mongoose')
var Schema = mongoose.Schema
var crypto = require('crypto')
var { async, hook } = require('../utils')
var { AppError, ServerError } = require('../errors')
var { isEmail } = require('validator')
var jwt = require('jsonwebtoken')

// jwt secret, should be overriden by config
var _secret = 'keyboardcat' 

// random generated password salt
var createSalt = async(function * (next) {
  var buf = yield crypto.randomBytes(18, next)
  return buf.toString('base64')
})
// password hash from plain & salt
var createHash = async(function * (str, salt, next) {
  var buf = yield crypto.pbkdf2(str, salt, 4096, 64, 'SHA1', next)
  return buf.toString('base64')
})

var PWD_REGEX = /^[a-zA-Z0-9]{8,}$/i // min 8 chars, only letters and numbers
var isPassword = (pwd) => PWD_REGEX.test(pwd)

// sign jwt token expires 1 hour
var sign = ({ email, _id }) => {
  return {
    email, _id,
    token: jwt.sign({email, _id}, _secret, { expiresIn: '1h' })
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
    throw new AppError('Password required.')
  }
  if (this.isModified('password')) {
    // store hash & salt, clear plain text pwd
    this.salt = yield createSalt(next)
    this.hash = yield createHash(this.password, this.salt, next)
    this.set('password', undefined) // clear plain text pwd
  } else if (this.isModified('hash') || this.isModified('salt')) {
    // hash & salt must not be modified by user
    throw new AppError('Invalid operation')
  }
  this.updated_at = Date.now()
  if (this.isModified('created_at')) throw new AppError('Invalid operation')
  if (!this.created_at) this.created_at = Date.now()
}))

// clear sensitive user info on display
var clear = (user) => {
  user.set('salt', undefined)
  user.set('hash', undefined)
  return user
}
UserSchema.post('save', clear)

UserSchema.statics.setSecret = (secret) => _secret = secret
UserSchema.statics.verify = (token) => {
  try {
    return jwt.verify(token, _secret)
  } catch (e) {
    return null
  }
}

UserSchema.statics.login = async(function * ({ email, password }, next) {
  var user = yield this.findOne({ email })
  // user exists and password hash matches
  var isValid = 
    user && user.salt && 
    user.hash === (yield createHash(password, user.salt, next))
  if (!isValid) throw new AppError('Invalid email or password.')
  return sign(user)
})

UserSchema.methods.signup = async(function * () {
  return sign(yield this.save())
})

UserSchema.statics.get = async(function * (id) {
  return clear(yield this.findById(id))
})

UserSchema.statics.update = async(function * (id, val) {
  var user = yield this.findById(id)
  if (!user) throw new NotFoundError(`User ${id} not found`)
  Object.assign(user, val)
  return yield user.save()
})

module.exports = mongoose.model('User', UserSchema)