angular.module('wavelo.stats.bikesDataService', ['angularMoment'])
    .factory('BikesData', function ($http, $q) {
        var serverUrl = 'https://krakowska-masa-krytyczna.github.io/Wavelo-Stats/data/';
        return {
            getSingleDay: function (dayOfYear) {

                datePart = moment(dayOfYear, 'DDD').tz("Europe/Warsaw").format("YYYY-MM-DD");
                url = serverUrl + '/split_data/wavelo_data_summary-' + datePart + '.yaml?timestamp=' + Date.now();
                return $http({
                    method: 'GET',
                    url: url
                })
                    .then(function (data) {
                        if (!data)
                            return Null;

                        return jsyaml.load(data['data']);
                    }, function(response){
                        return null;
                    })

            },
            getWeek: function (weekNumber) {

                var deferred = $q.defer();
                promises = [];

                var monday = parseInt(moment(weekNumber, 'W').tz("Europe/Warsaw").startOf("isoWeek").format("DDD"));
                for (i = 0; i < 7; i++) {
                    promises.push(this.getSingleDay(monday + i));
                }

                return $q.all(promises)
                    .then(function (results) {
                        deferred.resolve(results);
                        var week_data = {};
                        for (day_data in results) {
                            if (results[day_data]) {
                                angular.extend(week_data, results[day_data]);
                            }
                        }
                        return week_data;
                    },
                    function (errors) {
                        deferred.reject(errors);
                    })
            }
        }
    })
    .factory('BikesChart', function () {
        return {
            prepareChartData: function (bike_data) {
                allAvailableInHubsBikes = [];
                borrowedBikes = [];
                notInHubBikes = [];
                outsideOfArea = [];
                unavailableBikes = [];
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
                        y: bike_data[date]['all_rented_bikes'] != null ? bike_data[date]['all_rented_bikes'] : 300 - bike_data[date]['all_available_bikes']
                    });

                    unavailableBikes.push({
                        x: bike_data[date]['timestamp'],
                        y: bike_data[date]['all_repair_state_not_working'] != null ? bike_data[date]['all_repair_state_not_working'] : null
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

                    if (minutes < 10 && hour == 0)
                        tickValues.push(bike_data[date]['timestamp']);
                }

                keys = Object.keys(bike_data);
                last_key = keys[keys.length - 1];

                var availableNow = bike_data[last_key]['all_available_bikes'];

                var data =  [
                    {
                        values: borrowedBikes,      //values - represents the array of {x,y} data points
                        key: 'rowery wypożyczone', //key  - the name of the series.
                        color: '#ff7f0e',  //color - optional: choose your own line color.
                        type: "line",
                        yAxis: 1
                    },

                    {
                        values: allAvailableBikes,      //values - represents the array of {x,y} data points
                        key: 'wszystkie dostępne rowery', //key  - the name of the series.
                        color: '#337099',  //color - optional: choose your own line color.
                        type: "line",
                        yAxis: 1
                    },
                    {
                        values: allAvailableInHubsBikes,      //values - represents the array of {x,y} data points
                        key: 'dostępne na stacjach', //key  - the name of the series.
                        color: '#b3d1e6',  //color - optional: choose your own line color.
                        type: "area",
                        yAxis: 1
                    },
                    {
                        values: notInHubBikes,      //values - represents the array of {x,y} data points
                        key: 'poza stacjami, w obszarze systemu', //key  - the name of the series.
                        color: '#62a0ca',  //color - optional: choose your own line color.
                        type: "area",
                        yAxis: 1
                    },

                    {
                        values: outsideOfArea,      //values - represents the array of {x,y} data points
                        key: 'poza obszarem systemu', //key  - the name of the series.
                        color: '#19384d',  //color - optional: choose your own line color.
                        type: "area",
                        yAxis: 1
                    },

                    {
                        values: unavailableBikes,      //values - represents the array of {x,y} data points
                        key: 'uszkodzone', //key  - the name of the series.
                        color: '#b20c0e',  //color - optional: choose your own line color.
                        type: "area",
                        yAxis: 1
                    }


                ];

                return {
                    data: data, 
                    tickValues: tickValues,
                    availableNow: availableNow
                }
                
            },
            drawChart: function (chartData) {
                return;
            }
        }
    })