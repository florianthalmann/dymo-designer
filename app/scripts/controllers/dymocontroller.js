(function () {
	'use strict';

	angular.module('dymoDesigner.controllers')
		.controller('DymoController', ['$scope', '$http', function($scope, $http){
			
			var inputDir = 'input/';
			
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			$scope.audioContext = new AudioContext();
			
			$scope.featureLoadingThreads = 0;
			
			$scope.store = new DymoStore();
			$scope.manager = new DymoManager($scope.audioContext);
			$scope.generator = new DymoGenerator($scope.store, adjustViewConfig, onGraphsChanged);
			
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
			
			function addDymo(directory, sourceFile, featureFiles, callback) {
				var orderedFiles = [];
				var subsetConditions = [];
				for (var i = 0; i < $scope.availableFeatures.length; i++) {
					if ($scope.availableFeatures[i].selected) {
						var currentFeatureFile = featureFiles.filter(function(f){return f.indexOf($scope.availableFeatures[i].name) >= 0;});
						orderedFiles.push(currentFeatureFile);
						subsetConditions.push($scope.availableFeatures[i].subset);
					}
				}
				orderedFiles = orderedFiles.map(function(f){return directory+f});
				DymoTemplates.createSingleSourceDymoFromFeatures($scope.generator, directory+sourceFile, orderedFiles, subsetConditions, function() {
					callback();
				});
			}
			
			$scope.fileDropped = function(file) {
				postAudioFile(file, function() {
					var directory = 'input/'+file.name.replace(/\./g,'_')+'/'; 
					//var directory = 'input/25435__insinger__free-jazz-text_wav/'
					$http.get('getfeaturefilesindir/', {params:{directory:directory}}).success(function(featureFiles) {
						addDymo(directory, file.name, featureFiles, function() {
							$scope.manager.loadDymoAndRenderingFromStore($scope.store, function() {
								console.log("DONE")
							});
						})
					});
				});
			}
			
			/* TEST
			var directory = 'input/25435__insinger__free-jazz-text_wav/'
			Benchmarker.startTask("getFiles")
			$http.get('getfeaturefilesindir/', {params:{directory:directory}}).success(function(data) {
				var beatFeature = data.filter(function(f){return f.indexOf('beat') >= 0;});
				var otherFeatures = data.filter(function(f){return f.indexOf('beat') < 0;});
				var features = beatFeature.concat(otherFeatures);
				features = features.map(function(f){return directory+f});
				DymoTemplates.createAnnotatedBarAndBeatDymo($scope.generator, features, function() {
					//console.log($scope.generator.getDymoGraph())
				});
			});*/
			
			$scope.addDymo = function() {
				/*var selectedSourceName = $scope.selectedSource.split('.')[0];
				var uris = [];
				uris[0] = featureFilesDir + selectedSourceName + '_barbeat.json';
				uris[1] = featureFilesDir + selectedSourceName + '_amplitude.json';
				uris[2] = featureFilesDir + selectedSourceName + '_centroid.json';
				$scope.generator.setCondensationMode($scope.selectedFeatureMode.name);
				$scope.generator.setCurrentSourcePath($scope.selectedSource);
				DymoTemplates.createAnnotatedBarAndBeatDymo($scope.generator, uris, $scope, $http);*/
				
				//DymoTemplates.createDeadheadDymo($scope.generator, $scope, $http);
				
				var parentUri = $scope.generator.addDymo();
				var childUri = $scope.generator.addDymo(parentUri);
				$scope.generator.setDymoFeature(childUri, ONSET_FEATURE, 2);
				
				//DymoTemplates.createGratefulDeadDymos($scope.generator, $scope, $http);
				//DymoTemplates.loadAndSaveMultipleDeadDymos($scope.generator, ['app/features/gd_test/Candyman/_studio/'], 0, $http);
				
				//DymoTemplates.createSebastianDymo3($scope.generator, $http);
			}
			
			$scope.loadDymo = function() {
				var dymoUri = 'features/gd_equal_similarity2/gd88-10-21.aud.ford-bryson.31108.sbeok.flacf.dymo.json';
				$scope.manager.loadDymoFromJson(dymoUri, function(loadedDymo) {
					$scope.generator.setDymo(loadedDymo);
					$scope.$apply();
					console.log("dymo loaded");
				}, function() {
					console.log("audio loaded");
				});
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
					$scope.manager.startPlayingUri(CONTEXT_URI+dymo["@id"]);
				} else {
					$scope.selectedDymo = null;
					$scope.manager.stopPlayingUri(CONTEXT_URI+dymo["@id"]);
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
				Benchmarker.startTask("graphsChanged")
				$scope.dymoGraph = $scope.generator.getDymoGraph();
				$scope.similarityGraph = $scope.generator.getSimilarityGraph();
				console.log($scope.dymoGraph)
				setTimeout(function() {
					$scope.$apply();
					Benchmarker.print()
				}, 10);
			}
			
			function onPlaybackChange() {
				$scope.urisOfPlayingDymos = scheduler.getUrisOfPlayingDymos();
				setTimeout(function() {
					$scope.$apply();
				}, 10);
			}
			
			function adjustViewConfig(newFeature) {
				if ($scope.generator) {
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
			}
			
			function postAudioFile(file, callback) {
				var request = new XMLHttpRequest();
				var formData = new FormData();
				formData.append('uploads[]', file, file.name);
				//console.log(formData)
				request.open('POST', 'postAudioFile', true);
				request.onload = function() {
					console.log(this.responseText);
					if (callback) {
						callback(this.responseText);
					}
				};
				request.error = function(e){
					console.log(e);
				};
				request.send(formData);
			}
			
		}]);

}());
