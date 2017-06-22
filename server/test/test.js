var test = require('tape')
var config = require('../config.default.json')
var xtend = require('xtend')
try {
  // config.json override default if exists
  config = xtend(config, require('../config.json'))
} catch (e) {}

var api = require('../lib/api')(config.mysql)

test('Products', function (t) {
  t.plan(3)
  api.getProduct(1, function (err, res) {
    t.notOk(err)
    t.equal(res.id, 1)
  })
  api.getProduct('asdf', function (err, res) {
    t.equal(err.message, 'getProduct not found')
  })
})