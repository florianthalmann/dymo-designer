function DynamicMusicObject(uri, scheduler, type, manager) {
	
	var parentDMO = null;
	var parts = [];
	var partsPlayed = 0;
	var isPlaying = false;
	var sourcePath;
	var graph = null;
	var skipProportionAdjustment = false;
	var previousIndex = null;
	var segmentStart, segmentDuration;
	
	this.getUri = function() {
		return uri;
	}
	
	this.setParent = function(dmo) {
		parentDMO = dmo;
	}
	
	this.getParent = function() {
		return parentDMO;
	}
	
	this.addPart = function(dmo) {
		dmo.setParent(this);
		parts.push(dmo);
	}
	
	this.setSourcePath = function(path) {
		sourcePath = path;
	}
	
	this.setSegment = function(start, duration) {
		segmentStart = start;
		segmentDuration = duration;
	}
	
	this.setGraph = function(g) {
		graph = g;
	}
	
	this.getGraph = function() {
		return graph;
	}
	
	this.getSourcePath = function() {
		if (parentDMO && !sourcePath) {
			return parentDMO.getSourcePath();
		}
		return sourcePath;
	}
	
	//positive change in play affects parts
	this.updatePlay = function(change) {
		//ask their parts to get appropriate segment
		if (type == DmoTypes.SEQUENCE) {
			
		}
		if (parts.length > 0) {
			for (var i = 0; i < parts.length; i++) {
				parts[i].updatePlay(change);
			}
		} else {
			if (change > 0) {
				scheduler.play(this);
			} else {
				scheduler.stop(this);
			}
		}
	}
	
	//change in amplitude does not affect parts
	this.updateAmplitude = function(change) {
		scheduler.updateAmplitude(this, change);
		if (!sourcePath) {
			for (var i = 0; i < parts.length; i++) {
				parts[i].amplitude.relativeUpdate(change);
			}
		}
	}
	
	//change in amplitude does not affect parts
	this.updatePlaybackRate = function(change) {
		scheduler.updatePlaybackRate(this, change);
		if (!sourcePath) {
			for (var i = 0; i < parts.length; i++) {
				parts[i].playbackRate.relativeUpdate(change);
			}
		}
	}
	
	//change in pan affects pan of parts
	this.updatePan = function(change) {
		scheduler.updatePan(this, change);
		for (var i = 0; i < parts.length; i++) {
			parts[i].pan.relativeUpdate(change);
		}
	}
	
	//change in distance affects distance of parts
	this.updateDistance = function(change) {
		scheduler.updateDistance(this, change);
		for (var i = 0; i < parts.length; i++) {
			parts[i].distance.relativeUpdate(change);
		}
	}
	
	//change in reverb affects reverb of parts
	this.updateReverb = function(change) {
		scheduler.updateReverb(this, change);
		for (var i = 0; i < parts.length; i++) {
			parts[i].reverb.relativeUpdate(change);
		}
	}
	
	//change in segment affects only segment of parts if any
	this.updateSegmentIndex = function(value) {
		var start = segmentation[value];
		var end = segmentation[value+1];
		//scheduler.updateSegment(this, segmentStart, segmentEnd);
		for (var i = 0; i < parts.length; i++) {
			parts[i].jumpToSegment(start);
		}
	}
	
	this.jumpToSegment = function(time) {
		if (segmentation.length == 0) {
			return true;
		} else {
			var index = segmentation.indexOf(time);
			if (index >= 0) {
				this.segmentIndex.update(undefined, index);
				//ADJUST PARTS!!!!!
				return true;
			}
		}
		return false;
	}
	
	this.updatePlayingDmos = function(dmo) {
		manager.updatePlayingDmos(dmo);
	}
	
	this.getNextSegment = function() {
		if (parts.length > 0) {
			isPlaying = true;
			while (partsPlayed < parts.length) {
				var nextSegment = parts[partsPlayed].getNextSegment();
				if (nextSegment) {
					return nextSegment;
				} else {
					partsPlayed++;
				}
			}
			//done playing
			partsPlayed = 0;
			isPlaying = false;
			return null;
		} else {
			if (!isPlaying) {
				isPlaying = true;
				return [segmentStart, segmentDuration, this];
			} else {
				isPlaying = false;
				return null;
			}
		}
		
		/*var index = this.segmentIndex.value;
		if (index == previousIndex || previousIndex == null) {
			index = this.segmentIndex.requestValue();
		}
		previousIndex = index;
		
		var start = segmentation[index];
		var duration = segmentation[index+1]-start;
		
		//try to adjust parent segmentation
		if (parentDMO.jumpToSegment(start)) {
			segmentsPlayed = 0;
		}
		//console.log(sourcePath, index, segmentation.length);
		if (segmentsPlayed < this.segmentCount.value) {
			duration *= this.segmentDurationRatio.value;
			if (!skipProportionAdjustment) {
				duration *= this.segmentProportion.value;
			}
			skipProportionAdjustment = !skipProportionAdjustment;
			if (start >= 0) {
				segmentsPlayed++;
				if (duration > 0) {
					//console.log(segmentsPlayed, this.segmentCount.value, [start, duration]);
					return [start, duration];
				} else {
					return this.getNextSegment();
				}
			} else {
				return [0, undefined];
			}
		} else {
			return this.getNextSegment();
		}*/
	}
	
	this.play = new Parameter(this, this.updatePlay, 0, true);
	this.amplitude = new Parameter(this, this.updateAmplitude, 1);
	this.playbackRate = new Parameter(this, this.updatePlaybackRate, 1);
	this.pan = new Parameter(this, this.updatePan, 0);
	this.distance = new Parameter(this, this.updateDistance, 0);
	this.reverb = new Parameter(this, this.updateReverb, 0);
	this.segmentIndex = new Parameter(this, this.updateSegmentIndex, 0, true, true);
	this.segmentDurationRatio = new Parameter(this, undefined, 1, false, true);
	this.segmentProportion = new Parameter(this, undefined, 1, false, true);
	this.segmentCount = new Parameter(this, undefined, 4, true, true);
	
}