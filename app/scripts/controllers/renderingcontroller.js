(function () {
	'use strict';

	angular.module('dymoDesigner.controllers')
		.controller('RenderingController', ['$scope', '$http', 'ngDialog', function($scope, $http, ngDialog) {
			
			$scope.domainDimTypes = [{name:"Feature"}, {name:"Parameter"}, {name:"Control"}, {name:"New Control"}];
			$scope.selectedDomainDimType = $scope.domainDimTypes[0];
			$scope.mappingFunction = "Math.cos(a%12/12*2*Math.PI)";
			$scope.dymoFunction = "d.getLevel() == 2 && d.getIndex() == 1";
			var currentVariables;
			var currentVariableCode;
			var currentMappingDialog;
			reset();
			
			function reset() {
				$scope.currentDomainDims = [];
				currentVariables = [];
				currentVariableCode = 97; // 'a'
				if (currentMappingDialog) {
					currentMappingDialog.close();
					currentMappingDialog = null;
				}
			}
			
			$scope.domainDimTypeSelected = function() {
				if ($scope.selectedDomainDimType.name == "Feature") {
					$scope.domainDimOptions = $scope.features;
				} else if ($scope.selectedDomainDimType.name == "Parameter") {
					$scope.domainDimOptions = $scope.parameters;
				} else if ($scope.selectedDomainDimType.name == "Control") {
					$scope.domainDimOptions = $scope.uiControls;
				} else {
					$scope.domainDimOptions = $scope.controls;
				}
				if ($scope.domainDimOptions && $scope.domainDimOptions.length > 0) {
					$scope.selectedDomainDimOption = $scope.domainDimOptions[0];
				}
				setTimeout(function() {
					$scope.$apply();
				}, 10);
			}
			
			$scope.showMappingDialog = function() {
				currentMappingDialog = ngDialog.open({ template: '<div ng-controller="RenderingController">\
					<div>\
						<span>type:</span>\
						<select ng-init="selectedDomainDimType = domainDimTypes[0];domainDimTypeSelected()" ng-model="selectedDomainDimType" ng-options="t.name for t in domainDimTypes" ng-change="domainDimTypeSelected()"></select>\
						<select ng-show="selectedDomainDimType != domainDimTypes[2]" ng-model="selectedDomainDimOption" ng-options="d.name for d in domainDimOptions"></select>\
						<select ng-show="selectedDomainDimType == domainDimTypes[2]" ng-model="selectedDomainDimOption" ng-options="d.getName() for d in domainDimOptions"></select>\
						<br>\
						<span ng-show="selectedDomainDimType == domainDimTypes[3]">name:</span>\
						<input type="text" ng-model="controlName" size="20" ng-show="selectedDomainDimType == domainDimTypes[3]"></input>\
					</div>\
					<button ng-click="addDomainDim()">Add Domain Dimension</button>\
					<br>\
					<span ng-repeat="d in currentDomainDims">\
						<span>{{d.variable}} = {{d.name ? d.name : d.type}}</span>\
						<br>\
					</span>\
				<div>\
					<span>function: y = </span>\
					<input type="text" ng-model="mappingFunction" size="30"></input>\
					<br>\
					<span>dymos:</span>\
					<input type="text" ng-model="dymoFunction" size="30"></input>\
					<br>\
					<span>range:</span>\
					<select ng-init="selectedRange = parameters[0]" ng-model="selectedRange" ng-options="p.name for p in parameters"></select>\
					<br>\
					<button ng-click="addMapping()">Add Mapping</button>\
				</div>\
				</div>',
				plain:true,
				scope:$scope});
			}
			
			$scope.addDomainDim = function() {
				var name;
				if ($scope.selectedDomainDimType.name == "New Control") {
					name = $scope.controlName;
				}
				$scope.currentDomainDims.push(createDomainDim($scope.selectedDomainDimOption.uri, name));
			}
			
			$scope.addMapping = function() {
				$scope.store.addRendering("r0", $scope.manager.getTopDymo());
				var domainVariables = $scope.currentDomainDims.map(function(d){return d["variable"];});
				$scope.store.addMapping("r0", $scope.currentDomainDims, [domainVariables,"return "+$scope.mappingFunction],null,[["d"],"return "+$scope.dymoFunction],$scope.selectedRange.uri);
				reset();
				$scope.reloadFromStore();
				
			}
			
			$scope.save = function() {
				new DymoWriter($http).writeRenderingToJson($scope.rendering.toJson(), $scope.dymoPath);
			}
			
			function createDomainDim(type, name, value) {
				var domainDim = {};
				if (type) {
					domainDim["type"] = type;
				}
				if (name) {
					domainDim["name"] = name;
				}
				if (!isNaN(value)) {
					domainDim["value"] = value;
				}
				domainDim["variable"] = String.fromCharCode(currentVariableCode);
				currentVariables.push(domainDim["variable"]);
				currentVariableCode++;
				return domainDim;
			}
			
		}]);

}());
