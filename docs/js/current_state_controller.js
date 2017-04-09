angular.module('wavelo.stats.currentState', ['wavelo.stats.bikesDataService'])
    .controller('currentStateCtrl', function ($scope, $http, $interval, BikesData) {
        BikesData.getCurrentState()
            .then(function(data){
                for (var date in data)
                    $scope.current_data = data[date]['unavailable_bikes'];
            })  
    })