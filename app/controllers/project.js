module.exports = [
  '$scope', '$state', '$alert', 'Project', 'project',
  function ($scope, $state, $alert, Project, project) {
    $scope.isNew = !project
    $scope.project = project || {
      status: 'new'
    }
    $scope.status = Project.status
    $scope.error = null
    $scope.message = null
    $scope.submit = function () {
      return Project.save($scope.project)
      .then(function (result) {
        $scope.project = result
        $alert({
          title: '',
          content: 'Project successfully ' + ($scope.isNew ? 'created':'updated'),
          placement: 'top', type: 'info', show: true,
          container: '#alerts'
        })
        if ($scope.isNew) $state.go('dashboard')
      })
      .catch(function (err) {
        $scope.error = err
        $scope.message = null
      })
    }
  }
]