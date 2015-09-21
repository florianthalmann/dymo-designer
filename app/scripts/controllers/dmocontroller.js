(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('DmoController', ['$scope', '$http', function($scope, $http){
			
			$scope.featureFile = 'features/low_barbeat.json';
			$scope.labelCondition = '1';
			$scope.featureLoadingThreads = 0;
			
			$scope.dmo = null;
			$scope.dmoGraph = {nodes:[], links:[]};
			$scope.dmoList = [];
			$scope.parameters = [createParameter("time"), createParameter("duration"), createParameter("random", 0, 1)];
			$scope.views = [{name:"axes"}, {name:"graph"}];
			
			var maxDepth = 0;
			
			$scope.dmoOnClick = function(dmo){
				$scope.selectedDmo = dmo;
				$scope.$apply();
			};
			
			$scope.addDmo = function() {
				var newDmo = createNewDmo();
				//set as top-level dmo if none exists
				if ($scope.dmo == null) {
					setTopLevelDmo(newDmo);
				//add as child if one exists
				} else {
					addChildDmo($scope.dmo, newDmo);
				}
				//createPitchHelixDmo();
			}
			
			function createPitchHelixDmo() {
				getParameter("chroma");
				getParameter("height");
				var previousDmo = null;
				for (var i = 0; i < 48; i++) {
					var currentDmo = createNewDmo(1,1);
					var cos = Math.cos((i % 12) / 6 * Math.PI);
					var sin = Math.sin((i % 12) / 6 * Math.PI);
					currentDmo.chroma = cos+1;
					currentDmo.height = sin+1+(i/4.5);
					if (previousDmo) {
						addChildDmo(previousDmo, currentDmo);
					} else {
						setTopLevelDmo(currentDmo);
					}
					previousDmo = currentDmo;
				}
				console.log($scope.dmoGraph);
			}
			
			$scope.addChildrenFromFeatures = function() {
				new FeatureLoader($scope, $http).loadFeature($scope.featureFile, $scope.labelCondition, this);
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
				updateMinMaxes(dmo);
			}
			
			function setDmoParameter(dmo, param, value) {
				dmo[param.name] = value;
				updateMinMax(dmo, param);
			}
			
			function updateMinMaxes(dmo) {
				for (var i = 0; i < $scope.parameters.length; i++) {
					updateMinMax(dmo, $scope.parameters[i]);
				}
			}
			
			function updateMinMax(dmo, param) {
				if (dmo[param.name]) {
					if (param.max == undefined) {
						param.min = dmo[param.name];
						param.max = dmo[param.name];
					} else {
						param.min = Math.min(dmo[param.name], param.min);
						param.max = Math.max(dmo[param.name], param.max);
					}
				}
			}
			
			$scope.addFeature = function(name, data) {
				//iterate through all levels and add averages
				var parameter = getParameter(name);
				for (var i = 0; i < $scope.dmoList.length; i++) {
					var laterValues = data.filter(
						function(x){return x.time.value > $scope.dmoList[i].time}
					);
					var closestValue = laterValues[0].value[0];
					setDmoParameter($scope.dmoList[i], parameter, closestValue);
				}
			}
			
			function getParameter(name) {
				//if already exists return that
				for (var i = 0; i < $scope.parameters.length; i++) {
					if ($scope.parameters[i].name == name) {
						return $scope.parameters[i];
					}
				}
				//if doesn't exist make a new one
				var newParameter = createParameter(name);
				$scope.parameters.splice($scope.parameters.length-1, 0, newParameter);
				return newParameter;
			}
			
			function createParameter(name, min, max) {
				if (min != undefined && max != undefined) {
					return {name:name, min:min, max:max};
				}
				return {name:name, min:1, max:0};
			}
			
			$scope.addSegmentation = function(segments) {
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
				updateMinMaxes(parent);
			}
			
			function createNewDmo(time, duration) {
				if (!time) {
					time = Math.random();
				}
				if (!duration) {
					duration = Math.random();
				}
				return {
					name: "dmo" + ($scope.dmoList.length+1),
					time: time,
					duration: duration,
					children: []
				}
			}
			
		}]);

}());
