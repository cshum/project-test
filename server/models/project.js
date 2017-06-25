var mongoose = require('mongoose')
var Schema = mongoose.Schema
var { async, hook } = require('../utils')
var { AppError, NotFoundError, ServerError } = require('../errors')

var ProjectSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Title max length exceeded']
  },
  status: {
    type: String,
    required: true,
    default: 'new',
    enum: {
      values: ['new', 'pending', 'expired', 'finished'],
      message: 'Invalid status'
    }
  },
  start_at: {
    type: Date,
    required: true
  },
  created_at: Date,
  updated_at: Date
})

ProjectSchema.pre('save', hook(function * (next) {
  if (this.status === 'finished' && Date.now() > this.start_at) {
    throw new AppError('Project already expired')
  }
  this.updated_at = Date.now()
  if (this.isModified('created_at')) throw new AppError('Invalid operation')
  if (!this.created_at) this.created_at = Date.now()
}))

ProjectSchema.statics.update = async(function * (id, val, next) {
  var project = yield this.findById(id) 
  if (!project) throw new NotFoundError(`Project ${id} not found`)
  Object.assign(project, val)
  return yield project.save()
})

var Project = mongoose.model('Project', ProjectSchema)

module.exports = Project