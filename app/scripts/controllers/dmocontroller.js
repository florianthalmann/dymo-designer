(function () {
	'use strict';

	angular.module('dmoDesigner.controllers')
		.controller('DmoController', ['$scope', '$http', function($scope, $http){
			
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			$scope.audioContext = new AudioContext();
			
			$scope.labelCondition = '1';
			$scope.featureLoadingThreads = 0;
			
			$scope.featureModes = [{name:"mean"}, {name:"median"}, {name:"first"}];
			$scope.views = [{name:"DMO Axes"}, {name:"DMO Graph"}];
			
			$scope.scheduler = new Scheduler($scope);
			$scope.dmo = new DmoManager($scope.scheduler, $scope);
			
			var maxDepth = 0;
			
			$http.get('getsourcefiles/').success(function(data) {
				$scope.sourceFiles = data;
			});
			
			$scope.sourceSelected = function() {
				$scope.scheduler.addSourceFile($scope.getFullSourcePath());
				$http.get('getfeaturefiles/', {params:{source:$scope.selectedSource}}).success(function(data) {
					$scope.featureFiles = data;
				});
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
