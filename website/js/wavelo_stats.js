angular.module('myApp', ['nvd3'])
    .controller('myCtrl', function ($scope, $http) {
        d3.select("svg g.nv-series-0").style("fill-opacity", 0.15); 
        $http.get('https://martanoga.github.io/Wavelo-Stats/data/wavelo_data_summary.yaml?timestamp=' + Date.now())
            .then(function (data) {
                if (!data)
                    return;

                bike_data = jsyaml.load(data['data']);

                allAvailableBikes = [];
                borrowedBikes = [];
                tickValues = [];
                for (date in bike_data) {
                    allAvailableBikes.push({
                        x: bike_data[date]['timestamp'],
                        y: bike_data[date]['all_available_bikes']
                    });

                    borrowedBikes.push({
                        x: bike_data[date]['timestamp'],
                        y: 300 - bike_data[date]['all_available_bikes']
                    });

                    var d = new Date(bike_data[date]['timestamp']*1000);

                        hour = d.getHours();
                        minutes = d.getMinutes();

                        if (minutes < 10 && hour%6 == 0)
                            tickValues.push(bike_data[date]['timestamp']);
                }

                console.log(allAvailableBikes);
                $scope.data = [
                    {
                        values: allAvailableBikes,      //values - represents the array of {x,y} data points
                        key: 'All available bikes', //key  - the name of the series.
                        // color: '#ff7f0e',  //color - optional: choose your own line color.
                        area: true
                    },
                                        {
                        values: borrowedBikes,      //values - represents the array of {x,y} data points
                        key: 'Rented bikes', //key  - the name of the series.
                        color: '#ff7f0e',  //color - optional: choose your own line color.
                        area: false
                    }

                ];
                $scope.options.chart.xAxis.tickValues = tickValues;
                
            });


        $scope.options = {
            chart: {
                type: 'lineChart',
                height: 450,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 55
                },
                x: function (d) { return d.x; },
                y: function (d) { return d.y; },
                useInteractiveGuideline: true,
                dispatch: {
                    stateChange: function (e) { console.log("stateChange"); },
                    changeState: function (e) { console.log("changeState"); },
                    tooltipShow: function (e) { console.log("tooltipShow"); },
                    tooltipHide: function (e) { console.log("tooltipHide"); },
                    renderEnd: function(e){ d3.select("svg g.nv-series-0").style("fill-opacity", 0.15); console.log('renderEnd') }
                },
                xAxis: {
                    axisLabel: 'Date',
                    tickFormat: function(d){
                        var date = new Date(d*1000);

                        hour = date.getHours();
                        minutes = date.getMinutes();

                        if (hour == 0 && minutes < 10)
                            var format = d3.time.format("%Y-%m-%d");
                        else
                            var format = d3.time.format("%H:%M");

                        return format(date);
                    }
                    
                },
                yAxis: {
                    axisLabel: 'Number of bikes',
                    axisLabelDistance: -5
                },
                yDomain: [0, 400],
                callback: function (chart) {
                    d3.select("svg g.nv-series-0").style("fill-opacity", 0.25);
                }
            },
            title: {
                enable: true,
                text: 'Wavelo Statistics'
            },
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
                html: 'Statistics of bike usage and availability in the <a href="https://wavelo.pl">Wavelo</a> bike network in Krakow. Data collected using <a href="https://app.socialbicycles.com/developer/">api</a> provided by <a href="http://socialbicycles.com">socialbikes</a>',
                css: {
                    'text-align': 'justify',
                    'margin': '10px 13px 0px 7px'
                }
            }
        };

    })