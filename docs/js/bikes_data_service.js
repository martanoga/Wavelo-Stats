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

                        var bike_data = jsyaml.load(data['data']);

                        return bike_data;

                    }, function (response) {




                        return null;//toReturn;
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
                            week_data[monday + parseInt(day_data)] = results[day_data];
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
            prepareChartData: function (week_data) {

                var allAvailableInHubsBikes = [];
                var borrowedBikes = [];
                var notInHubBikes = [];
                var outsideOfArea = [];
                var unavailableBikes = [];
                var tickValues = [];
                var allAvailableBikes = [];
                var availableNow = null;

                for (var day in week_data) {
                    var day_data = week_data[day];
                    var timestamp = parseFloat(moment(day + ' 00:00', 'DDD HH:mm').tz("Europe/Warsaw").format('X'));
                    tickValues.push(timestamp);
                    
                    if (day_data == null) {
                        toAdd = [0, 23 * 60 * 60 + 50 * 60];
                        for (var dayPoint = 0; dayPoint < toAdd.length; dayPoint++) {

                            var point = {
                                x: timestamp + toAdd[dayPoint],
                                y: null
                            }

                            allAvailableInHubsBikes.push(point);
                            allAvailableBikes.push(point);
                            borrowedBikes.push(point);
                            unavailableBikes.push(point);
                            outsideOfArea.push(point);
                            notInHubBikes.push(point);

                        }
                        continue;
                    }
                    
                    for (date in day_data) {

                        allAvailableInHubsBikes.push({
                            x: day_data[date]['timestamp'],
                            y: day_data[date]['all_available_bikes_hubs'] != null ? day_data[date]['all_available_bikes_hubs'] : day_data[date]['all_available_bikes']
                        });

                        allAvailableBikes.push({
                            x: day_data[date]['timestamp'],
                            y: day_data[date]['all_available_bikes']
                        });

                        borrowedBikes.push({
                            x: day_data[date]['timestamp'],
                            y: day_data[date]['all_rented_bikes'] != null ? day_data[date]['all_rented_bikes'] : 300 - day_data[date]['all_available_bikes']
                        });

                        unavailableBikes.push({
                            x: day_data[date]['timestamp'],
                            y: day_data[date]['all_repair_state_not_working'] != null ? day_data[date]['all_repair_state_not_working'] : null
                        });


                        var bikesOutside = day_data[date]['all_outside_area'] != null ? day_data[date]['all_outside_area'] : 0;
                        outsideOfArea.push({
                            x: day_data[date]['timestamp'],
                            y: bikesOutside
                        });

                        notInHubBikes.push({
                            x: day_data[date]['timestamp'],
                            y: day_data[date]['all_not_in_hub'] != null ? day_data[date]['all_not_in_hub'] - bikesOutside : 0
                        });
                    }

                    var today = parseInt(moment().tz("Europe/Warsaw").format("DDD"));

                    if (today == day) {
                        keys = Object.keys(day_data);
                        last_key = keys[keys.length - 1];

                        availableNow = day_data[last_key]['all_available_bikes'];

                        var point = {
                            x: parseFloat(moment(today + ' 23:50', 'DDD HH:mm').tz("Europe/Warsaw").format('X')),
                            y: null
                        }

                        allAvailableInHubsBikes.push(point);
                        allAvailableBikes.push(point);
                        borrowedBikes.push(point);
                        unavailableBikes.push(point);
                        outsideOfArea.push(point);
                        notInHubBikes.push(point);
                    }

                }



                var data = [
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