(function () {
	'use strict';
	
	angular.module('dmoDesigner.directives')
		.directive('dmoGraph', ['d3', function(d3) {
			return {
				restrict: 'EA',
				scope: {
					data: "=",
					label: "@",
					onClick: "&"
				},
				link: function(scope, iElement, iAttrs) {
					var force = d3.layout.force()
						.charge(-300)
						.linkDistance(170)
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
					scope.render = function(graph) {
						console.log(graph);
						var width = d3.select(iElement[0])[0][0].offsetWidth - 20; // 20 is for margins and can be changed
						var height = 500;
						svg.attr('height', height);
						
						force
							.size([width, height])
							.nodes(graph.nodes)
							.links(graph.links);
						
						//console.log(link);
						var alpha = 0.1;
						link = link.data(force.links(), function(d) { console.log(d.source.name + "-" + d.target.name); return d.source.name + "-" + d.target.name; });
						link.enter().insert("line", ".node").attr('stroke', getRandomRgba).style("stroke-width", 1);
						link.exit().remove();
						
						alpha = 0.4;
						node = node.data(force.nodes(), function(d) { console.log(d.name); return d.name;});
						node.enter().append("circle")
							.attr("r", function(d){return d.size/(5000/width)+30})
							.style("fill", getRandomRgba)
							.call(force.drag)
							.on("click", function(d, i){return scope.onClick({item: d});});
						node
							.transition()
							.duration(0)
							.attr("r", function(d){return d.size/(5000/width)+30})
						node.exit().remove();
						
						force.start();
						
						
						function getRandomRgba() {
							return "rgba(" + Math.round(Math.random() * 255) + ","
								+ Math.round(Math.random() * 255) + ","
								+ Math.round(Math.random() * 255) + ","
								+ alpha + ")";
						}
					};
				}
			};
		}]);

}());
