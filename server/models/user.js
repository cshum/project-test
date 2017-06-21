var mongoose = require('mongoose')
var Schema = mongoose.Schema
var crypto = require('crypto')
var { isNil } = require('lodash')
var { createHash, createSalt } = require('../utils')

var userSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: String,
  salt: String,
  created_at: Date,
  updated_at: Date
})

userSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.salt = createSalt()
    this.password = createHash(this.password, this.salt)
  }
  if (isNil(this.created_at)) {
    this.created_at = Date.now();
  }
  this.updated_at = Date.now();
  next()
})

var User = mongoose.model('User', userSchema)

module.exports = User