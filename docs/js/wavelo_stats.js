angular.module('myApp', ['nvd3', 'ngMaterial', 'ngMessages'])
    .controller('myCtrl', function ($scope, $http) {
        d3.select("svg g.nv-series-0").style("fill-opacity", 0.15);
        $http.get('https://krakowska-masa-krytyczna.github.io/Wavelo-Stats/data/wavelo_data_summary.yaml?timestamp=' + Date.now())
            .then(function (data) {
                if (!data)
                    return;

                bike_data = jsyaml.load(data['data']);

                allAvailableInHubsBikes = [];
                borrowedBikes = [];
                notInHubBikes = [];
                outsideOfArea = [];
                tickValues = [];
                allAvailableBikes = [];

                for (date in bike_data) {
                    allAvailableInHubsBikes.push({
                        x: bike_data[date]['timestamp'],
                        y: bike_data[date]['all_available_bikes_hubs'] != null ? bike_data[date]['all_available_bikes_hubs'] : bike_data[date]['all_available_bikes']
                    });

                    allAvailableBikes.push({
                        x: bike_data[date]['timestamp'],
                        y: bike_data[date]['all_available_bikes']
                    });

                    borrowedBikes.push({
                        x: bike_data[date]['timestamp'],
                        y: 300 - bike_data[date]['all_available_bikes']
                    });



                    var bikesOutside = bike_data[date]['all_outside_area'] != null ? bike_data[date]['all_outside_area'] : 0;
                    outsideOfArea.push({
                        x: bike_data[date]['timestamp'],
                        y: bikesOutside
                    });

                    notInHubBikes.push({
                        x: bike_data[date]['timestamp'],
                        y: bike_data[date]['all_not_in_hub'] != null ? bike_data[date]['all_not_in_hub'] - bikesOutside : 0
                    });

                    var d = new Date(bike_data[date]['timestamp'] * 1000);

                    hour = d.getHours();
                    minutes = d.getMinutes();

                    if (minutes < 10 && hour % 6 == 0)
                        tickValues.push(bike_data[date]['timestamp']);
                }

                $scope.data = [
                    {
                        values: borrowedBikes,      //values - represents the array of {x,y} data points
                        key: 'rented bikes', //key  - the name of the series.
                        color: '#ff7f0e',  //color - optional: choose your own line color.
                        type: "line",
                        yAxis: 1
                    },

                    {
                        values: allAvailableBikes,      //values - represents the array of {x,y} data points
                        key: 'all available bikes', //key  - the name of the series.
                        color: '#337099',  //color - optional: choose your own line color.
                        type: "line",
                        yAxis: 1
                    },
                    {
                        values: allAvailableInHubsBikes,      //values - represents the array of {x,y} data points
                        key: 'available in hubs', //key  - the name of the series.
                        color: '#b3d1e6',  //color - optional: choose your own line color.
                        type: "area",
                        yAxis: 1
                    },
                    {
                        values: notInHubBikes,      //values - represents the array of {x,y} data points
                        key: 'out of hub inside the area', //key  - the name of the series.
                        color: '#62a0ca',  //color - optional: choose your own line color.
                        type: "area",
                        yAxis: 1
                    },

                    {
                        values: outsideOfArea,      //values - represents the array of {x,y} data points
                        key: 'out of the network area', //key  - the name of the series.
                        color: '#19384d',  //color - optional: choose your own line color.
                        type: "area",
                        yAxis: 1
                    }


                ];

                keys = Object.keys(bike_data);
                last_key = keys[keys.length - 1];

                $scope.availableNow = bike_data[last_key]['all_available_bikes']
                $scope.rentedNow = 300 - bike_data[last_key]['all_available_bikes']

                $scope.options.chart.xAxis.tickValues = tickValues;

            });

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
                // x: function (d) { return d.x; },
                // y: function (d) { return d.y; },
                useInteractiveGuideline: true,
                dispatch: {
                    stateChange: function (e) { console.log("stateChange"); },
                    changeState: function (e) { console.log("changeState"); },
                    tooltipShow: function (e) { console.log("tooltipShow"); },
                    tooltipHide: function (e) { console.log("tooltipHide"); },
                    renderEnd: function (e) { d3.select("svg g.nv-series-0").style("fill-opacity", 0.15); console.log('renderEnd') }
                },
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
                yDomain1: [0, 400],
                callback: function (chart) {
                    d3.select("svg g.nv-series-0").style("fill-opacity", 0.25);
                }
            },
            // title: {
            //     enable: true,
            //     html: '<div class="graph_title">Wavelo Statistics</div>'
            // },
            // subtitle: {
            //     enable: true,
            //     text: 'Subtitle for simple line chart. Lorem ipsum dolor sit amet, at eam blandit sadipscing, vim adhuc sanctus disputando ex, cu usu affert alienum urbanitas.',
            //     css: {
            //         'text-align': 'center',
            //         'margin': '10px 13px 0px 7px'
            //     }
            // },
            caption: {
                enable: true,
                html: '<div class="graph_caption">Statistics of bike usage and availability in the <a href="https://wavelo.pl">Wavelo</a> bike network in Krakow. Data collected using <a href="https://app.socialbicycles.com/developer/">api</a> provided by <a href="http://socialbicycles.com">socialbikes</a>.</div>'
            }
        };

    })
    .controller('AppCtrl', function ($scope) { });