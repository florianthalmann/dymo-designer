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
					var prevRandomValues = {};
					
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
						
						var sizeScale = createScale(scope.viewparams.size.log, scope.viewparams.size.param).range([10, 100]),
						colorScale = createScale(scope.viewparams.color.log, scope.viewparams.color.param).rangeRound([45, 360]);
						
						function createScale(log, param) {
							if (log == true) {
								return d3.scale.log().base(2).domain([param.min, param.max]);
							}
							return d3.scale.linear().domain([param.min, param.max]);
						}
						
						force
							.size([width, height])
							.nodes(graph.nodes)
							.links(graph.links);
						
						link = link.data(force.links(), function(d) { return d.source["@id"] + "-" + d.target["@id"]; });
						link.enter().insert("line", ".node")
							.attr("stroke", getHsl)
							.style("opacity", 0.1)
							.style("stroke-width", 1);
						link.exit().remove();
						
						node = node.data(force.nodes(), function(d) { return d["@id"];});
						node.enter().append("circle")
							.attr("r", getR)
							.style("fill", getHsl)
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
									.duration(500) // time of duration
									.style("fill", getHsl)
									.style("opacity", 0.4)
						}
						
						previousColors = scope.viewparams.color.name;
						
						node.exit().remove();
						
						force.start();
						
						function getR(d) {
							return sizeScale(getVisualValue(d, scope.viewparams.size.param, "size"));
						}
						
						function getHsl(d) {
							return "hsl(" + colorScale(getVisualValue(d, scope.viewparams.color.param, "color")) + ", 80%, 50%)";
						}
						
						function getRgb(d) {
							var color = "rgb(" + colorScale(getVisualValue(d, scope.viewparams.color.param, "color")) + ","
								+ (255-colorScale(getVisualValue(d, scope.viewparams.color))) + ","
								+ colorScale(getVisualValue(d, scope.viewparams.color)) +")";
							return color;
						}
						
						function getVisualValue(dmo, parameter, key) {
							if (parameter.name == "random") {
								if (!prevRandomValues[dmo["@id"]]) {
									prevRandomValues[dmo["@id"]] = {};
								}
								if (!prevRandomValues[dmo["@id"]][key]) {
									prevRandomValues[dmo["@id"]][key] = Math.random() * parameter.max;
								}
								return prevRandomValues[dmo["@id"]][key];
							} else {
								if (prevRandomValues[dmo["@id"]] && prevRandomValues[dmo["@id"]][key]) {
									delete prevRandomValues[dmo["@id"]][key];
								}
								if (dmo[parameter.name]) {
									return dmo[parameter.name].value;
								}
								return 0.00000001; //for log scale :(
							}
						}
					};
				}
			};
		}]);

}());
