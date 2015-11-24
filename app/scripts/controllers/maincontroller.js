(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('MainController', ['$scope', '$http', function($scope, $http){
			
			$scope.dymoPath = '/save/test/';
			$scope.activities = [{name:"Features"}, {name:"Mappings"}, {name:"View"}];
			
			$scope.views = [{name:"Dymo Axes"}, {name:"Dymo Graph"}, {name:"Similarity Graph"}, {name: "Mappings"}];
			$scope.selectedView = $scope.views[0];
			
			$scope.areas = [];//[[{0:100,1:100},{0:200,1:200},{0:200,1:100},{0:100,1:100}]];
			var currentAreaId = 0;
			
			$scope.addPointToArea = function(point) {
				if (!$scope.areas[currentAreaId]) {
					$scope.areas[currentAreaId] = [{0:point[0],1:point[1]}];
				}
				$scope.areas[currentAreaId].push({0:point[0],1:point[1]});
				$scope.$apply();
			}
			
			$scope.finishArea = function() {
				if ($scope.areas[currentAreaId].length > 0) {
					$scope.areas[currentAreaId].push($scope.areas[currentAreaId][0]);
					currentAreaId++;
					$scope.$apply();
				}
			}
			
			$scope.areaOnClick = function(area){
				console.log(area);
			}
			
		}]);

}());
