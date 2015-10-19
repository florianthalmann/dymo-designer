(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('DmoController', ['$scope', '$http', function($scope, $http){
			
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			$scope.audioContext = new AudioContext();
			
			$scope.labelCondition = '1';
			$scope.featureLoadingThreads = 0;
			
			$scope.scheduler = new Scheduler($scope.audioContext, sourcesReadyCallback, onPlaybackChange);
			$scope.dmo = new DmoManager($scope.scheduler, $scope);
			
			$scope.activities = [{name:"Features"}, {name:"Mappings"}, {name:"View"}];
			$scope.featureModes = [{name:"mean"}, {name:"median"}, {name:"first"}];
			$scope.views = [{name:"DMO Axes"}, {name:"DMO Graph"}];
			$scope.selectedView = $scope.views[0];
			$scope.viewConfig = {xAxis:createConfig("x-axis"), yAxis:createConfig("y-axis"), size:createConfig("size"), color:createConfig("color")};
			function createConfig(name) {
				return {name:name, param:$scope.dmo.features[1], log:false};
			}
			
			var maxDepth = 0;
			
			$http.get('getsourcefiles/').success(function(data) {
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
				return 'audio/' + $scope.selectedSource;
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
				new FeatureLoader($scope, $http).loadFeature('features/' + $scope.selectedFeature, $scope.labelCondition, $scope.dmo);
			}
			
			$scope.save = function() {
				new DymoWriter($http).writeDymoToJson($scope.dmo.getTopDmo(), $scope.dymoPath);
			}
			
			$scope.play = function() {
				playDmo($scope.dmo.getRealTopDmo());
			}
			
			$scope.stop = function() {
				stopDmo($scope.dmo.getRealTopDmo());
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
