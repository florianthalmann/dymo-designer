(function () {
	'use strict';

	// create the angular app
	angular.module('dymoDesigner', [
		'dymoDesigner.controllers',
		'dymoDesigner.directives'
	]);

	// setup dependency injection
	angular.module('d3', []);
	angular.module('dymoDesigner.controllers', []);
	angular.module('dymoDesigner.directives', ['d3']);

}());