(function () {
  'use strict';

  var cpc = angular.module('cpc', ['ngRoute', 'ngResource']),
      URLs = { APIBase: '/api/v1', cityBase: '/city/', weatherBase: '/weather/' },
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
      citySvc = ['$http', '$q', 'URLs',
      function citySvc($http, $q, URLs) {
        return {
        };
      }],
      cityCtrl = ['$scope', '$rootScope', 'citySvc',
      function cityCtrl($scope, $rootScope, citySvc) {
      }],
      weatherSvc = ['$http', '$q', 'URLs',
      function weatherSvc($http, $q, URLs) {
        return {
        };
      }],
      weatherCtrl = ['$scope', '$rootScope', 'weatherSvc',
      function weatherCtrl($scope, $rootScope, weatherSvc) {
      }],
      homeCtrl = ['$scope', 'geoSvc', 'citySvc',
      function homeCtrl($scope, geoSvc, citySvc) {
        geoSvc.geoLocate().then(function geoLocateSucess(pos) {
          console.log(pos);
        }, function geoLocateFailure(err) {
          console.log(err);
        });
      }],
      motherCtrl = ['$scope', '$rootScope',
      function motherCtrl($scope, $rootScope) {
      }];
  cpc
  .config(function cpcConfig($routeProvider) {
    $routeProvider
    .when('/', { templateUrl: '/partials/index.html', controller: 'homeCtrl', controllerAs: 'hmc' })
    .when('/cities', { templateUrl: '/partials/cities.html', controller: 'cityCtrl', controllerAs: 'ctc' })
    .when('/weather/:ctyId', { templateUrl: '/partials/weather.html', controller: 'weatherCtrl', controllerAs: 'wtc' })
    .otherwise({ redirectTo: '/' });
  })
  .constant('URLs', URLs)
  .controller('motherCtrl', motherCtrl)
  .controller('homeCtrl', homeCtrl)
  .controller('cityCtrl', cityCtrl)
  .controller('weatherCtrl', weatherCtrl)
  .factory('geoSvc', geoSvc)
  .factory('citySvc', citySvc)
  .factory('weatherSvc', weatherSvc);
})();
