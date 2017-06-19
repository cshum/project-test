var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Project = mongoose.model('Project', {
  title: { type: String, required: true },
  status: { type: String, enum: [] },
  created_at: Date,
  updated_at: Date
})

module.exports = Project