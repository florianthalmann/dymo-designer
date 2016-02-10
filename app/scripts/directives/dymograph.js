(function () {
	'use strict';
	
	angular.module('dymoDesigner.directives')
		.directive('dymoGraph', ['d3', function(d3) {
			return {
				restrict: 'EA',
				scope: {
					data: "=",
					viewconfig: "=",
					playing: "=",
					label: "@",
					onClick: "&"
				},
				link: function(scope, iElement, iAttrs) {
					var force = d3.layout.force()
						.charge(-60)
						.linkDistance(100)
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
					
					var sizeScale, colorScale;
					
					var node = svg.selectAll(".node"),
						link = svg.selectAll(".link");
					
					var nodes = force.nodes(),
						links = force.links();
					
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
					
					scope.$watch('viewconfig', function(newVals, oldVals) {
						return scope.render(scope.data);
					}, true);
					
					scope.$watch('playing', function(newVals, oldVals) {
						var toSelect = newVals.filter(function(i) {return oldVals.indexOf(i) < 0;});
						var toDeselect = oldVals.filter(function(i) {return newVals.indexOf(i) < 0;});
						
						link.filter(function(d) { return toSelect.indexOf(d.target["@id"]) >= 0 })
							.style("stroke", "black")
							.style("opacity", 0.4);
						link.filter(function(d) { return toDeselect.indexOf(d.target["@id"]) >= 0 })
							.style("stroke", function(d) { return getHsl(d.target); })
							.style("opacity", 0.1);
						
						node.filter(function(d) { return toSelect.indexOf(d["@id"]) >= 0 })
							.style("fill", "black")
							.style("opacity", 0.6);
						node.filter(function(d) { return toDeselect.indexOf(d["@id"]) >= 0 })
							.style("fill", getHsl)
							.style("opacity", 0.3);
					}, true);
					
					// define render function
					scope.render = function(graph) {
						var width = d3.select(iElement[0])[0][0].offsetWidth - 20; // 20 is for margins and can be changed
						var height = 500;
						svg.attr('height', height);
						
						sizeScale = createScale(scope.viewconfig.size.log, scope.viewconfig.size.param).range([5, 30]),
						colorScale = createScale(scope.viewconfig.color.log, scope.viewconfig.color.param).rangeRound([45, 360]);
						
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
						link
							.transition()
								.duration(500)
								.attr("stroke", getHsl)
								.style("opacity", 0.1)
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
								.style("fill", getHsl)
								.style("opacity", 0.4)
								.attr("r", getR);
						node.exit().remove();
						
						force.start();
						
					};
					
					
					function getR(d) {
						return sizeScale(getVisualValue(d, scope.viewconfig.size.param, "size"));
					}
					
					function getHsl(d) {
						if (scope.playing.indexOf(d["@id"]) >= 0) {
							return "black";
						}
						return "hsl(" + colorScale(getVisualValue(d, scope.viewconfig.color.param, "color")) + ", 80%, 50%)";
					}
					
					function getRgb(d) {
						var color = "rgb(" + colorScale(getVisualValue(d, scope.viewconfig.color.param, "color")) + ","
							+ (255-colorScale(getVisualValue(d, scope.viewconfig.color))) + ","
							+ colorScale(getVisualValue(d, scope.viewconfig.color)) +")";
						return color;
					}
					
					function getVisualValue(dymo, parameter, key) {
						if (parameter.name == "random") {
							if (!prevRandomValues[dymo["@id"]]) {
								prevRandomValues[dymo["@id"]] = {};
							}
							if (!prevRandomValues[dymo["@id"]][key]) {
								prevRandomValues[dymo["@id"]][key] = Math.random() * parameter.max;
							}
							return prevRandomValues[dymo["@id"]][key];
						} else {
							if (prevRandomValues[dymo["@id"]] && prevRandomValues[dymo["@id"]][key]) {
								delete prevRandomValues[dymo["@id"]][key];
							}
							if (dymo[parameter.name]) {
								//not suitable for vectors!! (just takes the first element..)
								var value = dymo[parameter.name].value;
								if (value.length) {
									value = value[0];
								}
								return value;
							}
							return 0.00000001; //for log scale :(
						}
					}
				}
			};
		}]);

}());
