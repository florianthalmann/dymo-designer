(function () {
	'use strict';

	// create the angular app
	angular.module('dmoDesigner', [
		'dmoDesigner.controllers',
		'dmoDesigner.directives'
	]);

	// setup dependency injection
	angular.module('d3', []);
	angular.module('dmoDesigner.controllers', []);
	angular.module('dmoDesigner.directives', ['d3']);


}());