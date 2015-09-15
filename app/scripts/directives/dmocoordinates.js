(function () {
	'use strict';
	
	angular.module('dmoDesigner.directives')
		.directive('dmoCoordinates', ['d3', function(d3) {
			return {
				restrict: 'EA',
				scope: {
					data: "=",
					viewparams: "=",
					label: "@",
					onClick: "&"
				},
				link: function(scope, iElement, iAttrs) {
					var svg = d3.select(iElement[0])
						.append("svg")
						.attr("width", "100%");
					
					var height = 500;
					var margin = 50;
					var previousColors = null;
					
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
					
					scope.$watch('viewparams', function(newVals, oldVals) {
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
							.style("fill", getRgb)
							.style("opacity", 0.4)
							.attr("r", 0)
							.attr("cx", getXValue)
							.attr("cy", getYValue)
							.transition()
								.duration(500) // time of duration
								.attr("r", getR); // width based on scale
							
						circles
							.transition()
								.duration(500) // time of duration
								.attr("r", getR) // width based on scale
								.attr("cx", getXValue)
								.attr("cy", getYValue);
						
						//only change color if not random or newly random
						if (scope.viewparams.color.name != "random" || previousColors != "random") {
							circles
								.transition()
									.duration(500) // time of duration
									.style("fill", getRgb)
									.style("opacity", 0.4)
						}
						
						previousColors = scope.viewparams.color.name;
						
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
							var value = getVisualValue(d, scope.viewparams.xAxis);
							return (margin/2)+(value * (width-margin));
						}
						
						function getYValue(d, i) {
							var value = getVisualValue(d, scope.viewparams.yAxis);
							//value = Math.pow(value, 1/3);
							return (height-(margin/2))-(value * (height-margin));
						}
						
						function getR(d) {
							var value = getVisualValue(d, scope.viewparams.size);
							return 1+Math.pow(value, 1/2)*50;
						}
						
						function getRgb(d) {
							return "rgb(" + Math.round((getVisualValue(d, scope.viewparams.color)) * 255) + ","
								+ Math.round((1-getVisualValue(d, scope.viewparams.color)) * 255) + ","
								+ Math.round(getVisualValue(d, scope.viewparams.color) * 255) +")";
						}
						
						function getVisualValue(dmo, parameter) {
							//console.log(parameter.name);
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
