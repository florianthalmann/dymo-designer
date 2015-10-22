(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('RenderingController', ['$scope', '$http', function($scope, $http){
			
			$scope.mappingTypes = [{name:"Feature"}, {name:"Control"}];
			//TODO GET THESE FROM CENTRALIZED PLACE IN DYMO-CORE!!
			$scope.controls = [{name:"GraphControl"}, {name:"AccelerometerX"}, {name:"AccelerometerY"}, {name:"AccelerometerZ"}, {name:"GeolocationLatitude"}, {name:"GeolocationLongitude"}];
			$scope.parameters = [{name:"Amplitude"}, {name:"PlaybackRate"}, {name:"Pan"}, {name:"Distance"}, {name:"Height"}, {name:"Reverb"}, {name:"Onset"}, {name:"DurationRatio"}, {name:"PartIndex"}, {name:"PartOrder"}, {name:"PartCount"}];
			$scope.rendering = new Rendering();
			$scope.currentMappings = [];
			var currentVariables;
			var currentVariableCode;
			reset();
			
			function reset() {
				$scope.mappingFunction = "a/36";
				$scope.currentDomainDims = [];
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
				$scope.currentDomainDims.push(createDomainDim($scope.selectedMappingType, dimension));
			}
			
			$scope.addMapping = function() {
				var dmos = getDmos(Number.parseInt($scope.mappingLevel));
				var domainDims = $scope.currentDomainDims.map(function (d) { return d.value.name });
				var newMapping = new Mapping(domainDims, undefined, getFunctionString(), dmos, $scope.selectedParameter.name);
				$scope.rendering.addMapping(newMapping);
				$scope.currentMappings.push(newMapping.toJson());
				reset();
			}
			
			function getDmos(level) {
				var dmos = [];
				for (var i = 0; i < $scope.dmo.dymoGraph.nodes.length; i++) {
					var currentDmo = $scope.dmo.getRealDmo($scope.dmo.dymoGraph.nodes[i]);
					if (isNaN(level) || currentDmo.getLevel() == level) {
						dmos.push(currentDmo);
					}
				}
				return dmos;
			}
			
			$scope.save = function() {
				new DymoWriter($http).writeRenderingToJson($scope.rendering.toJson(), $scope.dymoPath);
			}
			
			$scope.getFunctionReturnString = function(f) {
				var fString = f.toString();
				return fString.substring(fString.indexOf('return')+7, fString.indexOf(';'));
			}
			
			function createDomainDim(type, value) {
				var currentVariable = String.fromCharCode(currentVariableCode);
				currentVariables.push(currentVariable);
				currentVariableCode++;
				return {type:type, value:value, variable:currentVariable};
			}
			
			function getFunctionString() {
				var variablesString = JSON.stringify(currentVariables);
				variablesString = variablesString.substring(1, variablesString.length-1);
				return 'new Function(' + variablesString + ', "return ' + $scope.mappingFunction + ';");';
			}
			
		}]);

}());
