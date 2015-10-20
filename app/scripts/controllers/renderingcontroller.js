(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('RenderingController', ['$scope', '$http', function($scope, $http){
			
			$scope.mappingTypes = [{name:"Feature"}, {name:"Control"}];
			$scope.controls = [{name:"GraphControl"}, {name:"AccelerometerX"}, {name:"AccelerometerY"}, {name:"AccelerometerZ"}, {name:"GeolocationLatitude"}, {name:"GeolocationLongitude"}];
			$scope.parameters = [{name:"Amplitude"}, {name:"PlaybackRate"}, {name:"Pan"}, {name:"Distance"}, {name:"Height"}, {name:"Reverb"}, {name:"DurationRatio"}, {name:"PartIndex"}, {name:"PartOrder"}, {name:"PartCount"}];
			$scope.realRendering = new Rendering();
			$scope.rendering = {mappings:[]};
			var currentVariables;
			var currentVariableCode;
			reset();
			
			function reset() {
				$scope.currentMapping = createMapping();
				$scope.mappingFunction = "a/36";
				currentVariables = [];
				currentVariableCode = 97; // 'a'
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
				$scope.rendering.mappings.push($scope.currentMapping);
				
				//for now just features
				var domainDims = $scope.currentMapping.domainDims.map(function (d) { return d.value.name });
				var dmos = getDmos($scope.currentMapping.level);
				
				$scope.realRendering.addMapping(new Mapping(domainDims, undefined, $scope.currentMapping.function, dmos, $scope.selectedParameter.name));
				
				/*if ($scope.selectedMappingType.name == "Feature") {
					$scope.realRendering.addFeatureMapping($scope.dmo, $scope.selectedFeature, $scope.currentMapping.function, $scope.selectedParameter, $scope.currentMapping.level);
				} else {
					$scope.realRendering.addControlMapping($scope.selectedControl, getParsedFunction(), $scope.selectedParameter, level);
				}*/
				
				reset();
			}
			
			function getDmos(level) {
				var dmos = [];
				for (var i = 0; i < $scope.dmo.graph.nodes.length; i++) {
					var currentDmo = $scope.dmo.getRealDmo($scope.dmo.graph.nodes[i]);
					if (isNaN(level) || currentDmo.getLevel() == level) {
						dmos.push(currentDmo);
					}
				}
				return dmos;
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
				var currentVariable = String.fromCharCode(currentVariableCode);
				currentVariables.push(currentVariable);
				currentVariableCode++;
				return {type:type, value:value, variable:currentVariable};
			}
			
			function getParsedFunction() {
				var variablesString = JSON.stringify(currentVariables);
				variablesString = variablesString.substring(1, variablesString.length-1);
				var functionString = 'new Function(' + variablesString + ', "return ' + $scope.mappingFunction + ';");';
				return eval(functionString);
			}
			
		}]);

}());
