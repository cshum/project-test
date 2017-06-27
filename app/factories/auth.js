module.exports = [
  '$rootScope', '$http', '$cookies',
  function ($rootScope, $http, $cookies) {
    function login (params) {
      return handler(function () {
        return $http({
          method: 'POST',
          url: $rootScope.rootUrl + '/api/login',
          data: params
        })
      })
    }

    function signup (body) {
      return handler(function () {
        return $http({
          method: 'POST',
          url: $rootScope.rootUrl + '/api/signup',
          data: body
        })
      })
    }

    function handler (fn) {
      // auth response handler
      return fn().then(function (result) {
        var access = result && result.data
        if (access && access.token && !access.error) {
          $rootScope.access = access
          $cookies.putObject('access', access)
          $rootScope.$broadcast('authorized')
        } else {
          throw result
        }
      })
      .catch(function (err) {
        throw (err && err.data) || err || new Error('Auth failed')
      })
    }

    function logout () {
      $rootScope.access = null
      $cookies.remove('access')
      $rootScope.$broadcast('unauthorized')
    }

    return {
      login: login,
      signup: signup,
      logout: logout
    }
  }
]