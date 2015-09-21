(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('DmoController', ['$scope', '$http', function($scope, $http){
			
			$scope.featureFile = 'features/low_barbeat.json';
			$scope.labelCondition = '1';
			$scope.featureLoadingThreads = 0;
			
			$scope.dmo = new Dmo();
			$scope.controls = [{name:"GraphControl"}, {name:"AccelerometerX"}, {name:"AccelerometerY"}, {name:"AccelerometerZ"}, {name:"GeolocationLongitude"}];
			$scope.views = [{name:"axes"}, {name:"graph"}];
			$scope.mappings = [];
			
			var maxDepth = 0;
			
			$scope.dmoOnClick = function(dmo){
				$scope.selectedDmo = dmo;
				$scope.$apply();
			};
			
			$scope.addChildrenFromFeatures = function() {
				new FeatureLoader($scope, $http).loadFeature($scope.featureFile, $scope.labelCondition, $scope.dmo);
			}
		}]);

}());
