angular.module('wavelo.stats.home', ['wavelo.stats.bikesDataService'])
    .controller('homeCtrl', function ($scope, $http, BikesData) {
        moment.locale('pl');

        $scope.getNews = function () {
            BikesData.getNews().then(function (news) {
                $scope.news = [];
                for (var i = 0; i < news.length; ++i) {
                    var n = news[i];
                    $scope.news.push({
                        'date': n.date.toISOString().substring(0, 10),
                        'title': n.title,
                        'author': n.author,
                        'text': n.text
                    });
                }
            });
        }

        $scope.getNews();
    })
    .filter("trust", ['$sce', function ($sce) {
        return function (htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        }
    }]);