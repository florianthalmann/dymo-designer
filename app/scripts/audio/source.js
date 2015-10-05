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
	var currentAmplitude = 1;
	var currentPlaybackRate = 1;
	var currentPannerPosition = [0,0,-0.01];
	panner.setPosition(0,0,-0.01); //for chrome :(
	
	var currentReverb = 0;
	var currentAudioSubBuffer;
	var currentSourceDuration;
	var audioSource, nextAudioSource;
	var currentSegmentInfo;
	
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
	source.playbackRate.value = currentPlaybackRate;
	
	var audioBuffer = null;
	
	this.hasAudioBuffer = function() {
		return audioBuffer;
	};
	
	this.setAudioBuffer = function(buffer) {
		audioBuffer = buffer;
	};
	
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
		audioSource.stop(0);
		audioSource = null;
		nextAudioSource = null;
		endTime = null;
		currentSegmentInfo = null;
		dmo.updatePlayingDmos(null);
	}
	
	function setPosition(x, y, z) {
		currentPannerPosition = [x, y, z];
		panner.setPosition(x, y, z);
	}
	
	this.changePosition = function(deltaX, deltaY, deltaZ) {
		currentPannerPosition[0] += deltaX;
		currentPannerPosition[1] += deltaY;
		currentPannerPosition[2] += deltaZ;
		panner.setPosition(currentPannerPosition[0], currentPannerPosition[1], currentPannerPosition[2]);
	}
	
	this.changeAmplitude = function(deltaAmplitude) {
		currentAmplitude += deltaAmplitude;
		if (currentAmplitude > 0) {
			dryGain.gain.value += deltaAmplitude;
		} else {
			dryGain.gain.value = 0;
		}
	}
	
	this.changePlaybackRate = function(deltaRate) {
		currentPlaybackRate += deltaRate;
		if (audioSource) {
			audioSource.playbackRate.value = currentPlaybackRate;
		}
		if (nextAudioSource) {
			nextAudioSource.playbackRate.value = currentPlaybackRate;
		}
	}
	
	this.changeReverb = function(deltaReverb) {
		currentReverb += deltaReverb;
		if (currentReverb > 0) {
			reverbGain.gain.value += deltaReverb;
		} else {
			reverbGain.gain.value = 0;
		}
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