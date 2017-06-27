module.exports = [
  '$rootScope', '$cookies',
  function ($rootScope, $cookies) {
    return {
      request: function (config) {
        config.headers = config.headers || {};
        if (!$rootScope.access && $cookies.getObject('access')) {
          var access = $cookies.getObject('access')
          if (access && access.token) {
            $rootScope.access = access
          } else {
            $cookies.remove('access')
          }
        }
        if ($rootScope.access) {
          config.headers.Authorization = 'Bearer ' + $rootScope.access.token
        }
        return config;
      },
      responseError: function (error) {
        if (error && error.status === 401) {
          $rootScope.$broadcast('unauthorized')
        }
        return error;
      }
    }
  }
]