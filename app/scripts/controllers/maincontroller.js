(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('MainController', ['$scope', '$http', function($scope, $http){
			
			$scope.dymoPath = '/save/test/';
			$scope.activities = [{name:"Features"}, {name:"Mappings"}, {name:"View"}];
			
		}]);

}());
