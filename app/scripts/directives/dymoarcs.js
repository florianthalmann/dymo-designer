(function () {
	'use strict';
	
	angular.module('dymoDesigner.directives')
		.directive('dymoArcs', ['d3', function(d3) {
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
					var svg = d3.select(iElement[0])
						.append("svg")
						.attr("width", "100%");
					
					var height = 500;
					var padding = 50;
					var previousColors = null;
					var prevRandomValues = {};
					
					var xScale, yScale, sizeScale, heightScale, colorScale;
					
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
					
					scope.$watch('viewconfig', function(newVals, oldVals) {
						return scope.render(scope.data);
					}, true);
					
					scope.$watch('playing', function(newVals, oldVals) {
						
					}, true);
					
					// define render function
					scope.render = function(data, changedSelection){
						// setup variables
						var width = d3.select(iElement[0])[0][0].offsetWidth - 20; // 20 is for paddings and can be changed
						// set the height based on the calculations above
						svg.attr('height', height);
						
						xScale = createScale(scope.viewconfig.xAxis.log, scope.viewconfig.xAxis.param).range([padding, width-padding]),
						yScale = d3.scale.linear().domain([0, 4]).range([height-padding, padding]),
						sizeScale = createScale(scope.viewconfig.size.log, scope.viewconfig.size.param).range([5, 40]),
						heightScale = d3.scale.linear().domain([0, 4]).range([0, height-(2*padding)]),
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
						
						var circles = svg.selectAll("circle").data(data["nodes"]);
						
						circles.enter()
							.append("circle")
							.on("click", function(d, i){return scope.onClick({item: d});})
							.style("fill", getHsl)
							.style("opacity", 0.2)
							.attr("r", 0)
							.attr("cx", getXValue)
							.attr("cy", getYValue)
							.transition()
								.duration(500) // time of duration
								.attr("r", getR); // width based on scale
						
						circles
							.transition()
								.duration(500) // time of duration
								.style("fill", getHsl)
								.style("opacity", 0.2)
								.attr("r", getR) // width based on scale
								.attr("cx", getXValue)
								.attr("cy", getYValue);
						
						circles.exit().remove();
						
						// scale to generate radians (just for lower-half of circle)
						var radians = d3.scale.linear().range([-Math.PI / 2, Math.PI / 2]);

		    // path generator for arcs (uses polar coordinates)
		    var arc = d3.svg.line.radial()
		        .interpolate("basis")
		        .tension(0)
		        .angle(function(d) { return radians(d); });

		    // add links
						var links = svg.selectAll(".link").data(data["links"]);
						links.enter()
		        .append("path")
		        .attr("class", "link")
						.style("stroke", function(d, i) {return getHsl(d.source);})
						//.style("fill", function(d, i) {return getHsl(d.source);})
						.style("opacity", 0.2)
		        .attr("transform", function(d, i) {
		            // arc will always be drawn around (0, 0)
		            // shift so (0, 0) will be between source and target
		            var xshift = getXValue(d.source) + (getXValue(d.target) - getXValue(d.source)) / 2;
		            var yshift = getYValue();
		            return "translate(" + xshift + ", " + yshift + ")";
		        })
		        .attr("d", function(d, i) {
		            // get x distance between source and target
		            var xdist = Math.abs(getXValue(d.source) - getXValue(d.target));

		            // set arc radius based on x distance
		            arc.radius(xdist / 2);

		            // want to generate 1/3 as many points per pixel in x direction
		            var points = d3.range(0, Math.ceil(xdist / 3));

		            // set radian scale domain
		            radians.domain([0, points.length - 1]);

		            // return path for arc
		            return arc(points);
		        });
						
					};
					
					
					function getXValue(d, i) {
						return xScale(getVisualValue(d, scope.viewconfig.xAxis.param, "x"));
					}
					
					function getYValue(d, i) {
						return yScale(0);
					}
					
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
							return 0;//0.00000001; //for log scale :(
						}
					}
					
				}
			};
		}]);

}());
