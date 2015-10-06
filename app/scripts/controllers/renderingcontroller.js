(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('RenderingController', ['$scope', '$http', function($scope, $http){
			
			$scope.mappingTypes = [{name:"Feature"}, {name:"Control"}];
			$scope.controls = [{name:"GraphControl"}, {name:"AccelerometerX"}, {name:"AccelerometerY"}, {name:"AccelerometerZ"}, {name:"GeolocationLatitude"}, {name:"GeolocationLongitude"}];
			$scope.parameters = [{name:"Amplitude"}, {name:"PlaybackRate"}, {name:"Pan"}, {name:"Distance"}, {name:"Height"}, {name:"Reverb"}, {name:"DurationRatio"}, {name:"PartCount"}];
			$scope.mappingFunction = "x/36";
			$scope.rendering = new Rendering();
			
			$scope.addMapping = function() {
				var level = Number.parseInt($scope.mappingLevel);
				if ($scope.selectedMappingType.name == "Feature") {
					$scope.rendering.addFeatureMapping($scope.dmo, $scope.selectedFeature, getParsedFunction(), $scope.selectedParameter, level);
				} else {
					$scope.rendering.addControlMapping($scope.selectedControl, getParsedFunction(), $scope.selectedParameter, level);
				}
			}
			
			function getParsedFunction() {
				return new Function("x", "return " + $scope.mappingFunction + ";");
			}
			
		}]);

}());
