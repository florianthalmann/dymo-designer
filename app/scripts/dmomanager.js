function DmoManager(scheduler) {
	
	var self = this;
	
	var topDmo = null;
	this.graph = {nodes:[], links:[]};
	this.list = [];
	toRealDmo = {}; //saves all real dmos for now
	
	this.parameters = [createParameter("time"), createParameter("duration"), createParameter("random", 0, 1)];
	
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
		getParameter("chroma");
		getParameter("height");
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
		updateMinMaxes(dmo);
	}
	
	function setDmoParameter(dmo, param, value) {
		dmo[param.name] = value;
		updateMinMax(dmo, param);
	}
	
	function updateMinMaxes(dmo) {
		for (var i = 0; i < self.parameters.length; i++) {
			updateMinMax(dmo, self.parameters[i]);
		}
	}
	
	function updateMinMax(dmo, param) {
		if (dmo[param.name]) {
			if (param.max == undefined) {
				param.min = dmo[param.name];
				param.max = dmo[param.name];
			} else {
				param.min = Math.min(dmo[param.name], param.min);
				param.max = Math.max(dmo[param.name], param.max);
			}
		}
	}
	
	this.addFeature = function(name, data) {
		//iterate through all levels and add averages
		var parameter = getParameter(name);
		for (var i = 0; i < this.list.length; i++) {
			var laterValues = data.filter(
				function(x){return x.time.value > self.list[i].time}
			);
			var closestValue = laterValues[0].value[0];
			setDmoParameter(this.list[i], parameter, closestValue);
		}
	}
	
	function getParameter(name) {
		//if already exists return that
		for (var i = 0; i < self.parameters.length; i++) {
			if (self.parameters[i].name == name) {
				return self.parameters[i];
			}
		}
		//if doesn't exist make a new one
		var newParameter = createParameter(name);
		self.parameters.splice(self.parameters.length-1, 0, newParameter);
		return newParameter;
	}
	
	function createParameter(name, min, max) {
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
