angular.module('myApp', [
    'nvd3',
    'ngMaterial',
    'ngMessages',
    'wavelo.stats.bikesDataService',
    'wavelo.stats.weeklyStats',
    'wavelo.stats.currentState',
    'ui.router'
])
    .config(function ($mdThemingProvider, $stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('weeklyStats', {
                url: '/',
                templateUrl: 'js/templates/weeklyStats.html',
                controller: 'weeklyStatsCtrl',
            })
            .state('currentState', {
                url: '/current',
                templateUrl: 'js/templates/currentState.html',
                controller: 'currentStateCtrl',
            })

        $mdThemingProvider.theme('default')
            .primaryPalette('blue-grey')
            .accentPalette('blue');


    });