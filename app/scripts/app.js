(function () {
	'use strict';

	// create the angular app
	angular.module('dymoDesigner', [
		'dymoDesigner.controllers',
		'dymoDesigner.directives',
		'musicVisualization.directives'
	]);

	// setup dependency injection
	angular.module('d3', []);
	angular.module('dymoDesigner.controllers', ['ngDialog']);
	angular.module('dymoDesigner.directives', ['d3']);
	angular.module('musicVisualization.directives', ['d3']);

}());