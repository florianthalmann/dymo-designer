(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('DmoController', ['$scope', '$http', function($scope, $http){
			
			$scope.featureFile = 'features/low.json'
			$scope.labelCondition = '1'
			$scope.featureLoadingThreads = 0
			
			$scope.dmo = null;
			$scope.dmoGraph = {nodes:[], links:[]};
			$scope.dmoList = [];
			$scope.parameters = [{name:"time", max:0}, {name:"duration", max:0}];
			
			$scope.dmoOnClick = function(dmo){
				$scope.selectedDmo = dmo;
				$scope.$apply();
			};
			
			var maxDepth = 0;
			
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
				updateMaxes(dmo);
			}
			
			function updateMaxes(dmo) {
				for (var i = 0; i < $scope.parameters.length; i++) {
					var p = $scope.parameters[i];
					p.max = Math.max(dmo[p.name], p.max);
				}
			}
			
			var addSegmentation = function(segments) {
				for (var i = 0; i < segments.length-1; i++) {
					var newDmo = createNewDmo();
					newDmo.time = segments[i].time.value;
					newDmo.duration = segments[i+1].time.value - newDmo.time;
					newDmo.segmentLabel = segments[i].label.value;
					parent = getSuitableParent(newDmo);
					updateParentDuration(parent, newDmo);
					addChildDmo(parent, newDmo);
				}
				maxDepth++;
			}
			
			function getSuitableParent(dmo) {
				var nextCandidate = $scope.dmo;
				var depth = 0;
				while (depth < maxDepth) {
					var children = nextCandidate.children;
					if (children.length > 0) {
						for (var i = 0; i < children.length; i++) {
							if (children[i].time <= dmo.time) {
								nextCandidate = children[i];
								depth++;
							} else {
								break;
							}
						}
					} else {
						return nextCandidate;
					}
				}
				return nextCandidate;
			}
			
			function updateParentDuration(parent, newDmo) {
				if (!parent.time || newDmo.time < parent.time) {
					parent.time = newDmo.time;
				}
				if (!parent.duration || parent.time+parent.duration < newDmo.time+newDmo.duration) {
					parent.duration = (newDmo.time+newDmo.duration) - parent.time;
				}
				updateMaxes(parent);
			}
			
			$scope.addChildrenFromFeatures = function() {
				new FeatureLoader($scope, $http).loadSegmentation($scope.featureFile, $scope.labelCondition, addSegmentation);
			}
			
			function createNewDmo() {
				return {
					name: "dmo" + ($scope.dmoList.length+1),
					time: Math.random()*10,
					duration: Math.random()*10,
					children: []
				}
			}
			
		}]);

}());
