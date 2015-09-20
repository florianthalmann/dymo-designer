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
					var padding = 50;
					var previousColors = null;
					var prevRandomValues = {};
					
					// Axes. Note the inverted domain for the y-scale: bigger is up!
					var xAxis = d3.svg.axis().orient("bottom"),
					yAxis = d3.svg.axis().orient("left");
					
					svg.append("g")
						.attr("class", "xaxis")  //Assign "axis" class
						.attr("transform", "translate(0," + (height - padding) + ")")
						.call(xAxis);
				
					svg.append("g")
						.attr("class", "yaxis")
						.attr("transform", "translate(" + padding + ",0)")
						.call(yAxis);
					
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
						var width = d3.select(iElement[0])[0][0].offsetWidth - 20; // 20 is for paddings and can be changed
						// set the height based on the calculations above
						svg.attr('height', height);
						
						var xScale = createScale(scope.viewparams.xAxis.log).domain([0, scope.viewparams.xAxis.param.max]).range([padding, width-padding]),
						yScale = createScale(scope.viewparams.yAxis.log).domain([0, scope.viewparams.yAxis.param.max]).range([height-padding, padding]),
						sizeScale = createScale(scope.viewparams.size.log).domain([0, scope.viewparams.size.param.max]).range([10, 40]),
						colorScale = createScale(scope.viewparams.color.log).domain([0, scope.viewparams.color.param.max]).rangeRound([0, 360]);
						
						function createScale(log) {
							if (log == true) {
								return d3.scale.sqrt();
							}
							return d3.scale.linear();
						}
						
						xAxis.scale(xScale);
						yAxis.scale(yScale);
						
						//update axes
						svg.selectAll("g.xaxis")
							.call(xAxis);
						svg.selectAll("g.yaxis")
							.call(yAxis);
						
						
						var circles = svg.selectAll("circle").data(data.nodes);
						
						circles.enter()
							.append("circle")
							.on("click", function(d, i){return scope.onClick({item: d});})
							.style("fill", getHsl)
							.style("opacity", 0.3)
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
						
						circles.exit().remove();
						
						var lines = svg.selectAll(".edge").data(data.links);
						
						lines.enter()
							.append("line")
							.attr("class", "edge")
							.style("stroke", function(d) { return getHsl(d.target); })
							.style("opacity", 0.1)
							.style("stroke-width", 2)
							//get initial values from animated svg, beautiful hack!
							.attr("x1", function(d) { return circles.filter(function(c, i) { return c == d.source; })[0][0].cx.baseVal.value; })
							.attr("y1", function(d) { return circles.filter(function(c, i) { return c == d.source; })[0][0].cy.baseVal.value; })
							.attr("x2", function(d) { return circles.filter(function(c, i) { return c == d.target; })[0][0].cx.baseVal.value; })
							.attr("y2", function(d) { return circles.filter(function(c, i) { return c == d.target; })[0][0].cy.baseVal.value; })
							.transition()
								.duration(500)
								.attr("x1", function(d) { return getXValue(d.source); })
								.attr("y1", function(d) { return getYValue(d.source); })
								.attr("x2", function(d) { return getXValue(d.target); })
								.attr("y2", function(d) { return getYValue(d.target); });
						
						lines
							.transition()
								.duration(500) // time of duration
								.attr("x1", function(d) { return getXValue(d.source); })
								.attr("y1", function(d) { return getYValue(d.source); })
								.attr("x2", function(d) { return getXValue(d.target); })
								.attr("y2", function(d) { return getYValue(d.target); });
						
						lines.exit().remove();
						
						//only change color if not random or newly random
						if (scope.viewparams.color.param.name != "random" || previousColors != "random") {
							circles
								.transition()
									.duration(500) // time of duration
									.style("fill", getHsl)
									.style("opacity", 0.3)
							
							lines
								.transition()
									.duration(500) // time of duration
									.style("stroke", function(d) { return getHsl(d.target); })
									.style("opacity", 0.1)
						}
						
						previousColors = scope.viewparams.color.param.name;
						
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
							return xScale(getVisualValue(d, scope.viewparams.xAxis.param, "x"));
						}
						
						function getYValue(d, i) {
							return yScale(getVisualValue(d, scope.viewparams.yAxis.param, "y"));
						}
						
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
								if (!prevRandomValues[dmo.name]) {
									prevRandomValues[dmo.name] = {};
								}
								if (!prevRandomValues[dmo.name][key]) {
									prevRandomValues[dmo.name][key] = Math.random() * parameter.max;
								}
								return prevRandomValues[dmo.name][key];
							} else {
								if (prevRandomValues[dmo.name] && prevRandomValues[dmo.name][key]) {
									delete prevRandomValues[dmo.name][key];
								}
								return dmo[parameter.name];
							}
						}
					};
				}
			};
		}]);

}());
