module.exports = [
  '$rootScope', '$scope', 'Auth',
  function ($rootScope, $scope, Auth) {
    $scope.error = null
    $scope.form = {}
    $scope.login = function () {
      return Auth.login($scope.form)
      .catch(function (err) {
        $scope.error = err
      })
    }
  }
]