function DmoManager(scheduler, $scope, $http) {
	
	var self = this;
	
	this.dymo;
	var currentTopDymo; //the top dymo for the current audio file
	var audioFileChanged = false;
	this.dymoGraph = {"nodes":[], "links":[]};
	this.similarityGraph = {"nodes":[], "links":[]};
	idToDymo = {};
	idToJson = {};
	
	this.features = [createFeature("level"), createFeature("random", 0, 1)];
	
	var maxDepth = 0;
	
	this.getRealDmo = function(dmo) {
		return idToDymo[dmo["@id"]];
	}
	
	this.setAudioFileChanged = function() {
		audioFileChanged = true;
		insertTopDymo();
	}
	
	this.addDmo = function() {
		//set as top-level dmo if none exists
		/*if (this.graph.nodes.length <= 0) {
			//createPitchHelixDmo();
			addTopDmo();
		//add as part if one exists
		} else {
			addPartDmo(this.graph.nodes[0], createNewDmo());
		}*/
		createSebastianDymo();
	}
	
	/*function createPitchHelixDmo() {
		chromaFeature = getFeature("chroma");
		heightFeature = getFeature("height");
		var previousDmo = null;
		for (var i = 0; i < 48; i++) {
			var currentDmo = createNewDmo();
			if (previousDmo) {
				addPartDmo(previousDmo, currentDmo);
			} else {
				addTopDmo(currentDmo);
			}
			var cos = Math.cos((i % 12) / 6 * Math.PI);
			var sin = Math.sin((i % 12) / 6 * Math.PI);
			setDymoFeature(currentDmo, chromaFeature, cos+1);
			setDymoFeature(currentDmo, heightFeature, sin+1+(i/4.5));
			previousDmo = currentDmo;
		}
	}*/
	
	function createSebastianDymo() {
		var dirPath = 'audio/Chopin_Op028-04_003_20100611-SMD/';
		var onsetFeature = getFeature("onset");
		var pitchFeature = getFeature("pitch");
		var topDymo = addDymo();
		setDymoFeature(topDymo, onsetFeature, 0);
		setDymoFeature(topDymo, pitchFeature, 0);
		$http.get('getsourcefilesindir/', {params:{directory:dirPath}}).success(function(data) {
			var allFilenames = data;
			allFilenames = allFilenames.filter(function(f) { return f.split("_").length - 1 > 4; });
			for (var i = 0; i < allFilenames.length; i++) {
				$scope.scheduler.addSourceFile(dirPath+allFilenames[i]);
				var nameSegments = allFilenames[i].split("_");
				var onsetSegment = nameSegments[nameSegments.length-1];
				var currentOnset = Number.parseInt(onsetSegment.substring(1, onsetSegment.indexOf('.')))/1000;
				var currentPitch = Number.parseInt(nameSegments[nameSegments.length-3].substring(1));
				var currentDymo = addDymo(topDymo, dirPath+allFilenames[i]);
				setDymoFeature(currentDymo, onsetFeature, currentOnset);
				setDymoFeature(currentDymo, pitchFeature, currentPitch);
			}
			topDymo.updatePartOrder(onsetFeature.name);
			//just to test similarity graph representation
			new DymoLoader(scheduler).loadGraphFromJson('bower_components/dymo-core/example/similarity.json', idToDymo, function() {
				updateGraphAndMap();
			}, $http);
		});
	}
	
	function createSebastianDymo2() {
		var dirPath = 'audio/scale_out/scale_single/';
		var onsetFeature = getFeature("onset");
		var pitchFeature = getFeature("pitch");
		var topDymo = addDymo();
		setDymoFeature(topDymo, onsetFeature, 0);
		setDymoFeature(topDymo, pitchFeature, 0);
		$http.get('getsourcefilesindir/', {params:{directory:dirPath}}).success(function(data) {
			var allFilenames = data;
			allFilenames = allFilenames.filter(function(f) { return f.split("_").length - 1 > 4; });
			for (var i = 0; i < allFilenames.length; i++) {
				$scope.scheduler.addSourceFile(dirPath+allFilenames[i]);
				var nameSegments = allFilenames[i].split("_");
				var currentOnset = Number.parseInt(nameSegments[4].substring(1))/1000;
				var currentPitch = Number.parseInt(nameSegments[2].substring(1));
				var currentDymo = addDymo(topDymo, dirPath+allFilenames[i]);
				setDymoFeature(currentDymo, onsetFeature, currentOnset);
				setDymoFeature(currentDymo, pitchFeature, currentPitch);
			}
			topDymo.updatePartOrder(onsetFeature.name);
		});
	}
	
	this.createRandomAreasDemo = function() {
		var brownianX = new BrownianControls();
		var brownianY = new BrownianControls();
		brownianX.maxStepSize.update(0.03);
		brownianY.maxStepSize.update(0.03);
		for (var i = 0; i < this.dymo.getParts().length; i++) {
			var currentArea = createRandomTriangle();
			var currentAreaFunction = PolygonTools.getPolygonFunctionString(currentArea);
			this.dymo.addMapping(new Mapping([brownianX.brownianControl, brownianY.brownianControl], false, currentAreaFunction, [this.dymo.getParts()[i]], PLAY));
			currentAreaFunction = PolygonTools.getInterpolatedPolygonFunctionString(currentArea);
			this.dymo.addMapping(new Mapping([brownianX.brownianControl, brownianY.brownianControl], false, currentAreaFunction, [this.dymo.getParts()[i]], AMPLITUDE));
		}
	}
	
	function createRandomTriangle() {
		return [{0:Math.random(),1:Math.random()},{0:Math.random(),1:Math.random()},{0:Math.random(),1:Math.random()}];
	}
	
	function insertTopDymo() {
		if (self.dymo) {
			var newDymo = new DynamicMusicObject("dymo" + getDymoCount(), scheduler, PARALLEL);
			newDymo.addPart(self.dymo);
			self.dymo = newDymo;
			updateGraphAndMap(self.dymo);
		}
	}
	
	function addDymo(parent, sourcePath) {
		var uri;
		if (parent) {
			uri = parent.getUri();
		}
		var newDymo = new DynamicMusicObject("dymo" + getDymoCount(), scheduler);
		if (!self.dymo) {
			self.dymo = newDymo;
		}
		if (parent) {
			parent.addPart(newDymo);
		}
		if (sourcePath) {
			newDymo.setSourcePath(sourcePath);
		}
		updateGraphAndMap(newDymo);
		return newDymo;
	}
	
	function updateGraphAndMap(dymo) {
		self.dymoGraph = self.dymo.toJsonHierarchyGraph();
		self.similarityGraph = self.dymo.toJsonSimilarityGraph();
		if (dymo) {
			var flatJson = dymo.toFlatJson();
			idToDymo[dymo.getUri()] = dymo;
			idToJson[dymo.getUri()] = flatJson;
			for (var i = 0; i < self.features.length; i++) {
				updateMinMax(dymo, self.features[i]);
			}
		}
	}
	
	function updateMinMax(dymo, feature) {
		var value = dymo.getFeature(feature.name);
		if (!isNaN(value)) {
			if (feature.max == undefined) {
				feature.min = value;
				feature.max = value;
			} else {
				feature.min = Math.min(value, feature.min);
				feature.max = Math.max(value, feature.max);
			}
		}
	}
	
	function getDymoCount() {
		return Object.keys(idToDymo).length;
	}
	
	this.addFeature = function(name, data) {
		//iterate through all levels and add averages
		var feature = getFeature(name);
		for (var i = 0; i < this.dymoGraph.nodes.length; i++) {
			var currentTime = this.dymoGraph.nodes[i]["time"].value;
			var currentDuration = this.dymoGraph.nodes[i]["duration"].value;
			var currentValues = data.filter(
				function(x){return currentTime <= x.time.value && x.time.value < currentTime+currentDuration}
			);
			var value = 0;
			if ($scope.selectedFeatureMode.name == "first") {
				value = currentValues[0].value[0];
			} else if ($scope.selectedFeatureMode.name == "mean") {
				value = currentValues.reduce(function(sum, i) { return sum + i.value[0]; }, 0) / currentValues.length;
			} else if ($scope.selectedFeatureMode.name == "median") {
				currentValues.sort(function(a, b) { return a.value[0] - b.value[0]; });
				var middleIndex = Math.floor(currentValues.length/2);
				value = currentValues[middleIndex].value[0];
				if (currentValues.length % 2 == 0) {
					value += currentValues[middleIndex-1].value[0];
				}
			}
			setDymoFeature(this.getRealDmo(this.dymoGraph.nodes[i]), feature, value);
		}
		updateGraphAndMap();
	}
	
	this.addSegmentation = function(segments, fileName) {
		if (getDymoCount() == 0) {
			currentTopDymo = addDymo(undefined, $scope.getFullSourcePath());
		} else if (audioFileChanged) {
			currentTopDymo = addDymo(self.dymo, $scope.getFullSourcePath());
			maxDepth = currentTopDymo.getLevel();
			audioFileChanged = false;
		}
		for (var i = 0; i < segments.length-1; i++) {
			parent = getSuitableParent(segments[i].time.value);
			var newDmo = addDymo(parent);
			var startTime = segments[i].time.value;
			setDymoFeature(newDmo, "time", startTime);
			setDymoFeature(newDmo, "duration", segments[i+1].time.value - startTime);
			if (segments[i].label) {
				setDymoFeature(newDmo, "segmentLabel", segments[i].label.value);
			}
			updateParentDuration(parent, newDmo);
		}
		updateGraphAndMap();
		maxDepth++;
	}
	
	function getSuitableParent(time) {
		var nextCandidate = currentTopDymo;
		var depth = currentTopDymo.getLevel();
		while (depth < maxDepth) {
			var parts = nextCandidate.getParts();
			if (parts.length > 0) {
				for (var i = 0; i < parts.length; i++) {
					if (parts[i].getFeature("time") <= time) {
						nextCandidate = parts[i];
						depth++;
					} else if (i == 0) {
						return nextCandidate;
					} else {
						break;
					}
				}
			} else {
				return nextCandidate;
			}
		}
		return nextCandidate;
	}
	
	function updateParentDuration(parent, newDymo) {
		var parentTime = parent.getFeature("time");
		var newDymoTime = newDymo.getFeature("time");
		if (!parentTime || newDymoTime < parentTime) {
			setDymoFeature(parent, "time", newDymoTime);
		}
		var parentDuration = parent.getFeature("duration");
		var newDymoDuration = newDymo.getFeature("duration");
		if (!parentDuration || parentTime+parentDuration < newDymoTime+newDymoDuration) {
			setDymoFeature(parent, "duration", newDymoTime+newDymoDuration - parentTime);
		}
	}
	
	function setDymoFeature(dymo, feature, value) {
		if (typeof feature === 'string' || feature instanceof String) {
			feature = getFeature(feature);
		}
		dymo.setFeature(feature.name, value);
		idToJson[dymo.getUri()][feature.name] = dymo.getFeatureJson(feature.name);
		updateMinMax(dymo, feature);
	}
	
	function getFeature(name) {
		//if already exists return that
		for (var i = 0; i < self.features.length; i++) {
			if (self.features[i].name == name) {
				return self.features[i];
			}
		}
		//if doesn't exist make a new one
		var newFeature = createFeature(name);
		self.features.splice(self.features.length-2, 0, newFeature);
		adjustViewConfig(newFeature);
		return newFeature;
	}
	
	function adjustViewConfig(newFeature) {
		if (self.features.length-2 == 1) {
			$scope.viewConfig.xAxis.param = newFeature;
		} else if (self.features.length-2 == 2) {
			$scope.viewConfig.yAxis.param = newFeature;
		} else if (self.features.length-2 == 3) {
			$scope.viewConfig.size.param = newFeature;
		}
	}
	
	function createFeature(name, min, max) {
		if (min != undefined && max != undefined) {
			return {name:name, min:min, max:max};
		}
		return {name:name, min:1000, max:0};
	}

}
