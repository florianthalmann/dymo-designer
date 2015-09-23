function DmoManager(scheduler) {
	
	var self = this;
	
	var topDmo = null;
	this.graph = {nodes:[], links:[]};
	this.list = [];
	toRealDmo = {}; //saves all real dmos for now
	
	this.features = [createFeature("time"), createFeature("duration"), createFeature("random", 0, 1)];
	
	var maxDepth = 0;
	
	this.getRealTopDmo = function() {
		return toRealDmo[topDmo];
	}
	
	this.addDmo = function() {
		var newDmo = createNewDmo();
		//set as top-level dmo if none exists
		if (topDmo == null) {
			setTopLevelDmo(newDmo);
		//add as child if one exists
		} else {
			addChildDmo(topDmo, newDmo);
		}
		//createPitchHelixDmo();
	}
	
	function createPitchHelixDmo() {
		getFeature("chroma");
		getFeature("height");
		var previousDmo = null;
		for (var i = 0; i < 48; i++) {
			var currentDmo = createNewDmo(1,1);
			var cos = Math.cos((i % 12) / 6 * Math.PI);
			var sin = Math.sin((i % 12) / 6 * Math.PI);
			currentDmo.chroma = cos+1;
			currentDmo.height = sin+1+(i/4.5);
			if (previousDmo) {
				addChildDmo(previousDmo, currentDmo);
			} else {
				setTopLevelDmo(currentDmo);
			}
			previousDmo = currentDmo;
		}
	}
	
	function setTopLevelDmo(dmo) {
		registerDmo(dmo);
		topDmo = dmo;
	}
	
	function addChildDmo(parent, child) {
		registerDmo(child);
		parent.children.push(child);
		var parentIndex = self.list.indexOf(parent);
		var childIndex = self.list.indexOf(child);
		var link = {"source":parent, "target":child, "value":1};
		self.graph.links.push(link);
		toRealDmo[parent].addChild(toRealDmo[child]);
	}
	
	function registerDmo(dmo) {
		self.list.push(dmo);
		self.graph.nodes.push(dmo);
		toRealDmo[dmo] = new DynamicMusicObject(dmo.name, scheduler);
		toRealDmo[dmo].setSegment(dmo.time, dmo.duration);
		updateMinMaxes(dmo);
	}
	
	function setDmoFeature(dmo, feature, value) {
		dmo[feature.name] = value;
		updateMinMax(dmo, feature);
	}
	
	function updateMinMaxes(dmo) {
		for (var i = 0; i < self.features.length; i++) {
			updateMinMax(dmo, self.features[i]);
		}
	}
	
	function updateMinMax(dmo, feature) {
		if (dmo[feature.name]) {
			if (feature.max == undefined) {
				feature.min = dmo[feature.name];
				feature.max = dmo[feature.name];
			} else {
				feature.min = Math.min(dmo[feature.name], feature.min);
				feature.max = Math.max(dmo[feature.name], feature.max);
			}
		}
	}
	
	this.addFeature = function(name, data) {
		//iterate through all levels and add averages
		var feature = getFeature(name);
		for (var i = 0; i < this.list.length; i++) {
			var laterValues = data.filter(
				function(x){return x.time.value > self.list[i].time}
			);
			var closestValue = laterValues[0].value[0];
			setDmoFeature(this.list[i], feature, closestValue);
		}
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
		self.features.splice(self.features.length-1, 0, newFeature);
		return newFeature;
	}
	
	function createFeature(name, min, max) {
		if (min != undefined && max != undefined) {
			return {name:name, min:min, max:max};
		}
		return {name:name, min:1, max:0};
	}
	
	this.addSegmentation = function(segments) {
		for (var i = 0; i < segments.length-1; i++) {
			var newDmo = createNewDmo();
			newDmo.time = segments[i].time.value;
			newDmo.duration = segments[i+1].time.value - newDmo.time;
			newDmo.segmentLabel = segments[i].label.value;
			parent = getSuitableParent(newDmo);
			updateParentDuration(parent, newDmo);
			addChildDmo(parent, newDmo);
		}
		maxDepth++;
	}
	
	function getSuitableParent(dmo) {
		var nextCandidate = topDmo;
		var depth = 0;
		while (depth < maxDepth) {
			var children = nextCandidate.children;
			if (children.length > 0) {
				for (var i = 0; i < children.length; i++) {
					if (children[i].time <= dmo.time) {
						nextCandidate = children[i];
						depth++;
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
	
	function updateParentDuration(parent, newDmo) {
		if (!parent.time || newDmo.time < parent.time) {
			parent.time = newDmo.time;
		}
		if (!parent.duration || parent.time+parent.duration < newDmo.time+newDmo.duration) {
			parent.duration = (newDmo.time+newDmo.duration) - parent.time;
		}
		updateMinMaxes(parent);
	}
	
	var createNewDmo = function(time, duration) {
		if (!time) {
			time = Math.random();
		}
		if (!duration) {
			duration = Math.random();
		}
		return {
			name: "dmo" + (self.list.length+1),
			time: time,
			duration: duration,
			children: []
		}
	}

}
