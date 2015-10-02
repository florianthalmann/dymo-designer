function FeatureLoader($scope, $http) {
	
	var mobileRdfUri = "rdf/mobile.n3";
	var multitrackRdfUri = "http://purl.org/ontology/studio/multitrack";
	var rdfsUri = "http://www.w3.org/2000/01/rdf-schema";
	
	var eventOntology = "http://purl.org/NET/c4dm/event.owl";
	var timelineOntology = "http://purl.org/NET/c4dm/timeline.owl";
	
	var features = {}
	
	this.loadFeature = function(uri, labelCondition, dmoManager) {
		var fileExtension = uri.slice(uri.indexOf('.')+1);
		if (fileExtension == 'n3') {
			loadFeatureFromRdf(uri, labelCondition, dmoManager);
		} else if (fileExtension == 'json') {
			loadFeatureFromJson(uri, labelCondition, dmoManager);
		}
	}
		
	function loadFeatureFromRdf(rdfUri, labelCondition, dmoManager) {
		if (features[rdfUri]) {
			setFeatureFromRdf(rdfUri, labelCondition, dmoManager)
		} else {
			$scope.featureLoadingThreads++;
			$http.get(rdfUri).success(function(data) {
				rdfstore.create(function(err, store) {
					store.load('text/turtle', data, function(err, results) {
						if (err) {
							console.log(err);
						}
						//for now looks at anything containing event times
						//?eventType <"+rdfsUri+"#subClassOf>* <"+eventOntology+"#Event> . \
						store.execute("SELECT ?xsdTime ?label \
						WHERE { ?event a ?eventType . \
						?event <"+eventOntology+"#time> ?time . \
						?time <"+timelineOntology+"#at> ?xsdTime . \
						OPTIONAL { ?event <"+rdfsUri+"#label> ?label . } }", function(err, results) {
							//console.log("execute");
							var times = [];
							for (var i = 0; i < results.length; i++) {
								//insert value/label pairs
								times.push({
									time: {value: toSecondsNumber(results[i].xsdTime.value)},
									label: {value: getValue(results[i].label)}
								});
							}
							//save so that file does not have to be read twice
							features[rdfUri] = times.sort(function(a,b){return a.time - b.time});
							setFeatureFromRdf(rdfUri, labelCondition, dmoManager);
							$scope.featureLoadingThreads--;
							$scope.$apply();
						});
					});
				});
			});
		}
	}
	
	function setFeatureFromRdf(rdfUri, labelCondition, dmoManager) {
		subset = features[rdfUri];
		if (labelCondition) {
			subset = features[rdfUri].filter(function(x) { return x.label == labelCondition; });
		}
		subset = subset.map(function(x) { return x.time; });
		dmoManager.setSegmentation(subset);
	}
	
	function loadFeatureFromJson(jsonUri, labelCondition, dmoManager) {
		$scope.featureLoadingThreads++;
		$http.get(jsonUri).success(function(json) {
			var results = json[Object.keys(json)[1]][0];
			var outputId = results.annotation_metadata.annotator.output_id;
			if (outputId == "beats" || outputId == "onsets") {
				results = results.data;
				if (labelCondition && results[0].label) {
					results = results.filter(function(x) { return x.label.value == labelCondition; });
				}
				dmoManager.addSegmentation(results);
			} else {
				dmoManager.addFeature(outputId, results.data)
			}
			$scope.featureLoadingThreads--;
			//$scope.$apply();
		});
	}
	
	function loadGraph(dmo, parameterUri, jsonUri) {
		$scope.featureLoadingThreads++;
		$http.get(jsonUri).success(function(json) {
			dmo.setGraph(json);
			$scope.featureLoadingThreads--;
			$scope.$apply();
		});
	}
	
	function toSecondsNumber(xsdDurationString) {
		return Number(xsdDurationString.substring(2, xsdDurationString.length-1));
	}
	
}