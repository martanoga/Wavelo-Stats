angular.module('wavelo.stats.currentState', ['wavelo.stats.bikesDataService','uiGmapgoogle-maps'])
    .controller('currentStateCtrl', function ($scope, $http, $interval, BikesData) {
        $scope.map = { center: { latitude: 50.0469018, longitude: 19.9247884}, zoom: 12 };
        BikesData.getCurrentState()
            .then(function(data){
                for (var date in data)
                    $scope.current_data = data[date]['unavailable_bikes'];
            })  
    })