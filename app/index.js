var fs = require('fs') // for browserify load templates
var xtend = require('xtend')
var angular = global.angular
var app = angular.module('app', ['ngResource', 'ngRoute'])

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  $locationProvider.hashPrefix('')
  $routeProvider
    .when('/', {
      template: fs.readFileSync(__dirname + '/app/templates/dashboard.html', 'utf8'),
      controller: 'dashboardCtrl'
    })
    .when('/login', {
      template: fs.readFileSync(__dirname + '/app/templates/login.html', 'utf8'),
      controller: 'loginCtrl'
    })
    .when('/signup', {
      template: fs.readFileSync(__dirname + '/app/templates/signup.html', 'utf8'),
      controller: 'signupCtrl'
    })
    .when('/project/:project_id', {
      template: fs.readFileSync(__dirname + '/app/templates/project.html', 'utf8'),
      controller: 'projectCtrl'
    })
    .otherwise({
      redirectTo: '/login'
    })
}])