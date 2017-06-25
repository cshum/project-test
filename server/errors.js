var BaseError = require('es6-error')

class AppError extends BaseError {
  constructor (msg, status = 400) {
    super(msg)
    this.error = true
    this.status = status
  }

  toJSON () {
    return {
      error: true,
      message: this.message
    }
  }
}

class NotFoundError extends AppError {
  constructor (msg = 'Not Found') {
    super(msg, 404)
    this.notFound = true
  }
}

class ServerError extends AppError {
  constructor (msg = 'Server Error') {
    super(msg, 500)
  }
}

function wrapError (err) {
  if (!err) return {
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ServerError,
  wrapError
}