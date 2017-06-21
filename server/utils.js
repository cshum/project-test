var async = require('raco')
var crypto = require('crypto')

var createHash = (str, salt) => crypto.pbkdf2Sync(str, salt, 4096, 64, 'SHA1').toString('base64')
var createSalt = () => crypto.randomBytes(18).toString('base64')

module.exports = {
  createHash,
  createSalt
}