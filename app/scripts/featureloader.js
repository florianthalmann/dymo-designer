function FeatureLoader($scope, $http) {
	
	var mobileRdfUri = "rdf/mobile.n3";
	var multitrackRdfUri = "http://purl.org/ontology/studio/multitrack";
	var rdfsUri = "http://www.w3.org/2000/01/rdf-schema";
	
	var eventOntology = "http://purl.org/NET/c4dm/event.owl";
	var timelineOntology = "http://purl.org/NET/c4dm/timeline.owl";
	
	var features = {}
	
	this.loadSegmentation = function(uri, labelCondition, callback) {
		var fileExtension = uri.slice(uri.indexOf('.')+1);
		if (fileExtension == 'n3') {
			loadSegmentationFromRdf(uri, labelCondition, callback);
		} else if (fileExtension == 'json') {
			loadSegmentationFromJson(uri, labelCondition, callback);
		}
	}
		
	function loadSegmentationFromRdf(rdfUri, labelCondition, callback) {
		if (features[rdfUri]) {
			setSegmentationFromRdf(rdfUri, labelCondition, callback)
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
							setSegmentationFromRdf(rdfUri, labelCondition, callback);
							$scope.featureLoadingThreads--;
							$scope.$apply();
						});
					});
				});
			});
		}
	}
	
	function setSegmentationFromRdf(rdfUri, labelCondition, callback) {
		subset = features[rdfUri];
		if (labelCondition) {
			subset = features[rdfUri].filter(function(x) { return x.label == labelCondition; });
		}
		subset = subset.map(function(x) { return x.time; });
		callback(subset);
	}
	
	function loadSegmentationFromJson(jsonUri, labelCondition, callback) {
		$scope.featureLoadingThreads++;
		$http.get(jsonUri).success(function(json) {
			if (json.beat) {
				json = json.beat[0].data;
				if (labelCondition) {
					json = json.filter(function(x) { return x.label.value == labelCondition; });
				}
				//json = json.map(function(x) { return x.time.value; });
			}
			callback(json);
			
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