(function () {
	'use strict';
	
	angular.module('dmoDesigner.directives')
		.directive('dmoCoordinates', ['d3', function(d3) {
			return {
				restrict: 'EA',
				scope: {
					data: "=",
					xaxis: "=",
					yaxis: "=",
					size: "=",
					color: "=",
					label: "@",
					onClick: "&"
				},
				link: function(scope, iElement, iAttrs) {
					var svg = d3.select(iElement[0])
						.append("svg")
						.attr("width", "100%");
					
					var height = 500;
					var margin = 50;
					
					// on window resize, re-render d3 canvas
					window.onresize = function() {
						return scope.$apply();
					};
					scope.$watch(function(){
							return angular.element(window)[0].innerWidth;
						}, function(){
							return scope.render(scope.data);
						}
					);
					
					// watch for data changes and re-render
					scope.$watch('data', function(newVals, oldVals) {
						return scope.render(newVals);
					}, true);
					
					scope.$watch('xaxis', function(newVals, oldVals) {
						return scope.render(scope.data);
					}, true);
					
					scope.$watch('yaxis', function(newVals, oldVals) {
						return scope.render(scope.data);
					}, true);
					
					scope.$watch('size', function(newVals, oldVals) {
						return scope.render(scope.data);
					}, true);
					
					scope.$watch('color', function(newVals, oldVals) {
						console.log(scope.color);
						return scope.render(scope.data);
					}, true);
					
					// define render function
					scope.render = function(data){
						// setup variables
						var width = d3.select(iElement[0])[0][0].offsetWidth - 20; // 20 is for margins and can be changed
						// set the height based on the calculations above
						svg.attr('height', height);
						
						//create the rectangles for the bar chart
						var circles = svg.selectAll("circle").data(data);
						
						circles.enter()
							.append("circle")
							.on("click", function(d, i){return scope.onClick({item: d});})
						.style("fill", getRgba)
							.attr("r", 0)
							.attr("cx", getXValue)
							.attr("cy", getYValue)
							.transition()
								.duration(500) // time of duration
								.attr("r", getR); // width based on scale
							
						circles
							.transition()
								.duration(500) // time of duration
								.style("fill", getRgba)
								.attr("r", getR) // width based on scale
								.attr("cx", getXValue)
								.attr("cy", getYValue);
						
						/*var text = svg.selectAll("text").data(data);
				
						text.enter()
								.append("text")
								.attr("fill", "#fff")
								.attr("y", 255)
								.attr("x", function(d, i){return (i+1) * width/(data.length+1) - 30;})
								.text(function(d){return d[scope.label];});
				
						text
							.transition()
								.duration(0) // time of duration
								.attr("x", function(d, i){return (i+1) * width/(data.length+1) - 30;})*/
						
						function getXValue(d, i) {
							var value = getVisualValue(d, scope.xaxis);
							return (margin/2)+(value * (width-margin));
						}
						
						function getYValue(d, i) {
							var value = getVisualValue(d, scope.yaxis);
							//value = Math.pow(value, 1/3);
							return (height-(margin/2))-(value * (height-margin));
						}
						
						function getR(d) {
							var value = getVisualValue(d, scope.size);
							return 1+Math.pow(value, 1/2)*50;
						}
						
						function getRgba(d) {
							console.log(d, scope.color);
							return "rgba(" + Math.round(getVisualValue(d, scope.color) * 255) + ","
								+ Math.round((1-getVisualValue(d, scope.color)) * 255) + ","
								+ Math.round(getVisualValue(d, scope.color) * 255) + ","
								+ 0.4 + ")";
						}
						
						function getVisualValue(dmo, parameter) {
							//console.log(parameter.name, dmo[parameter.name]);
							if (parameter.name == "random") {
								return Math.random();
							} else {
								return dmo[parameter.name] / parameter.max;
							}
						}
					};
				}
			};
		}]);

}());
