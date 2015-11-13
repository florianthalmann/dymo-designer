(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('DmoController', ['$scope', '$http', function($scope, $http){
			
			var audioFilesDir = 'audio/';
			var featureFilesDir = 'features/';
			
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			$scope.audioContext = new AudioContext();
			
			$scope.labelCondition = '1';
			$scope.featureLoadingThreads = 0;
			
			$scope.scheduler = new Scheduler($scope.audioContext, sourcesReadyCallback, onPlaybackChange);
			$scope.dmo = new DmoManager($scope.scheduler, $scope, $http);
			
			$scope.featureModes = [{name:"mean"}, {name:"median"}, {name:"first"}];
			$scope.views = [{name:"Dymo Axes"}, {name:"Dymo Graph"}, {name:"Similarity Graph"}];
			$scope.selectedView = $scope.views[0];
			$scope.viewConfig = {xAxis:createConfig("x-axis"), yAxis:createConfig("y-axis"), size:createConfig("size"), color:createConfig("color")};
			function createConfig(name) {
				return {name:name, param:$scope.dmo.features[1], log:false};
			}
			
			var maxDepth = 0;
			
			$http.get('getsourcefilesindir/', {params:{directory:audioFilesDir}}).success(function(data) {
				$scope.sourceFiles = data;
				$scope.selectedSource = data[0];
				$scope.sourceSelected();
			});
			
			$scope.sourceSelected = function() {
				$scope.scheduler.addSourceFile($scope.getFullSourcePath());
				$http.get('getfeaturefiles/', {params:{source:$scope.selectedSource}}).success(function(data) {
					$scope.featureFiles = data;
					$scope.selectedFeature = data[0];
				});
			}
			
			function sourcesReadyCallback() {
				$scope.sourcesReady = true;
				$scope.$apply();
			}
			
			function onPlaybackChange() {
				setTimeout(function() {
					$scope.$apply();
				}, 10);
			}
			
			$scope.getFullSourcePath = function() {
				return audioFilesDir + $scope.selectedSource;
			}
			
			$scope.dmoOnClick = function(dmo){
				if ($scope.selectedDmo != dmo) {
					$scope.selectedDmo = dmo;
					playDmo($scope.dmo.getRealDmo(dmo));
				} else {
					$scope.selectedDmo = null;
					stopDmo($scope.dmo.getRealDmo(dmo));
				}
				$scope.$apply();
			};
			
			$scope.loadFeature = function() {
				new FeatureLoader($scope, $http).loadFeature(featureFilesDir + $scope.selectedFeature, $scope.labelCondition, $scope.dmo);
			}
			
			$scope.save = function() {
				new DymoWriter($http).writeDymoToJson($scope.dmo.dymo.toJsonHierarchy(), $scope.dymoPath);
			}
			
			$scope.play = function() {
				playDmo($scope.dmo.dymo);
			}
			
			$scope.stop = function() {
				stopDmo($scope.dmo.dymo);
			}
			
			function playDmo(dmo) {
				if (dmo) {
					$scope.scheduler.play(dmo);
				}
			}
			
			function stopDmo(dmo) {
				if (dmo) {
					$scope.scheduler.stop(dmo);
				}
			}
			
		}]);

}());
