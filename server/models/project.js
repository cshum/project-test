'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { async, hook } = require('../utils')
const { NotFoundError, ValidationError } = require('../errors')
const { isMongoId } = require('validator')

const ProjectSchema = new Schema({
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
    throw new ValidationError('Project already expired')
  }
  this.updated_at = Date.now()
  if (this.isModified('created_at')) throw new ValidationError('Invalid operation')
  if (!this.created_at) this.created_at = Date.now()
}))

ProjectSchema.statics.get = async(function * (id) {
  if (!isMongoId(id)) throw new ValidationError('Invalid ID')
  return yield this.findById(id)
})

ProjectSchema.statics.update = async(function * (id, val) {
  var project = yield this.get(id)
  if (!project) throw new NotFoundError('Project not found', id)
  Object.assign(project, val)
  return yield project.save()
})

module.exports = mongoose.model('Project', ProjectSchema)
