(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('RenderingController', ['$scope', '$http', function($scope, $http){
			
			$scope.mappingTypes = [{name:"Feature"}, {name:"Control"}];
			$scope.controls = [{name:"GraphControl"}, {name:"AccelerometerX"}, {name:"AccelerometerY"}, {name:"AccelerometerZ"}, {name:"GeolocationLatitude"}, {name:"GeolocationLongitude"}];
			$scope.parameters = [{name:"Amplitude"}, {name:"PlaybackRate"}, {name:"Pan"}, {name:"Distance"}, {name:"Height"}, {name:"Reverb"}, {name:"DurationRatio"}, {name:"PartIndex"}, {name:"PartOrder"}, {name:"PartCount"}];
			$scope.realRendering = new Rendering();
			$scope.rendering = {mappings:[]};
			var currentVariable;
			
			reset();
			
			function reset() {
				$scope.currentMapping = createMapping();
				$scope.mappingFunction = "a/36";
				currentVariable = 'a';
			}
			
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
				
				//TODO REDESIGN!!
				if ($scope.selectedMappingType.name == "Feature") {
					$scope.realRendering.addFeatureMapping($scope.dmo, $scope.selectedFeature, $scope.currentMapping.function, $scope.selectedParameter, $scope.currentMapping.level);
				} else {
					$scope.realRendering.addControlMapping($scope.selectedControl, getParsedFunction(), $scope.selectedParameter, level);
				}
				
				$scope.rendering.mappings.push($scope.currentMapping);
				reset();
			}
			
			$scope.save = function() {
				new DymoWriter($http).writeRenderingToJson($scope.rendering, $scope.dymoPath);
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
