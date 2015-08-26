(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('DemoCtrl', ['$scope', function($scope){
			$scope.title = "DMO Generator";
			$scope.dmos = [
				{name: "dmo1", size:98},
				{name: "dmo2", size:96},
				{name: "dmo3", size:48}
			];
			$scope.d3OnClick = function(item){
				alert(item.name);
			};
		}]);

}());
