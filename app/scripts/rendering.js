function Rendering() {
	
	var self = this;
	
	this.mappings = [];
	
	this.addFeatureMapping = function(dmo, feature, mappingFunction, parameter, level) {
		for (var i = 0; i < dmo.graph.nodes.length; i++) {
			var currentDmo = dmo.getRealDmo(dmo.graph.nodes[i]);
			if (isNaN(level) || currentDmo.getLevel() == level) {
				var value = mappingFunction(currentDmo.getFeature(feature.name));
				if (parameter.name == "Amplitude") {
					currentDmo.amplitude.update(undefined, value);
				} else if (parameter.name == "Pan") {
					currentDmo.pan.update(undefined, value);
				} else if (parameter.name == "Distance") {
					currentDmo.distance.update(undefined, value);
				} else if (parameter.name == "PlaybackRate") {
					currentDmo.playbackRate.update(undefined, value);
				} else if (parameter.name == "Reverb") {
					currentDmo.reverb.update(undefined, value);
				} else if (parameter.name == "DurationRatio") {
					currentDmo.durationRatio.update(undefined, value);
				} else if (parameter.name == "PartCount") {
					currentDmo.partCount.update(undefined, value);
				} else if (parameter.name == "PartOrder") {
					currentDmo.updatePartOrder(feature.name);
				}/* else if (parameter.name == "PartIndex") {
					currentDmo.partIndex.update(undefined, feature.name);
				}*/
			}
		}
	}
	
	this.addControlMapping = function(control, mappingFunction, parameter) {
	}

}
