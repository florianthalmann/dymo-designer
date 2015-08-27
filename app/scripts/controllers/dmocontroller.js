(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('DmoController', ['$scope', function($scope){
			$scope.title = "DMO Generator";
			$scope.dmos = [];
			
			$scope.dmoOnClick = function(dmo){
				$scope.selectedDmo = dmo;
				$scope.$apply();
			};
			
			$scope.addDmo = function() {
				$scope.dmos.push({
					name: "dmo" + ($scope.dmos.length+1),
					size: parseInt(Math.random()*200)
				});
			}
		}]);

}());
