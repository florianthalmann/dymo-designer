(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('DmoController', ['$scope', '$http', function($scope, $http){
			
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			$scope.audioContext = new AudioContext();
			
			$scope.sourceFile = 'audio/ligeti2.m4a';
			$scope.featureFile = 'features/ligeti2_onset.json';
			$scope.labelCondition = '1';
			$scope.featureLoadingThreads = 0;
			
			$scope.featureModes = [{name:"mean"}, {name:"median"}, {name:"first"}];
			$scope.views = [{name:"DMO Axes"}, {name:"DMO Graph"}];
			
			$scope.scheduler = new Scheduler($scope);
			$scope.scheduler.addSourceFile($scope.sourceFile);
			$scope.dmo = new DmoManager($scope.scheduler, $scope);
			
			var maxDepth = 0;
			
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
			
			$scope.addPartsFromFeatures = function() {
				new FeatureLoader($scope, $http).loadFeature($scope.featureFile, $scope.labelCondition, $scope.dmo);
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
