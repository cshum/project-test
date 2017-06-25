module.exports = [
  '$rootScope', '$scope', '$timeout', '$http', '$window',
  function ($rootScope, $scope, $timeout, $http, $window) {
    $scope.error = null
    $scope.login = function () {
      $http({
        method: "POST",
        url: "/api/login",
        data: {
          email: $scope.email,
          password: $scope.password
        }
      })
      .then(function (result) {
        var access = result && result.data
        if (access && access.token && !access.error) {
          $rootScope.access = access
          $window.localStorage.setItem('access', JSON.stringify(access))
        } else {
          throw result
        }
      })
      .catch(function (err) {
        $scope.error = err && err.data
      })
    }
  }
]