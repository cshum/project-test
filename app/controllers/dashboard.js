module.exports = [
  '$scope', '$timeout', '$http', '$routeParams',
  function ($scope, $timeout, $http, $routeParams) {
      $http({
        method: "GET",
        url: "/api/projects"
      })
  }
]