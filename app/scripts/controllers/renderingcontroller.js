(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('RenderingController', ['$scope', '$http', function($scope, $http){
			
			$scope.mappingTypes = [{name:"Analytical"}, {name:"Control"}];
			$scope.controls = [{name:"GraphControl"}, {name:"AccelerometerX"}, {name:"AccelerometerY"}, {name:"AccelerometerZ"}, {name:"GeolocationLatitude"}, {name:"GeolocationLongitude"}];
			$scope.parameters = [{name:"Amplitude"}, {name:"Pan"}, {name:"Distance"}, {name:"Height"}, {name:"Reverb"}, {name:"Segmentation"}];
			$scope.mappingFunction = "2*x";
			$scope.rendering = Rendering();
			
			$scope.addMapping = function() {
				if ($scope.selectedMappingType == $scope.mappingTypes[0]) {
					$scope.rendering.addFeatureMapping($scope.selectedFeature, getParsedFunction(), $scope.selectedParameter);
				} else {
					$scope.rendering.addControlMapping($scope.selectedControl, getParsedFunction(), $scope.selectedParameter);
				}
			}
			
			function getParsedFunction() {
				return new Function("x", "return " + $scope.mappingFunction + ";");
			}
			
		}]);

}());
