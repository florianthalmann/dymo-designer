function Source(dmo, audioContext, buffer, reverbSend) {
	
	var self = this;
	
	var FADE_LENGTH = 0.05; //seconds
	
	var startTime, endTime, currentPausePosition = 0;
	var isPlaying, isPaused;
	var timeoutID;
	
	var dryGain = audioContext.createGain();
	dryGain.connect(audioContext.destination);
	var reverbGain = audioContext.createGain();
	reverbGain.connect(reverbSend);
	reverbGain.gain.value = 0;
	var panner = audioContext.createPanner();
	panner.connect(dryGain);
	panner.connect(reverbGain);
	
	var time = dmo.getFeature("time");
	var duration = dmo.getFeature("duration");
	if (!duration) {
		duration = buffer.duration-time;
	}
	if (time != 0 || duration != buffer.duration) {
		//add time for fade after source officially done
		buffer = getSubBuffer(buffer, toSamples(time, buffer), toSamples(duration+FADE_LENGTH, buffer));
	}
	
	var source = audioContext.createBufferSource();
	source.connect(panner);
	source.buffer = buffer;
	
	var currentAmplitude = dmo.amplitude.value;
	updateAmplitude();
	var currentPlaybackRate = dmo.playbackRate.value;
	updatePlaybackRate();
	var currentPannerPosition = [dmo.pan.value, 0, dmo.distance.value];
	updatePosition();
	var currentReverb = dmo.reverb.value;
	updateReverb();
	
	
	this.getDmo = function() {
		return dmo;
	}
	
	this.getDuration = function() {
		return duration;
	}
	
	this.play = function(startTime) {
		source.start(startTime, currentPausePosition);
		isPlaying = true;
	}
	
	this.pause = function() {
		if (isPlaying) {
			stopAndRemoveAudioSources();
			currentPausePosition += audioContext.currentTime - startTime;
			isPaused = true;
		} else if (isPaused) {
			isPaused = false;
			this.play();
		}
	}
	
	this.stop = function() {
		if (isPlaying) {
			stopAndRemoveAudioSources();
		}
		//even in case it is paused
		currentPausePosition = 0;
		/*for (var i = 0; i < this.segmentationParams.length; i++) {
			this.segmentationParams[i].reset();
		}*/
	}
	
	function stopAndRemoveAudioSources() {
		window.clearTimeout(timeoutID);
		isPlaying = false;
		source.stop(0);
		dmo.updatePlayingDmos(null);
	}
	
	function updateAmplitude() {
		if (currentAmplitude > 0) {
			dryGain.gain.value = currentAmplitude;
		} else {
			dryGain.gain.value = 0;
		}
	}
	
	function updatePosition() {
		if (currentPannerPosition[2] == 0) {
			z = -0.01; //for chrome :( source not audible at z = 0
		} else {
			z = currentPannerPosition[2];
		}
		panner.setPosition(currentPannerPosition[0], currentPannerPosition[1], z);
	}
	
	function updatePlaybackRate() {
		source.playbackRate.value = currentPlaybackRate;
	}
	
	function updateReverb() {
		if (currentReverb > 0) {
			reverbGain.gain.value = currentReverb;
		} else {
			reverbGain.gain.value = 0;
		}
	}
	
	this.changeAmplitude = function(deltaAmplitude) {
		currentAmplitude += deltaAmplitude;
		updateAmplitude();
	}
	
	this.changePosition = function(deltaX, deltaY, deltaZ) {
		currentPannerPosition[0] += deltaX;
		currentPannerPosition[1] += deltaY;
		currentPannerPosition[2] += deltaZ;
		updatePosition();
	}
	
	this.changePlaybackRate = function(deltaRate) {
		currentPlaybackRate += deltaRate;
		updatePlaybackRate();
	}
	
	this.changeReverb = function(deltaReverb) {
		currentReverb += deltaReverb;
		updateReverb();
	}
	
	function toSamples(seconds, buffer) {
		if (seconds || seconds == 0) {
			return Math.round(seconds*buffer.sampleRate);
		}
	}
	
	function getSubBuffer(buffer, fromSample, durationInSamples) {
		var subBuffer = audioContext.createBuffer(buffer.numberOfChannels, durationInSamples, buffer.sampleRate);
		for (var i = 0; i < buffer.numberOfChannels; i++) {
			var currentCopyChannel = subBuffer.getChannelData(i);
			var currentOriginalChannel = buffer.getChannelData(i);
			for (var j = 0; j < durationInSamples; j++) {
				currentCopyChannel[j] = currentOriginalChannel[fromSample+j];
			}
			var fadeSamples = buffer.sampleRate*FADE_LENGTH;
			for (var j = 0.0; j < fadeSamples; j++) {
				currentCopyChannel[j] *= j/fadeSamples;
				currentCopyChannel[durationInSamples-j-1] *= j/fadeSamples;
			}
		}
		return subBuffer;
	}
	
}