'use strict'

var logger = require('log4js').getLogger()

const BaseError = require('es6-error')

class AppError extends BaseError {
  constructor (msg, status = 400) {
    super(msg)
    this.error = true
    this.status = status
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
  constructor (msg = 'Unauthorized') {
    super(msg, 401)
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

class ServerError extends AppError {
  constructor ({ message }) {
    super(message || 'Server error', 500)
  }
}

const wrapError = (err) => {
  if (err instanceof AppError) {
    return err
  } else {
    // unexpected error
    logger.error(err)
    return new ServerError(err)
  }
}

module.exports = {
  AppError,
  AuthError,
  NotFoundError,
  ServerError,
  wrapError
}