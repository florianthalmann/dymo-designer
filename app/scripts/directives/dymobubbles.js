(function () {
	'use strict';
	
	angular.module('dymoDesigner.directives')
		.directive('dymoBubbles', ['d3', function(d3) {
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
						svg.attr('height', 500);
						
						//create the rectangles for the bar chart
						var circles = svg.selectAll("circle").data(data);
						
						circles.enter()
							.append("circle")
							.on("click", function(d, i){return scope.onClick({item: d});})
							.style("fill", function() {return "rgba(" + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + ",0.5)"})
							.attr("r", 1)
							.attr("cx", function(d, i){return (i+1) * width/(data.length+1);})
							.attr("cy", 250) // height + margin between bars
							.transition()
								.duration(0) // time of duration
								.attr("r", function(d){ return d.size/(1000/width); }); // width based on scale
							
						circles
							.transition()
								.duration(0) // time of duration
								.attr("r", function(d){return d.size/(1000/width);}) // width based on scale
								.attr("cx", function(d, i){return (i+1) * width/(data.length+1);});
						
						var text = svg.selectAll("text").data(data);
						
						text.enter()
								.append("text")
								.attr("fill", "#fff")
								.attr("y", 255)
								.attr("x", function(d, i){return (i+1) * width/(data.length+1) - 30;})
								.text(function(d){return d[scope.label];});
						
						text
							.transition()
								.duration(0) // time of duration
								.attr("x", function(d, i){return (i+1) * width/(data.length+1) - 30;})
					};
				}
			};
		}]);

}());
