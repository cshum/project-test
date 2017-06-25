module.exports = [
  '$rootScope', '$q', '$window',
  function ($rootScope, $q, $window) {
    return {
      request: function (config) {
        config.headers = config.headers || {};
        if (!$rootScope.access && $window.localStorage.getItem('access')) {
          var access
          try {
            access = JSON.parse($window.localStorage.getItem('access'))
          } catch (e) {}
          if (access && access.token) {
            $rootScope.access = access
          } else {
            $window.localStorage.removeItem('access')
          }
        }
        if ($rootScope.access) {
          config.headers.Authorization = 'Bearer ' + $rootScope.access.token
        }
        return config;
      },
      responseError: function(error) {
        return error;
      }
    }
  }
]