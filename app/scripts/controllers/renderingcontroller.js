(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('RenderingController', ['$scope', '$http', function($scope, $http){
			
			$scope.mappingTypes = [{name:"Feature"}, {name:"Control"}];
			$scope.controls = [{name:"GraphControl"}, {name:"AccelerometerX"}, {name:"AccelerometerY"}, {name:"AccelerometerZ"}, {name:"GeolocationLatitude"}, {name:"GeolocationLongitude"}];
			$scope.parameters = [{name:"Amplitude"}, {name:"PlaybackRate"}, {name:"Pan"}, {name:"Distance"}, {name:"Height"}, {name:"Reverb"}, {name:"DurationRatio"}, {name:"PartIndex"}, {name:"PartOrder"}, {name:"PartCount"}];
			$scope.mappingFunction = "a/36";
			$scope.rendering = new Rendering();
			$scope.mappings = [];
			
			$scope.currentMapping = createMapping();
			
			var currentVariable = 'a';
			
			$scope.addDomainDim = function() {
				var dimension;
				if ($scope.selectedMappingType == $scope.mappingTypes[0]) {
					dimension = $scope.selectedFeature;
				} else {
					dimension = $scope.selectedControl;
				}
				$scope.currentMapping.domainDims.push(createDomainDim($scope.selectedMappingType, dimension));
			}
			
			$scope.addMapping = function() {
				$scope.currentMapping.parameter = $scope.selectedParameter;
				$scope.currentMapping.function = getParsedFunction();
				$scope.currentMapping.level = Number.parseInt($scope.mappingLevel);
				console.log($scope.currentMapping.function);
				
				//TODO REDESIGN!!
				if ($scope.selectedMappingType.name == "Feature") {
					$scope.rendering.addFeatureMapping($scope.dmo, $scope.selectedFeature, $scope.currentMapping.function, $scope.selectedParameter, $scope.currentMapping.level);
				} else {
					$scope.rendering.addControlMapping($scope.selectedControl, getParsedFunction(), $scope.selectedParameter, level);
				}
				
				$scope.mappings.push($scope.currentMapping);
				$scope.currentMapping = createMapping();
			}
			
			$scope.getFunctionReturnString = function(f) {
				var fString = f.toString();
				return fString.substring(fString.indexOf('return')+7, fString.indexOf(';'));
			}
			
			function createMapping() {
				return {domainDims:[]};
			}
			
			function createDomainDim(type, value) {
				var dim = {type:type, value:value, variable:currentVariable};
				incrementCurrentVariable();
				return dim;
			}
			
			function getParsedFunction() {
				return new Function("x", "return " + $scope.mappingFunction + ";");
			}
			
			function incrementCurrentVariable() {
				currentVariable = String.fromCharCode(currentVariable.charCodeAt(0) + 1);
			}
			
		}]);

}());
