(function () {
	'use strict';
	
	angular.module('dmoDesigner.directives')
		.directive('mappingsPainter', ['d3', function(d3) {
			return {
				restrict: 'EA',
				scope: {
					data: "=",
					viewconfig: "=",
					playing: "=",
					label: "@",
					onClick: "&",
					addPoint: "&",
					finishArea: "&"
				},
				link: function(scope, iElement, iAttrs) {
					var svg = d3.select(iElement[0])
						.append("svg")
						.attr("width", "100%")
						.on("mousedown", mousedown)
						.on("mouseup", mouseup);
					
					var height = 600;
					var padding = 50;
					
					var xScale, yScale, sizeScale, colorScale;
					
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
					
					var lineFunction = d3.svg.line()
						.x(function(d, i) { return xScale(d["0"]); })
						.y(function(d, i) { return yScale(d["1"]); })
						.interpolate("basic");
					
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
					scope.render = function(data, changedSelection){
						// setup variables
						var width = d3.select(iElement[0])[0][0].offsetWidth - 20; // 20 is for paddings and can be changed
						// set the height based on the calculations above
						svg.attr('height', height);
						
						xScale = createScale(scope.viewconfig.xAxis.log, scope.viewconfig.xAxis.param).range([padding, width-padding]),
						yScale = createScale(scope.viewconfig.yAxis.log, scope.viewconfig.yAxis.param).range([height-padding, padding]),
						sizeScale = createScale(scope.viewconfig.size.log, scope.viewconfig.size.param).range([10, 40]),
						colorScale = createScale(scope.viewconfig.color.log, scope.viewconfig.color.param).rangeRound([45, 360]);
						
						function createScale(log, param) {
							if (log) {
								var min = param.min;
								if (min <= 0) {
									min = 0.0000001;
								}
								return d3.scale.log().base(2).domain([min, param.max]);
							}
							return d3.scale.linear().domain([param.min, param.max]);
						}
						
						xAxis.scale(xScale).tickFormat(d3.format(".g"));
						yAxis.scale(yScale).tickFormat(d3.format(".g"));
						
						
						//update axes
						svg.selectAll("g.xaxis")
							.call(xAxis);
						svg.selectAll("g.yaxis")
							.call(yAxis);
							
						var areas = svg.selectAll(".area").data(data);
					
						
						areas.enter()
							.append("path")
							.attr("class", "area")
							.attr("d", lineFunction)
							.on("click", function(d, i){ return scope.onClick({item: d});})
							.attr("stroke", "black")
							.attr("stroke-width", 2)
							.style("opacity", 0.3)
							.attr("fill", getRandomRgb());
						
						areas.transition()
							.duration(100) // time of duration
							.attr("d", lineFunction);
						
						areas.exit().remove();
						
					};
					
					function mousedown() {
						addPoint(d3.mouse(this));
						svg.on("mousemove", mousemove);
					}
					
					function mousemove() {
						addPoint(d3.mouse(this));
					}
					
					function addPoint(mouse) {
						var point = {item:[xScale.invert(mouse[0]), yScale.invert(mouse[1])]}
						scope.addPoint(point);
					}
					
					function mouseup() {
						svg.on("mousemove", null);
						scope.finishArea();
					}
					
					function getRandomRgb() {
						return "rgba(" + Math.round(Math.random() * 255) + ","
							+ Math.round(Math.random() * 255) + ","
							+ Math.round(Math.random() * 255) + ",0.5)";
					}
					
				}
			};
		}]);

}());
