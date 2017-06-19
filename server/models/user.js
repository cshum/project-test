var mongoose = require('mongoose')
var Schema = mongoose.Schema

var User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  passwordHash: String,
  passwordSalt: String,
  created_at: Date,
  updated_at: Date
})

module.exports = User