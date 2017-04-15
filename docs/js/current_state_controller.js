angular.module('wavelo.stats.currentState', ['wavelo.stats.bikesDataService',
    // 'uiGmapgoogle-maps',
    'ngMap',

])
    .controller('currentStateCtrl', function ($scope, $http, $interval, BikesData, NgMap) {
        $scope.map_data = { center: { latitude: 50.0569018, longitude: 19.9247884 }, zoom: 13 };
        NgMap.getMap().then(function (map) {
            console.log('map', map);
            $scope.map = map;
        });

        BikesData.getCurrentState()
            .then(function (data) {
                for (var date in data)
                    $scope.current_data = data[date]['unavailable_bikes'];
            })
        $scope.showDetail = function (event, bike) {
            $scope.bike = bike;
            $scope.map.showInfoWindow('foo-iw',"m" + bike.id);
            
        };
        $scope.hideDetail = function () {
            $scope.map.hideInfoWindow('foo-iw');
        };
    })