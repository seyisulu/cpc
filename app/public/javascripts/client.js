(function () {
  'use strict';

  var cpc = angular.module('cpc', ['ngRoute', 'ngResource']),
      URLS = { APIBase: '/api/v1', cityBase: '/city', weatherBase: '/weather' },
      geoSvc = ['$window', '$q',
      function geoSvc($window, $q) {
      	return {
          geoLocate: function geoLocate() {
            var deferred = $q.defer(),
                opts = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
                geoPos = function geoPos(pos){
              		deferred.resolve({ lng: pos.coords.longitude, lat: pos.coords.latitude });
              	},
                geoErr = function geoErr(err){
              		deferred.reject(err);
              	};// Handling case of unsupported browsers
          	if ($window.navigator && $window.navigator.geolocation) {
          		$window.navigator.geolocation.getCurrentPosition(geoPos, geoErr, opts);
          	} else {
          		deferred.reject(false);
          	}
          	return deferred.promise;
          }
        };
      }],
      citySvc = ['$resource', '$window', 'URLS',
      function citySvc($resource, $window, URLS) {
        return {
          getNearestCities: function getNearestCities(pos) {
            return $resource(URLS.APIBase + URLS.cityBase + '/' + pos.lng + '/' + pos.lat).query();
          },
          getMatchingCities: function getMatchingCities(qry) {
            return $resource(URLS.APIBase + URLS.cityBase + '/' + $window.encodeURIComponent(qry)).query();
          }
        };
      }],
      cityCtrl = ['$scope', '$rootScope', 'citySvc',
      function cityCtrl($scope, $rootScope, citySvc) {
        $scope.city = '';
        $scope.cities = [];
        $scope.findCities = function findCities() {
          citySvc.getMatchingCities($scope.city).$promise
          .then(function getMatchingCitiesCb(cities) {
            console.log(cities);
            $scope.cities = cities;
          });
        };
      }],
      weatherSvc = ['$resource', '$q', 'URLS',
      function weatherSvc($resource, $q, URLS) {
        return {
          getWeather: function getWeather(id) {
            return $resource(URLS.APIBase + URLS.weatherBase + URLS.cityBase + '/' + id).get();
          }
        };
      }],
      weatherCtrl = ['$scope', '$rootScope', '$routeParams', 'weatherSvc',
      function weatherCtrl($scope, $rootScope, $routeParams, weatherSvc) {
        $scope.weather = {};
        weatherSvc.getWeather($routeParams.id).$promise
        .then(function getWeatherCb(weather) {
          $scope.weather = weather;
          $scope.wnddir = Math.floor($scope.weather.wind.deg);
          $scope.wndspd = $scope.weather.wind.speed;
          $scope.temp = $scope.weather.main.temp;
          $scope.pressure = $scope.weather.main.pressure;
          $scope.humidity = $scope.weather.main.humidity;
          $scope.wclass = $scope.getWClass();
          console.log('weather:', weather);
        })
        .catch(function getWeatherErr(err) {
          console.log(err);
        });
        $scope.getWClass = function getWClass() {
          var cls;
          if ($scope.weather) {
            switch($scope.weather.weather[0].main) {
              case 'Clouds':
                cls = 'Cloudy';
                break;
              case 'Rain':
              case 'Snow':
              case 'Drizzle':
              case 'Thunderstorm':
                cls = 'Rainy';
                break;
              default:
                cls = 'Sunny';
            }
          }
          return cls;
        };
      }],
      homeCtrl = ['$scope', '$window', 'URLS', 'geoSvc', 'citySvc',
      function homeCtrl($scope, $window, URLS, geoSvc, citySvc) {
        $scope.city = 'Detecting location...';
        $scope.getCity = function getCity() {
          geoSvc.geoLocate()
          .then(function geoLocateCb(pos) {
            return citySvc.getNearestCities(pos).$promise;
          })
          .then(function getNearestCitiesCb(cities) {
            $window.location.hash = URLS.weatherBase + '/' + cities[0]._id;
          })
          .catch(function getCityErr(err) {
            $window.alert('An error occured getting your location');
          });
        };
        $scope.getCity();
      }],
      motherCtrl = ['$scope', '$rootScope',
      function motherCtrl($scope, $rootScope) {
      }];
  cpc
  .config(function cpcConfig($routeProvider) {
    $routeProvider
    .when('/', { templateUrl: '/partials/index.html', controller: 'homeCtrl', controllerAs: 'hmc' })
    .when('/cities', { templateUrl: '/partials/cities.html', controller: 'cityCtrl', controllerAs: 'ctc' })
    .when('/weather/:id', { templateUrl: '/partials/weather.html', controller: 'weatherCtrl', controllerAs: 'wtc' })
    .otherwise({ redirectTo: '/' });
  })
  .constant('URLS', URLS)
  .controller('motherCtrl', motherCtrl)
  .controller('homeCtrl', homeCtrl)
  .controller('cityCtrl', cityCtrl)
  .controller('weatherCtrl', weatherCtrl)
  .factory('geoSvc', geoSvc)
  .factory('citySvc', citySvc)
  .factory('weatherSvc', weatherSvc);
})();
