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

test('Add Review', function (t) {
  t.plan(6)
  api.addReview('asdf', 12, 'foo bar', 5, function (err) {
    t.equal(err.message, 'getUser not found', 'review validation')
  })
  api.addReview(3, 'asdf', 'foo bar', 5, function (err) {
    t.equal(err.message, 'getProduct not found', 'review validation')
  })
  api.addReview(3, 'asdf', 'foo bar', 167, function (err) {
    t.equal(err.message, 'Invalid rating.', 'review validation')
  })
  api.addReview(3, 12, 'foo bar', 5, function (err) {
    t.notOk(err)
    api.getProduct(12, function (err, res) {
      t.notOk(err)
      t.equal(res.last_review_comment, 'foo bar', 'Last review comment.')
    })
  })
})

test('Close', function (t) {
  api.close()
  t.end()
})
