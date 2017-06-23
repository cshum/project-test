var async = require('raco').wrap

function hook (genFn) {
  var fn = async(genFn)
  return function (next) {
    return fn.call(this, next)
  }
}

module.exports = {
  async, hook
}