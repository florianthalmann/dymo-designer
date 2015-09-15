(function () {
	'use strict';
	
	angular.module('dmoDesigner.directives')
		.directive('dmoGraph', ['d3', function(d3) {
			return {
				restrict: 'EA',
				scope: {
					data: "=",
					viewparams: "=",
					label: "@",
					onClick: "&"
				},
				link: function(scope, iElement, iAttrs) {
					var force = d3.layout.force()
						.charge(-50)
						.linkDistance(70)
						.on("tick", function() {
								node.attr("cx", function(d) { return d.x; })
									.attr("cy", function(d) { return d.y; })
								link.attr("x1", function(d) { return d.source.x; })
									.attr("y1", function(d) { return d.source.y; })
									.attr("x2", function(d) { return d.target.x; })
									.attr("y2", function(d) { return d.target.y; });
						});
					
					var svg = d3.select(iElement[0])
						.append("svg")
						.attr("width", "100%");
					
					var node = svg.selectAll(".node"),
						link = svg.selectAll(".link");
					
					var nodes = force.nodes(),
						links = force.links();
					
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
					scope.render = function(graph) {
						var width = d3.select(iElement[0])[0][0].offsetWidth - 20; // 20 is for margins and can be changed
						var height = 500;
						svg.attr('height', height);
						
						force
							.size([width, height])
							.nodes(graph.nodes)
							.links(graph.links);
						
						link = link.data(force.links(), function(d) { return d.source.name + "-" + d.target.name; });
						link.enter().insert("line", ".node")
							.attr("stroke", getRgb)
							.style("opacity", 0.1)
							.style("stroke-width", 1);
						link.exit().remove();
						
						node = node.data(force.nodes(), function(d) { return d.name;});
						node.enter().append("circle")
							.attr("r", getR)
							.style("fill", getRgb)
							.style("opacity", 0.4)
							.call(force.drag)
							.on("click", function(d, i){return scope.onClick({item: d});});
						node
							.transition()
							.duration(500)
							.attr("r", getR);
						
						//only change color if not random or newly random
						if (scope.viewparams.color.name != "random" || previousColors != "random") {
							node
								.transition()
									.duration(0) // time of duration
									.style("fill", getRgb)
									.style("opacity", 0.4)
						}
						
						previousColors = scope.viewparams.color.name;
						
						node.exit().remove();
						
						force.start();
						
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
