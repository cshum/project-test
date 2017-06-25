module.exports = [
  '$rootScope', '$q', '$window', '$location',
  function ($rootScope, $q, $window, $location) {
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
      responseError: function (error) {
        if (error && error.status === 401) {
          $rootScope.$broadcast('unauthorized')
        }
        return error;
      }
    }
  }
]