(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('RenderingController', ['$scope', '$http', function($scope, $http){
			
			initControlsAndParameters();
			$scope.mappingTypes = [{name:"Feature"}, {name:"Control"}, {name:"New Control"}];
			$scope.rendering = new Rendering($scope.dmo.dymo);
			$scope.currentMappings = [];
			$scope.mappingFunction = "Math.cos(a%12/12*2*Math.PI)";
			var currentVariables;
			var currentVariableCode;
			reset();
			
			function reset() {
				$scope.currentDomainDims = [];
				currentVariables = [];
				currentVariableCode = 97; // 'a'
			}
			
			function initControlsAndParameters() {
				$scope.controls = [];
				for (var i = 0; i < CONTROLS.length; i++) {
					$scope.controls.push({name:CONTROLS[i]});
				}
				$scope.uiControls = {};
				$scope.parameters = [];
				for (var i = 0; i < PARAMETERS.length; i++) {
					$scope.parameters.push({name:PARAMETERS[i]});
				}
			}
			
			$scope.addDomainDim = function() {
				var name, dimension;
				if ($scope.selectedMappingType == $scope.mappingTypes[0]) {
					name = $scope.selectedFeature.name;
					dimension = $scope.selectedFeature;
				} else if ($scope.selectedMappingType == $scope.mappingTypes[1]){
					name = $scope.selectedControlType.name;
					dimension = $scope.selectedControlType;
				} else {
					name = $scope.controlName;
					//always make sliders for now...
					dimension = new Control(0, name, SLIDER);
					$scope.uiControls[name] = dimension;
					if (!$scope.selectedControl) {
						$scope.selectedControl = dimension;
					}
				}
				$scope.currentDomainDims.push(createDomainDim($scope.selectedMappingType, name, dimension));
			}
			
			$scope.addMapping = function() {
				var dmos = getDmos(Number.parseInt($scope.mappingLevel));
				var domainDims = $scope.currentDomainDims.map(function (d) {
					if (d.type.name == "Control" || d.type.name == "New Control") {
						return d.value;
					}
					return d.value.name;
				});
				if ($scope.selectedParameter.name == PART_ORDER) {
					//TODO FIND BETTER PLACE AND WAY TO DO THIS!!! (WITH MAPPINGS)
					for (var i = 0; i < dmos.length; i++) {
						dmos[i].updatePartOrder(domainDims[0]);
					}
				} else {
					var newMapping = new Mapping(domainDims, undefined, getFunctionString(), dmos, $scope.selectedParameter.name);
					$scope.rendering.addMapping(newMapping);
					$scope.currentMappings.push(newMapping.toJson());
					reset();	
				}
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
			
			function createDomainDim(type, name, value) {
				var currentVariable = String.fromCharCode(currentVariableCode);
				currentVariables.push(currentVariable);
				currentVariableCode++;
				return {type:type, name:name, value:value, variable:currentVariable};
			}
			
			function getFunctionString() {
				var variablesString = JSON.stringify(currentVariables);
				variablesString = variablesString.substring(1, variablesString.length-1);
				return 'new Function(' + variablesString + ', "return ' + $scope.mappingFunction + ';");';
			}
			
		}]);

}());
