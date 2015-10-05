function Scheduler($scope) {
	
	var SCHEDULE_AHEAD_TIME = 0.1; //seconds
	
	var buffers = {};
	var sources = {};
	var nextSources = {};
	var endTimes = {};
	
	var convolverSend = $scope.audioContext.createConvolver();
	convolverSend.connect($scope.audioContext.destination);
	
	var numCurrentlyLoading = 0;
	
	//load reverb impulse response
	numCurrentlyLoading++;
	var audioLoader2 = new AudioSampleLoader();
	loadAudio("audio/impulse_rev.wav", audioLoader2, function() {
		convolverSend.buffer = audioLoader2.response;
		sourceReady();
	});
	
	this.addSourceFile = function(filePath) {
		numCurrentlyLoading++;
		var audioLoader = new AudioSampleLoader();
		loadAudio(filePath, audioLoader, function() {
			buffers[filePath] = audioLoader.response;
			sourceReady();
		});
	}
	
	function sourceReady() {
		numCurrentlyLoading--;
		if (numCurrentlyLoading == 0) {
			$scope.sourcesReady = true;
			$scope.$apply();
		}
	}
	
	this.play = function(dmo) {
		internalPlay(dmo);
	}
	
	function internalPlay(dmo) {
		var uri = dmo.getUri();
		if (!sources[uri]) {
			//initially create sources
			sources[uri] = createNextSource(dmo);
		} else {
			//switch source
			sources[uri] = nextSources[uri];
		}
		if (!endTimes[uri]) {
			delay = SCHEDULE_AHEAD_TIME;
		} else {
			delay = endTimes[uri]-$scope.audioContext.currentTime;
		}
		currentDmo = sources[uri].getDmo();
		var startTime = $scope.audioContext.currentTime+delay;
		sources[uri].play(startTime);//, currentPausePosition); //% audioSource.loopEnd-audioSource.loopStart);
		setTimeout(function() {
			dmo.updatePlayingDmos(currentDmo);
		}, delay);
		endTimes[uri] = startTime+sources[uri].getDuration();
		nextSources[uri] = createNextSource(dmo);
		if (nextSources[uri] && endTimes[uri]) {
			timeoutID = setTimeout(function() { internalPlay(dmo); }, (endTimes[uri]-$scope.audioContext.currentTime-SCHEDULE_AHEAD_TIME)*1000);
		} else {
			setTimeout(function() { dmo.updatePlayingDmos(null); }, (endTimes[uri]-$scope.audioContext.currentTime)*1000);
		}
	}
	
	this.pause = function(dmo) {
		var source = sources[dmo.getUri()];
		if (source) {
			source.pause();
		}
	}
	
	this.stop = function(dmo) {
		var source = sources[dmo.getUri()];
		if (source) {
			source.stop();
		}
	}
	
	this.updateAmplitude = function(dmo, change) {
		source = getSource(dmo);
		if (source) {
			source.changeAmplitude(change);
		}
	}
	
	this.updatePlaybackRate = function(dmo, change) {
		source = getSource(dmo);
		if (source) {
			source.changePlaybackRate(change);
		}
	}
	
	this.updatePan = function(dmo, change) {
		source = getSource(dmo);
		if (source) {
			source.changePosition(change, 0, 0);
		}
	}
	
	this.updateDistance = function(dmo, change) {
		source = getSource(dmo);
		if (source) {
			source.changePosition(0, 0, change);
		}
	}
	
	this.updateReverb = function(dmo, change) {
		source = getSource(dmo);
		if (source) {
			source.changeReverb(change);
		}
	}
	
	/*function getSource(dmo) {
		if (!sources[dmo.getUri()] && dmo.getSourcePath()) {
			//currently reverb works only for one channel on android :( send channel solves it
			sources[dmo.getUri()] = new Source($scope.audioContext, dmo, convolverSend);
		}
		return sources[dmo.getUri()];
	}
	
	function getNextSource(dmo) {
		return nextSources[dmo.getUri()];
	}*/
	
	function loadAudio(path, audioLoader, onload) {
		audioLoader.src = path;
		audioLoader.ctx = $scope.audioContext;
		audioLoader.onload = onload;
		audioLoader.onerror = function() {
			console.log("Error loading audio");
		};
		audioLoader.send();
	}
	
	function createNextSource(dmo) {
		nextPart = dmo.getNextPart();
		if (nextPart) {
			var buffer = buffers[dmo.getSourcePath()];
			return new Source(nextPart, $scope.audioContext, buffer, convolverSend);
		}
	}
	
}