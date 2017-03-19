angular.module('myApp', ['nvd3', 'ngMaterial', 'ngMessages', 'wavelo.stats.bikesDataService'])
    .controller('myCtrl', function ($scope, $http, $interval, BikesData, BikesChart) {
        moment.locale('pl');
        
        $scope.chart = {};
        $scope.chart.options = BikesChart.setUpChart();

        var firstWeek = 9;
        $scope.weeks = [];
        $scope.currentWeek = parseInt(moment().tz("Europe/Warsaw").format("W"));
        $scope.displayedWeek = $scope.currentWeek;
        $scope.today = parseInt(moment().tz("Europe/Warsaw").format("DDD"));


        for (week = firstWeek; week <= $scope.currentWeek; week++) {
            var monday = moment(week, 'W').tz("Europe/Warsaw").startOf("isoWeek").format("YYYY-MM-DD");
            var sunday = moment(week, 'W').tz("Europe/Warsaw").endOf("isoWeek").format("YYYY-MM-DD");
            var description = monday + " - " + sunday;

            $scope.weeks.push({
                description: description,
                value: week
            })
        }

        $scope.updateData = function () {
            $scope.loading = true;
            BikesData.getWeek($scope.displayedWeek)
                .then(function (bike_data) {

                    var chartData = BikesChart.prepareChartData(bike_data);
                    $scope.chart.data = chartData['data'];
                    $scope.chart.options.chart.xAxis.tickValues = chartData['tickValues'];
                    $scope.loading = false;
                    $scope.availableNow = chartData['availableNow'];
                    $scope.rentedNow = chartData['rentedNow'];

                });
        }

        $scope.updateData();

        $scope.dailyStats = [];
        var monday = parseInt(moment($scope.displayedWeek, 'W').tz("Europe/Warsaw").startOf("isoWeek").format("DDD"));
        for (var i = 0; i < 7; i++) {
            BikesData.getDailyStatistics(monday + i)
                .then((function (index, bike_data) {
                    if (!bike_data) {
                        return;
                    }    
                    if (!$scope.dailyStats[index]){
                        $scope.dailyStats[index] = {};
                    }                
                    
                    $scope.dailyStats[index].nameOfDay = moment(monday+index, "DDD").tz("Europe/Warsaw").format("dddd");

                    $scope.dailyStats[index].totalRentals = bike_data['total_rentals'];
                    $scope.dailyStats[index].totalReturns = bike_data['total_returns'];
                    
                }).bind(null, i));
        }


        $scope.intervalFunction = function () {
            $interval(function () {
                $scope.updateData();
            }, 10 * 60 * 1000)
        };

        $scope.intervalFunction();

    })