(function () {
	'use strict';
	
	angular.module('dmoDesigner.directives')
		.directive('dmoCoordinates', ['d3', function(d3) {
			return {
				restrict: 'EA',
				scope: {
					data: "=",
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
						.style("fill", getRandomRgba)
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
							return (margin/2)+(d[scope.$parent.xAxis.name] / scope.$parent.xAxis.max * (width-margin));
						}
						
						function getYValue(d, i) {
							var value = d[scope.$parent.yAxis.name] / scope.$parent.yAxis.max;
							value = Math.pow(value, 1/3);
							return (height-(margin/2))-(value * (height-margin));
						}
						
						function getR(d) {
							if (d.duration) {
								return Math.pow(d.duration, 1/3)*10;
								//return (Math.log(d.duration+1) / Math.log(3))*10;
							}
							return 10;
						}
						
						function getRandomRgba() {
							return "rgba(" + Math.round(Math.random() * 255) + ","
								+ Math.round(Math.random() * 255) + ","
								+ Math.round(Math.random() * 255) + ","
								+ 0.4 + ")";
						}
					};
				}
			};
		}]);

}());
