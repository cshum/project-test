var BaseError = require('es6-error')

class AppError extends BaseError {
  constructor (msg, status = 400) {
    this.error = true
    this.status = status
    super(msg)
  }

  toJSON () {
    return {
      error: true,
      status: this.status,
      message: this.message
    }
  }
}

class NotFoundError extends AppError {
  constructor (msg = 'Not Found') {
    this.notFound = true
    super(msg, 404)
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