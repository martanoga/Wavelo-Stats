angular.module('wavelo.stats.currentState', ['wavelo.stats.bikesDataService',
// 'uiGmapgoogle-maps',
'ngMap'
])
    .controller('currentStateCtrl', function ($scope, $http, $interval, BikesData, NgMap) {
        $scope.map = { center: { latitude: 50.0569018, longitude: 19.9247884}, zoom: 13 };
        BikesData.getCurrentState()
            .then(function(data){
                for (var date in data)
                    $scope.current_data = data[date]['unavailable_bikes'];
            })  
    })