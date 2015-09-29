(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('DmoController', ['$scope', '$http', function($scope, $http){
			
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			$scope.audioContext = new AudioContext();
			
			$scope.sourceFile = 'audio/sheago.mp3';
			$scope.featureFile = 'features/sheago_barbeat.json';
			$scope.labelCondition = '1';
			$scope.featureLoadingThreads = 0;
			
			$scope.views = [{name:"DMO Axes"}, {name:"DMO Graph"}];
			
			$scope.scheduler = new Scheduler($scope);
			$scope.scheduler.addSourceFile($scope.sourceFile);
			$scope.dmo = new DmoManager($scope.scheduler, $scope);
			
			var maxDepth = 0;
			
			$scope.dmoOnClick = function(dmo){
				$scope.selectedDmo = dmo;
				$scope.$apply();
			};
			
			$scope.addChildrenFromFeatures = function() {
				new FeatureLoader($scope, $http).loadFeature($scope.featureFile, $scope.labelCondition, $scope.dmo);
			}
			
			$scope.play = function() {
				var dmo = $scope.dmo.getRealTopDmo();
				if (dmo) {
					dmo.setSourcePath($scope.sourceFile);
					$scope.scheduler.play(dmo);
				}
			}
			
			$scope.stop = function() {
				var dmo = $scope.dmo.getRealTopDmo();
				if (dmo) {
					$scope.scheduler.stop(dmo);
				}
			}
			
		}]);

}());
