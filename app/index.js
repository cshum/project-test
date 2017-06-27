var angular = global.angular
var app = angular.module('app', [
  'ui.router', 'ngCookies',
  'ngAnimate', 'mgcrea.ngStrap'
])
var fs = require('fs') // for browserify load templates

// Factories
app.factory('HttpInterceptor', require('./factories/httpinterceptor'))
app.factory('Auth', require('./factories/auth'))
app.factory('Project', require('./factories/project'))

// Controllers
app.controller('dashboardCtrl', require('./controllers/dashboard'))
app.controller('loginCtrl', require('./controllers/login'))
app.controller('signupCtrl', require('./controllers/signup'))
app.controller('projectCtrl', require('./controllers/project'))

app.config([
  '$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
  function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $stateProvider.state('login', {
      url: '/login',
      template: fs.readFileSync(__dirname + '/app/templates/login.html', 'utf8'),
      controller: 'loginCtrl'
    })
    $stateProvider.state('signup', {
      url: '/signup',
      template: fs.readFileSync(__dirname + '/app/templates/signup.html', 'utf8'),
      controller: 'signupCtrl'
    })
    $stateProvider.state('dashboard', {
      url: '/',
      template: fs.readFileSync(__dirname + '/app/templates/dashboard.html', 'utf8'),
      controller: 'dashboardCtrl',
      resolve: {
        projects: ['Project', function (Project) {
          return Project.list() 
        }]
      }
    })
    $stateProvider.state('project', {
      url: '/projects/:project_id',
      template: fs.readFileSync(__dirname + '/app/templates/project.html', 'utf8'),
      controller: 'projectCtrl',
      resolve: {
        project: ['Project', '$stateParams', function (Project, $stateParams) {
          return Project.get($stateParams.project_id)
        }]
      }
    })
    $stateProvider.state('create', {
      url: '/projects/create',
      template: fs.readFileSync(__dirname + '/app/templates/project.html', 'utf8'),
      controller: 'projectCtrl',
      resolve: {
        project: function () {
          return null
        }
      }
    })

    $urlRouterProvider.otherwise('/')

    $locationProvider.hashPrefix('')
    $httpProvider.interceptors.push('HttpInterceptor')
  }
])
app.run([
  '$location', '$rootScope', '$state', 'Auth',
  function ($location, $rootScope, $state, Auth) {
    $rootScope.$state = $state
    $rootScope.rootUrl = '' // todo move to config
    angular.extend($rootScope, Auth)

    // redirect to login on unauthorized
    $rootScope.$on('unauthorized', function () {
      $location.path('/login')
    })
    // redirect to dashboard on authorized
    $rootScope.$on('authorized', function () {
      $location.path('/')
    })
  }
])
