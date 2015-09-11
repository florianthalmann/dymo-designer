function DmoWriter(dmoPath) {
	
	var RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
	var mobileRdfUri = "rdf/mobile.n3";
	var multitrackRdfUri = "http://purl.org/ontology/studio/multitrack";
	var rdfsUri = "http://www.w3.org/2000/01/rdf-schema";
	
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