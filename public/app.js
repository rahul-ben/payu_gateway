var app = angular.module('app', ['ui.router'])
    .config(['$urlRouterProvider','$stateProvider', '$httpProvider',
        function($urlRouterProvider, $stateProvider, $httpProvider) {
            $urlRouterProvider.otherwise('/dashboard');
            $stateProvider
                .state('main', {
                    abstract: true,
                    templateUrl: 'views/base.html'
                })
                .state('login', {
                    url: '/login',
                    templateUrl: 'views/login.html'
                })
                .state('dashboard', {
                    url: '/dashboard?query',
                    templateUrl: 'views/dashboard.html',
                    controller: 'dashboardController'
                })
        }]);


