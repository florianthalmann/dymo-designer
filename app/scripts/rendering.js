function Rendering() {
	
	var self = this;
	
	this.mappings = [];
	
	this.addFeatureMapping = function(dmo, feature, mappingFunction, parameter) {
		for (var i = 0; i < dmo.graph.nodes.length; i++) {
			var currentDmo = dmo.getRealDmo(dmo.graph.nodes[i]);
			currentDmo.amplitude.update(undefined, mappingFunction(currentDmo.getFeature(feature.name)));
		}
	}
	
	this.addControlMapping = function(control, mappingFunction, parameter) {
	}

}
