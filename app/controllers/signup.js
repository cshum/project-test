module.exports = [
  '$rootScope', '$scope', 'Auth',
  function ($rootScope, $scope, Auth) {
    $scope.error = null
    $scope.form = {}
    $scope.signup = function () {
      return Auth.signup($scope.form)
      .catch(function (err) {
        $scope.error = err
      })
    }
  }
]
