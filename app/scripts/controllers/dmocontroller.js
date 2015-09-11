(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('DmoController', ['$scope', '$http', function($scope, $http){
			
			$scope.featureFile = 'features/low.json'
			$scope.featureLoadingThreads = 0
			
			$scope.dmo = null;
			$scope.dmoGraph = {nodes:[], links:[]};
			$scope.dmoList = [];
			
			$scope.dmoOnClick = function(dmo){
				$scope.selectedDmo = dmo;
				$scope.$apply();
			};
			
			var tempGraph = {};
			
			$scope.addDmo = function() {
				var newDmo = createNewDmo();
				//set as top-level dmo if none exists
				if ($scope.dmo == null) {
					setTopLevelDmo(newDmo);
				//add as child if one exists
				} else {
					addChildDmo($scope.dmo, newDmo);
				}
			}
			
			function updateGraph() {
				$scope.dmoGraph = tempGraph;
			}
			
			function setTopLevelDmo(dmo) {
				registerDmo(dmo);
				$scope.dmo = dmo;
			}
			
			function addChildDmo(parent, child) {
				registerDmo(child);
				parent.children.push(child);
				var parentIndex = $scope.dmoList.indexOf(parent);
				var childIndex = $scope.dmoList.indexOf(child);
				var link = {"source":parent,"target":child,"value":1};
				$scope.dmoGraph.links.push(link);
			}
			
			function registerDmo(dmo) {
				$scope.dmoList.push(dmo);
				$scope.dmoGraph.nodes.push(dmo);
			}
			
			var addSegmentation = function(segments) {
				for (var i = 0; i < segments.length-1; i++) {
					var newDmo = createNewDmo();
					newDmo.time = segments[i].time.value;
					newDmo.duration = segments[i+1].time.value - newDmo.time;
					newDmo.segmentLabel = segments[i].label.value;
					addChildDmo($scope.dmo, newDmo);
				}
			}
			
			$scope.addChildrenFromFeatures = function() {
				new FeatureLoader($scope, $http).loadSegmentation($scope.featureFile, 1, addSegmentation);
			}
			
			function createNewDmo() {
				return {
					name: "dmo" + ($scope.dmoList.length+1),
					size: parseInt(Math.random()*200),
					children: []
				}
			}
			
		}]);

}());
