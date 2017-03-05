angular.module('myApp', ['nvd3'])
    .controller('myCtrl', function ($scope, $http) {

        $http.get('http://raw.githubusercontent.com/martanoga/Wavelo-Stats/master/website/data/wavelo_data_summary.yaml')
            .then(function (data) {
                if (data) {
                    bike_data = data['data'];
                    console.log(bike_data);
                }
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
                    tooltipHide: function (e) { console.log("tooltipHide"); }
                },
                xAxis: {
                    axisLabel: 'Date'
                },
                yAxis: {
                    axisLabel: 'Number of bikes',
                    tickFormat: function (d) {
                        return d3.format('.02f')(d);
                    },
                    axisLabelDistance: -10
                },
                callback: function (chart) {
                    console.log("!!! lineChart callback !!!");
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
                html: 'Statistics of bike usage and availability in the Wavelo bike network in Krakow, data gathered used REST api provided by socialbikes',
                css: {
                    'text-align': 'justify',
                    'margin': '10px 13px 0px 7px'
                }
            }
        };

        $scope.data = sinAndCos();

        /*Random Data Generator */
        function sinAndCos() {

            //Line chart data should be sent as an array of series objects.
            return [
                {
                    values: [{ x: 1, y: 12 }, { x: 2, y: 23 }, { x: 3, y: 51 }, { x: 4, y: 53 },
                    { x: 5, y: 41 }, { x: 6, y: 31 }, { x: 7, y: 43 }, { x: 8, y: 14 }, { x: 9, y: 43 }, { x: 10, y: 43 }],      //values - represents the array of {x,y} data points
                    key: 'Sine Wave', //key  - the name of the series.
                    color: '#ff7f0e',  //color - optional: choose your own line color.
                    area: true
                }
            ];
        };
    })