module.exports = [
  '$rootScope', '$http', '$cookies',
  function ($rootScope, $http, $cookies) {
    var status = ['new', 'pending', 'expired', 'finished']

    function get (id) {
      return handler(function () {
        return $http({
          method: 'GET',
          url: $rootScope.rootUrl + '/api/projects/' + id
        })
      })
    }
    function list () {
      return handler(function () {
        return $http({
          method: 'GET',
          url: $rootScope.rootUrl + '/api/projects'
        })
      })
    }
    function save (body) {
      return handler(function () {
        if (body._id) {
          return $http({
            method: 'PUT',
            url: $rootScope.rootUrl + '/api/projects/' + body._id,
            data: body
          })
        } else {
          return $http({
            method: 'POST',
            url: $rootScope.rootUrl + '/api/projects',
            data: body
          })
        }
      })
    }

    function handler (fn) {
      // auth response handler
      return fn().then(function (result) {
        if (result && result.data && !result.data.error) {
          return result.data
        } else {
          throw result
        }
      })
      .catch(function (err) {
        throw (err && err.data) || err || new Error('Project failed')
      })
    }

    return {
      list: list,
      get: get,
      save: save,
      status: status
    }
  }
]