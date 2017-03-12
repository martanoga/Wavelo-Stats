angular.module('myApp', ['nvd3', 'ngMaterial', 'ngMessages', 'wavelo.stats.bikesDataService'])
    .controller('myCtrl', function ($scope, $http, BikesData, BikesChart) {
        d3.select("svg g.nv-series-0").style("fill-opacity", 0.15);

        var firstWeek = 9;
        $scope.weeks = [];
        $scope.currentWeek = parseInt(moment().tz("Europe/Warsaw").format("W"));

        for (week = firstWeek; week <= $scope.currentWeek; week++) {
            var monday = moment(week, 'W').tz("Europe/Warsaw").startOf("isoWeek").format("YYYY-MM-DD");
            var sunday = moment(week, 'W').tz("Europe/Warsaw").endOf("isoWeek").format("YYYY-MM-DD");

            var description = monday + " - " + sunday;
            $scope.weeks.push({
                description: description,
                value: week
            })
        }




        $scope.updateData = function (week) {
            $scope.loading = true;
            BikesData.getWeek($scope.currentWeek)
                .then(function (bike_data) {

                    var data = BikesChart.prepareChartData(bike_data);

                    $scope.data = data['data'];
                    $scope.options.chart.xAxis.tickValues = data['tickValues'];

                    keys = Object.keys(bike_data);
                    last_key = keys[keys.length - 1];

                    $scope.availableNow = data['availableNow'];
                    $scope.rentedNow = 300 - data['availableNow'];

                });
        }

        $scope.updateData($scope.currentWeek);

        $http.get('https://martanoga.github.io/Wavelo-Stats/data/wavelo_summary.yaml?timestamp=' + Date.now())
            .then(function (data) {
                if (!data)
                    return;

                bike_data = jsyaml.load(data['data']);

                $scope.totalRentals = bike_data['total_rentals'];
                $scope.totalReturns = bike_data['total_returns'];
                $scope.from = bike_data['t0'];
            });

        $scope.options = {
            chart: {
                type: 'multiChart',
                height: 450,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 55
                },
                useInteractiveGuideline: true,
                visible: true,
                xAxis: {
                    axisLabel: 'Date',
                    tickFormat: function (d) {
                        var date = new Date(d * 1000);

                        hour = date.getHours();
                        minutes = date.getMinutes();

                        if (hour == 0 && minutes < 10)
                            var format = d3.time.format("%Y-%m-%d");
                        else
                            var format = d3.time.format("%H:%M");

                        return format(date);
                    }

                },
                yAxis1: {
                    axisLabel: 'Number of bikes',
                    axisLabelDistance: -5
                },
                lines1: {
                    dispatch: {
                        renderEnd: function (e) {
                            $scope.$apply(function () {
                                $scope.loading = false;
                            });
                        }
                    }
                },
                // callback: function (chart, e) {
                //     console.log("callback");
                // },
                yDomain1: [0, 400]
                
            }
        };

    })