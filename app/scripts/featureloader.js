function OntologyLoader(dmoPath, $scope, $interval) {
	
	var mobileRdfUri = "rdf/mobile.n3";
	var multitrackRdfUri = "http://purl.org/ontology/studio/multitrack";
	var rdfsUri = "http://www.w3.org/2000/01/rdf-schema";
	
	var features = {};
	
	var eventOntology = "http://purl.org/NET/c4dm/event.owl";
	var timelineOntology = "http://purl.org/NET/c4dm/timeline.owl";
	
	function loadFeatures(dmo, parameterUri, uri, subsetCondition) {
		var fileExtension = uri.slice(uri.indexOf('.')+1);
		if (fileExtension == 'n3') {
			loadFeaturesFromRdf(dmo, parameterUri, uri, subsetCondition);
		} else if (fileExtension == 'json') {
			loadFeaturesFromJson(dmo, parameterUri, uri, subsetCondition);
		}
	}
		
	function loadFeaturesFromRdf(dmo, parameterUri, rdfUri, subsetCondition) {
		if (features[rdfUri]) {
			setSegmentationFromRdf(dmo, rdfUri, subsetCondition)
		} else {
			//console.log("start");
			$scope.featureLoadingThreads++;
			$http.get(rdfUri).success(function(data) {
				//console.log("get");
				rdfstore.create(function(err, store) {
					//console.log("create");
					store.load('text/turtle', data, function(err, results) {
						//console.log("load");
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
								times.push({ time: toSecondsNumber(results[i].xsdTime.value), label: getValue(results[i].label) });
							}
							//save so that file does not have to be read twice
							features[rdfUri] = times.sort(function(a,b){return a.time - b.time});
							setSegmentationFromRdf(dmo, rdfUri, subsetCondition);
							$scope.featureLoadingThreads--;
							$scope.$apply();
						});
					});
				});
			});
		}
	}
	
	function setSegmentationFromRdf(dmo, rdfUri, subsetCondition) {
		subset = features[rdfUri];
		if (subsetCondition) {
			subset = features[rdfUri].filter(function(x) { return x.label == subsetCondition; });
		}
		subset = subset.map(function(x) { return x.time; });
		dmo.setSegmentation(subset);
	}
	
	function loadFeaturesFromJson(dmo, parameterUri, jsonUri, subsetCondition) {
		if (features[jsonUri]) {
			setSegmentationFromRdf(dmo, jsonUri, subsetCondition)
		} else {
			$scope.featureLoadingThreads++;
			$http.get(jsonUri).success(function(json) {
				if (json.beat) {
					json = json.beat[0].data;
					if (subsetCondition) {
						json = json.filter(function(x) { return x.label.value == subsetCondition; });
					}
					json = json.map(function(x) { return x.time.value; });
				}
				dmo.setSegmentation(json);
				
				$scope.featureLoadingThreads--;
				$scope.$apply();
			});
		}
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