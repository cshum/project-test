'use strict'

const logger = require('log4js').getLogger()
const Err = require('es6-error')

// Base error class for all expected, app generated errors
class AppError extends Err {
  constructor (msg, status = 400) {
    super(msg)
    this.error = true
    this.status = status

    // json response
    this.response = {
      error: true,
      name: this.constructor.name,
      message: this.message
    }
  }
  toJSON () {
    return this.response
  }
}
class AuthError extends AppError {
  constructor (msg = 'Unauthorized', expired) {
    super(msg, 401)
    this.expired = expired
    this.response.expired = expired
  }
}
class NotFoundError extends AppError {
  constructor (msg = 'Not found', ref) {
    super(msg, 404)
    this.notFound = true
    this.ref = ref
    this.response.ref = ref
  }
}

class ValidationError extends AppError {
  constructor (msg = 'Invalid', errors) {
    super(msg, 400)
    this.errors = errors
    this.response.errors = errors
  }
}

class ServerError extends AppError {
  constructor ({ message }) {
    super(message || 'Server error', 500)
  }
}

const wrapError = (err) => {
  if (err instanceof AppError) {
    // expected app generated error
    return err
  } else if (err && err.name === 'MongoError' && err.code === 11000) {
    // wrap mongo duplicated key error
    return new ValidationError('Key duplicated')
  } else if (err && err.name === 'ValidationError') {
    // wrap mongo schema validation error
    return new ValidationError(err.message, err.errors)
  } else {
    // unexpected error as 500 server error
    logger.error(err)
    return new ServerError(err)
  }
}

module.exports = {
  AppError,
  AuthError,
  NotFoundError,
  ValidationError,
  ServerError,
  wrapError
}