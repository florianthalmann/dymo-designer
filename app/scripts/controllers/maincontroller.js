(function () {
	'use strict';

	angular.module('dymoDesigner.controllers')
		.controller('MainController', ['$scope', '$http', 'ngDialog', function($scope, $http, ngDialog) {
			
			$scope.dymoPath = '/save/test/';
			$scope.activities = [{name:"Features"}, {name:"Mappings"}, {name:"View"}];
			
			$scope.views = [{name:"Dymo Axes"}, {name:"Dymo Blocks"}, {name:"Dymo Arches"}, {name:"Dymo Graph"}, {name:"Similarity Graph"}, {name: "Mappings"}];
			$scope.selectedView = $scope.views[0];
			
			$scope.availableFeatures = [
				{name:'bars', plugin:'vamp:qm-vamp-plugins:qm-barbeattracker:beats', subset:'1', selected:false},
				{name:'beats', plugin:'vamp:qm-vamp-plugins:qm-barbeattracker:beats', selected:false},
				{name:'onsets', plugin:'vamp:qm-vamp-plugins:qm-onsetdetector:onsets', selected:false},
				{name:'amplitude', plugin:'vamp:vamp-example-plugins:amplitudefollower:amplitude', selected:true},
				//{name:'chroma', plugin:'vamp:qm-vamp-plugins:qm-chromagram:chromagram', selected:true},
				{name:'logcentroid', plugin:'vamp:vamp-example-plugins:spectralcentroid:logcentroid', selected:true},
				//{name:'mfcc', plugin:'vamp:qm-vamp-plugins:qm-mfcc:coefficients', selected:true},
				{name:'melody', plugin:'vamp:mtg-melodia:melodia:melody', selected:false},
				{name:'pitch', plugin:'vamp:vamp-aubio:aubiopitch:frequency', selected:false}
			];
			
			$scope.showFeatureDialog = function () {
				ngDialog.open({ template: '<div>\
					<h1>Select Features</h1>\
					<div ng-repeat="f in availableFeatures">\
						{{f.name}}\
						<input type="checkbox" ng-model="f.selected" ng-change="updateSelectedFeatures()"></input>\
					</div>\
				</div>',
				plain:true, 
				scope:$scope});
			};
			
			$scope.updateSelectedFeatures = function() {
				var selectedFeatures = $scope.availableFeatures.filter(function(f){return f.selected;});
				$http.post('setFeatureSelection/', JSON.stringify(selectedFeatures)).success(function(response) {
					console.log(response);
				});
				//console.log($scope.availableFeatures.filter(function(f){return f.selected;}).map(function(f){return f.name}));
			}
			
			$scope.areas = [];//[[{0:100,1:100},{0:200,1:200},{0:200,1:100},{0:100,1:100}]];
			var currentAreaId = 0;
			
			$scope.addPointToArea = function(point) {
				if (!$scope.areas[currentAreaId]) {
					$scope.areas[currentAreaId] = [{0:point[0],1:point[1]}];
				}
				$scope.areas[currentAreaId].push({0:point[0],1:point[1]});
				$scope.$apply();
			}
			
			$scope.finishArea = function() {
				if ($scope.areas[currentAreaId].length > 0) {
					$scope.areas[currentAreaId].push($scope.areas[currentAreaId][0]);
					currentAreaId++;
					$scope.$apply();
				}
			}
			
			$scope.areaOnClick = function(area){
				console.log(area);
			}
			
			//INIT
			$scope.updateSelectedFeatures();
			
		}]);

}());
