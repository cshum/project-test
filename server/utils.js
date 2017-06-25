'use strict'

const async = require('raco').wrap
const hook = function (genFn) {
  let asyncFn = async(genFn)
  return function (next) {
    return asyncFn.call(this, next)
  }
}

module.exports = {
  async, hook
}