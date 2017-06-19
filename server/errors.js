var BaseError = require('es6-error')

class AppError extends BaseError {
  constructor (msg, status = 400, code) {
    this.error = true
    this.status = status
    if (code) {
      this.code = code
      this[code] = true
    }
    super(msg)
  }
}

class NotFoundError extends AppError {
  constructor (msg = 'Not Found') {
    super(msg, 404, 'notFound')
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