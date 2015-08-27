function DmoWriter(dmoPath, $scope, $interval) {
	
	var RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
	var mobileRdfUri = "rdf/mobile.n3";
	var multitrackRdfUri = "http://purl.org/ontology/studio/multitrack";
	var rdfsUri = "http://www.w3.org/2000/01/rdf-schema";
	
	/*this.writeDmo = function(uri) {
		rdfstore.create(function(err, store) {
			store.setPrefix("mb", "rdf/mobile.n3#");
			var graph = store.rdf.createGraph();
			addDmo(store, graph);
			addDmo(store, graph);
			console.log(graph.toNT());
		});
	}
	
	function addDmo(store, graph) {
		graph.add(store.rdf.createTriple(
			store.rdf.createBlankNode(),
			store.rdf.createNamedNode(RDF_TYPE),
			store.rdf.createNamedNode("mb:DMO")
		));
	}*/
	
	this.writeDmo = function(uri) {
		var writer = N3.Writer({ prefixes: { 'mb': 'rdf/mobile.n3#' } });
		addDmo(writer);
		writer.end(function (error, result) { console.log(result); });
	}
	
	function addDmo(writer) {
		writer.addTriple('_:',
			RDF_TYPE,
			'mb:DMO');
		writer.addTriple('_:',
			'mb:hasChild',
			'mb:test2');
	}
}