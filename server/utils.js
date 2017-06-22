var crypto = require('crypto')
var async = require('raco').wrap

var createHash = (str, salt) => crypto.pbkdf2Sync(str, salt, 4096, 64, 'SHA1').toString('base64')
var createSalt = () => crypto.randomBytes(18).toString('base64')

var PWD_REGEX = /^[a-zA-Z0-9]{8,}$/i
var isPassword = (pwd) => PWD_REGEX.test(pwd)

module.exports = {
  createHash,
  createSalt,
  isPassword,
  async
}