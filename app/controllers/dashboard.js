module.exports = [
  '$scope', '$state', 'projects',
  function ($scope, $state, projects) {
    $scope.list = projects
  }
]
