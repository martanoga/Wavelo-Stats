angular.module('wavelo.stats.currentState', ['wavelo.stats.bikesDataService','uiGmapgoogle-maps'])
    .controller('currentStateCtrl', function ($scope, $http, $interval, BikesData) {
        $scope.map = { center: { latitude: 19.56, longitude: 50.4}, zoom: 12 };
        BikesData.getCurrentState()
            .then(function(data){
                for (var date in data)
                    $scope.current_data = data[date]['unavailable_bikes'];
            })  
    })