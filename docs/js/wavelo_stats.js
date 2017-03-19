angular.module('myApp', ['nvd3', 'ngMaterial', 'ngMessages', 'wavelo.stats.bikesDataService'])
    .controller('myCtrl', function ($scope, $http, $interval, BikesData, BikesChart) {

        $scope.chart = {};
        $scope.chart.options = BikesChart.setUpChart();
        $scope.chart.options.chart.lines1.dispatch.renderEnd =  function (e) {
                            $scope.$apply(function () {
                                $scope.loading = false;
                            });
                        }

        var firstWeek = 9;
        $scope.weeks = [];
        $scope.currentWeek = parseInt(moment().tz("Europe/Warsaw").format("W"));
        $scope.displayedWeek = $scope.currentWeek;


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

        $http.get('https://martanoga.github.io/Wavelo-Stats/data/wavelo_summary.yaml?timestamp=' + Date.now())
            .then(function (data) {
                if (!data)
                    return;

                bike_data = jsyaml.load(data['data']);

                $scope.totalRentals = bike_data['total_rentals'];
                $scope.totalReturns = bike_data['total_returns'];
                // $scope.from = bike_data['t0'];
            });



        $scope.intervalFunction = function () {
            $interval(function () {
                $scope.updateData();
            }, 10 * 60 * 1000)
        };

        $scope.intervalFunction();

    })