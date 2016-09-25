(function() {
'use strict';

angular.module('dymoDesigner.directives')
	.directive("dropzone", function() {
		return {
			restrict: "A",
			link: function(scope, elem) {
				elem.bind('dragover', function(evt){ evt.preventDefault(); });
				elem.bind('drop', function(evt) {
					evt.stopPropagation();
					evt.preventDefault();
					var files = evt.dataTransfer.files;
					for (var i = 0, f; f = files[i]; i++) {
						scope.fileDropped(f);
					}
				});
			}
		}
	});
}());
