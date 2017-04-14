angular.module('wavelo.stats.weeklyStats', ['wavelo.stats.bikesDataService'])
    .controller('weeklyStatsCtrl', function ($scope, $http, $interval, BikesData, BikesChart) {
        moment.locale('pl');
        $scope.dailyStats = [];

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

        $scope.getDailyStats = function () {
            var monday = parseInt(moment($scope.displayedWeek, 'W').tz("Europe/Warsaw").startOf("isoWeek").format("DDD"));

            for (day in $scope.dailyStats) {
                if ($scope.dailyStats[day]) $scope.dailyStats[day].loading = true;
            }

            for (var i = 0; i < 7; i++) {
                BikesData.getDailyStatistics(monday + i)
                    .then((function (index, bike_data) {
                        if (!bike_data) {
                            $scope.dailyStats[index] = null;
                            return;
                        }

                        $scope.dailyStats[index] = {};
                        $scope.dailyStats[index].nameOfDay = moment(monday + index, "DDD").tz("Europe/Warsaw").format("dddd");
                        $scope.dailyStats[index].date = moment(monday + index, "DDD").tz("Europe/Warsaw").format("YYYY-MM-DD");
                        $scope.dailyStats[index].totalRentals = bike_data['total_rentals'];
                        $scope.dailyStats[index].totalReturns = bike_data['total_returns'];
                        $scope.dailyStats[index].loading = false;
                        $scope.dailyStats[index].weatherClass = "wi wi-" + bike_data['weather_icon'];
                        $scope.dailyStats[index].tempMin = bike_data['min_temp'];
                        $scope.dailyStats[index].tempMax = bike_data['max_temp'];

                    }).bind(null, i));
            }

        }

        $scope.updateData = function () {
            $scope.loading = true;
            $scope.chart.data = [];

            BikesData.getWeek($scope.displayedWeek)
                .then(function (bike_data) {

                    var chartData = BikesChart.prepareChartData(bike_data);

                    var ns = chartData.data.length;
                    var nd = chartData.data[0].values.length;
                    for (var s = 0; s < ns; s++)
                        nd = Math.min(nd, chartData.data[s].values.length);

                    var maxNoBikes = 0;
                    for (var d = 0; d < nd; d++) {
                        var y = 0;
                        for (var s = 0; s < ns; s++)
                            y += chartData.data[s].values[d].y;

                        maxNoBikes = Math.max(maxNoBikes, y);
                    }


                    $scope.chart.data = chartData['data'];
                    $scope.chart.options.chart.xAxis.tickValues = chartData['tickValues'];
                    $scope.chart.options.chart.yDomain1 = [0, Math.max(15, Math.floor(1.15 * maxNoBikes))];
                    $scope.loading = false;

                    if ($scope.currentWeek == $scope.displayedWeek) {
                        $scope.availableNow = chartData['availableNow'];
                        $scope.rentedNow = chartData['rentedNow'];
                        $scope.brokenNow = chartData['brokenNow'];
                    }

                });
        }

        $scope.changeWeek = function () {
            $scope.getDailyStats();
            $scope.updateData();
        }

        $scope.getDailyStats();
        $scope.updateData();
        $scope.intervalFunction = function () {
            $interval(function () {
                $scope.updateData();
            }, 10 * 60 * 1000)
        };

        $scope.intervalFunction();
    })