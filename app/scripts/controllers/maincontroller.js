(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('MainController', ['$scope', '$http', function($scope, $http){
			
			$scope.activities = [{name:"Features"}, {name:"Mappings"}, {name:"View"}];
			
			$scope.dmo = new DmoManager($scope.scheduler, $scope);
			
			$scope.views = [{name:"DMO Axes"}, {name:"DMO Graph"}];
			$scope.viewConfig = {xAxis:createConfig("x-axis"), yAxis:createConfig("y-axis"), size:createConfig("size"), color:createConfig("color")};
			function createConfig(name) {
				return {name:name, param:$scope.dmo.features[1], log:false};
			}
			
			$http.get('getsourcefiles/').success(function(data) {
				$scope.sourceFiles = data;
				$scope.selectedSource = data[0];
				$scope.sourceSelected();
			});
			
			$scope.sourceSelected = function() {
				$scope.scheduler.addSourceFile($scope.getFullSourcePath());
				$http.get('getfeaturefiles/', {params:{source:$scope.selectedSource}}).success(function(data) {
					$scope.featureFiles = data;
					$scope.selectedFeature = data[0];
				});
			}
			
			$scope.getFullSourcePath = function() {
				return 'audio/' + $scope.selectedSource;
			}
			
		}]);

}());
