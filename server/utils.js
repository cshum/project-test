var async = require('raco').wrap

function hook (genFn) {
  var asyncFn = async(genFn)
  return function (next) {
    return asyncFn.call(this, next)
  }
}

function md (genFn) {
  var asyncFn = async(genFn)
  if (genFn.length === 4) {
    // 4 args, return express error handling middleware
    return function (err, req, res, next) {
      return asyncFn.call(this, err, req, res, function (err) {
        if (err) return next(err)
        if (arguments.length === 0) return next()
        // args.length 0 for explicitly calling middleware next()
      })
    }
  } else {
    // return normal express middleware
    return function (req, res, next) {
      return asyncFn.call(this, req, res, function (err) {
        if (err) return next(err)
        if (arguments.length === 0) return next()
      })
    }
  }
}

module.exports = {
  async, hook, md
}