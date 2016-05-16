(function () {
	'use strict';

	angular.module('dymoDesigner.controllers')
		.controller('DymoController', ['$scope', '$http', function($scope, $http){
			
			var inputDir = 'input/';
			
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			$scope.audioContext = new AudioContext();
			
			$scope.labelCondition = '1';
			$scope.featureLoadingThreads = 0;
			
			$scope.scheduler = new Scheduler($scope.audioContext, sourcesReadyCallback, onPlaybackChange);
			//$scope.scheduler.setDymoBasePath(audioFilesDir);
			$scope.generator = new DymoGenerator($scope.scheduler, adjustViewConfig, onGraphsChanged);
			
			$scope.featureModes = [{name:MEAN}, {name:MEDIAN}, {name:FIRST}];
			
			$scope.viewConfig = {xAxis:createConfig("x-axis"), yAxis:createConfig("y-axis"), size:createConfig("size"), color:createConfig("color")};
			function createConfig(name) {
				return {name:name, param:$scope.generator.getFeatures()[1], log:false};
			}
			
			var maxDepth = 0;
			
			$scope.dymoGraph = {"nodes":[], "links":[]};
			$scope.similarityGraph = {"nodes":[], "links":[]};
			$scope.urisOfPlayingDymos = [];
			
			$http.get('getfoldersindir/', {params:{directory:inputDir}}).success(function(folders) {
				$scope.inputFolders = folders;
				$scope.selectedFolder = folders[0];
				$scope.sourceSelected();
			});
			
			$scope.sourceSelected = function() {
				//$scope.scheduler.addSourceFile($scope.selectedSource);
				if ($scope.generator.getDymoGraph().nodes.length > 0) {
					$scope.generator.setAudioFileChanged();
				}
				$http.get('getfeaturefilesindir/', {params:{directory:inputDir+$scope.selectedFolder}}).success(function(data) {
					$scope.featureFiles = data;
					$scope.selectedFeature = data[0];
				});
			}
			
			function sourcesReadyCallback() {
				$scope.sourcesReady = true;
				$scope.$apply();
			}
			
			$scope.addDymo = function() {
				/*var selectedSourceName = $scope.selectedSource.split('.')[0];
				var uris = [];
				uris[0] = featureFilesDir + selectedSourceName + '_barbeat.json';
				uris[1] = featureFilesDir + selectedSourceName + '_amplitude.json';
				uris[2] = featureFilesDir + selectedSourceName + '_centroid.json';
				$scope.generator.setCondensationMode($scope.selectedFeatureMode.name);
				$scope.generator.setCurrentSourcePath($scope.selectedSource);
				DymoTemplates.createAnnotatedBarAndBeatDymo($scope.generator, uris, $scope, $http);*/
				
				DymoTemplates.createDeadheadDymo($scope.generator, $scope, $http);
				//DymoTemplates.createGratefulDeadDymos($scope.generator, $scope, $http);
				//DymoTemplates.loadAndSaveMultipleDeadDymos($scope.generator, ['app/features/gd_test/Candyman/_studio/'], 0, $http);
				
				//DymoTemplates.createSebastianDymo3($scope.generator, $http);
			}
			
			$scope.loadDymo = function() {
				var loader = new DymoLoader($scope.scheduler, $scope, $http);
				loader.loadDymoFromJson('features/gd_equal_similarity2/', 'gd88-10-21.aud.ford-bryson.31108.sbeok.flacf.dymo.json', function(loadedDymo) {
					$scope.generator.setDymo(loadedDymo[0]);
					$scope.$apply();
				}, $http);
			}
			
			$scope.createAreasDemo = function(areas) {
				DymoTemplates.createAreasDemo($scope.generator, areas);
			}
			
			//TODO delegate to dymo-generator
			$scope.loadFeature = function() {
				$scope.generator.setCondensationMode($scope.selectedFeatureMode.name);
				$scope.generator.setCurrentSourcePath(inputDir+$scope.selectedFolder);
				new FeatureLoader($scope, $http).loadFeature(inputDir+$scope.selectedFolder+'/' + $scope.selectedFeature, $scope.labelCondition, $scope.generator, function() {
					
				});
			}
			
			$scope.save = function() {
				new DymoWriter($http).writeDymoToJson($scope.generator.dymo.toJsonHierarchy(), $scope.dymoPath);
			}
			
			$scope.play = function() {
				playDymo($scope.generator.dymo);
			}
			
			$scope.stop = function() {
				stopDymo($scope.generator.dymo);
			}
			
			$scope.dymoOnClick = function(dymo){
				if ($scope.selectedDymo != dymo) {
					$scope.selectedDymo = dymo;
					playDymo($scope.generator.getRealDymo(dymo));
				} else {
					$scope.selectedDymo = null;
					stopDymo($scope.generator.getRealDymo(dymo));
				}
				$scope.$apply();
			}
			
			function playDymo(dymo) {
				if (dymo) {
					$scope.scheduler.play(dymo);
				}
			}
			
			function stopDymo(dymo) {
				if (dymo) {
					$scope.scheduler.stop(dymo);
				}
			}
			
			function onGraphsChanged() {
				$scope.dymoGraph = $scope.generator.getDymoGraph();
				$scope.similarityGraph = $scope.generator.getSimilarityGraph();
				setTimeout(function() {
					$scope.$apply();
				}, 10);
			}
			
			function onPlaybackChange() {
				$scope.urisOfPlayingDymos = scheduler.getUrisOfPlayingDymos();
				setTimeout(function() {
					$scope.$apply();
				}, 10);
			}
			
			function adjustViewConfig(newFeature) {
				$scope.features = $scope.generator.getFeatures();
				if ($scope.features.length-2 == 1) {
					$scope.viewConfig.xAxis.param = newFeature;
				} else if ($scope.features.length-2 == 2) {
					$scope.viewConfig.yAxis.param = newFeature;
				} else if ($scope.features.length-2 == 3) {
					$scope.viewConfig.size.param = newFeature;
				} else if ($scope.features.length-2 == 4) {
					$scope.viewConfig.color.param = newFeature;
				}
			}
			
		}]);

}());
