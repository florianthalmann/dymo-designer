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
			    .charge(-400)
			    .linkDistance(120)
			    .on("tick", tick);
					
					var svg = d3.select(iElement[0])
						.append("svg")
						.attr("width", "100%");

						var node = svg.selectAll(".node"),
						    link = svg.selectAll(".link");
								
								function tick() {
								  node.attr("cx", function(d) { return d.x; })
								      .attr("cy", function(d) { return d.y; })

								  link.attr("x1", function(d) { return d.source.x; })
								      .attr("y1", function(d) { return d.source.y; })
								      .attr("x2", function(d) { return d.target.x; })
								      .attr("y2", function(d) { return d.target.y; });
								}
					
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
					scope.render = function(graph){
						var width = d3.select(iElement[0])[0][0].offsetWidth - 20; // 20 is for margins and can be changed
						var height = 500;
						svg.attr('height', height);
						
						force
			    .charge(-400)
			    .linkDistance(120)
						.size([width, height])
						.nodes(graph.nodes)
						.links(graph.links)
						.on("tick", tick);
						
				 node = svg.selectAll(".node"),
				    link = svg.selectAll(".link");
						
						link = link.data(force.links(), function(d) { return d.source.name + "-" + d.target.name; });
						  link.enter().insert("line", ".node").attr("class", "link");
						  link.exit().remove();

						  node = node.data(force.nodes(), function(d) { console.log(d.name); return d.name;});
						  node.enter().append("circle").attr("class", function(d) { return "node " + d.name; }).attr("r", 8).call(force.drag);
						  node.exit().remove();
							console.log("RENDER " + node + " " + force.nodes());

						  force.start();
						
						
						
						/*// setup variables
						var width = d3.select(iElement[0])[0][0].offsetWidth - 20; // 20 is for margins and can be changed
						// set the height based on the calculations above
						var height = 500;
						svg.attr('height', height);
						
						force
						.size([width, height])
						.nodes(graph.nodes)
						.links(graph.links);
						
					var node = svg.selectAll(".node"),
					    link = svg.selectAll(".link");
						
							link = link.data(force.links(), function(d) { return d.source.id + "-" + d.target.id; });
							  link.enter().insert("line", ".node").attr("class", "link");
							  link.exit().remove();
							
				/*var link = svg.selectAll(".link")
				      .data(graph.links)
				    .enter().append("line")
				      .attr("class", "link")
				      .style("stroke-width", function(d) { return Math.sqrt(d.value); });*/
							
								/*node = node.data(force.nodes(), function(d) { return d.id;});
								  node.enter().append("circle").attr("class", function(d) { return "node " + d.id; }).attr("r", 8)
										.style("fill", function(d) { return "rgba(" + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + ",0.5)" })
								  node.exit().remove();
							
							force.start();

				  /*var node = svg.selectAll(".node")
				      .data(graph.nodes)
				    .enter().append("circle")
							.attr("class", "node")
				      .attr("r", 5)
				      .style("fill", function(d) { return "rgba(" + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + ",0.5)" })
				      .call(force.drag);*/
						
							
						
						/*//create the rectangles for the bar chart
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
								.attr("x", function(d, i){return (i+1) * width/(data.length+1) - 30;})*/
					};
				}
			};
		}]);

}());
