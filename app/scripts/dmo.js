function Dmo(dmoPath, $scope, $interval) {


			$scope.dmo = null;
			$scope.dmoGraph = {nodes:[], links:[]};
			$scope.dmoList = [];
			
			$scope.dmoOnClick = function(dmo){
				$scope.selectedDmo = dmo;
				$scope.$apply();
			};
			
			$scope.addDmo = function() {
				var newDmo = createNewDmo();
				$scope.dmoList.push(newDmo);
				$scope.dmoGraph.nodes.push(newDmo);
				//set as top-level dmo if none exists
				if ($scope.dmo == null) {
					$scope.dmo = newDmo;
				//add as child if one exists
				} else {
					$scope.dmo.children.push(newDmo);
					$scope.dmoGraph.links.push({"source":parseInt(0),"target":parseInt($scope.dmoList.length-1),"value":1});
				}
				console.log($scope.dmoGraph);
			}
			
			addChildDmo = function(dmo) {
				var newDmo = createNewDmo();
				dmo.children.push();
				$scope.dmoList.push(newDmo);
				$scope.dmoGraph.nodes.push(newDmo);
			}
			
			$scope.addChildrenFromFeatures = function() {
				var newDmo = createNewDmo();
				dmo.children.push();
				new OntologyLoader().loadSegmentation($scope.featureFile);
				$scope.selectedDmo.children.push(newDmo);
				$scope.dmoList.push(newDmo);
				$scope.dmoGraph.nodes.push(newDmo);
			}
			
			function createNewDmo() {
				return {
					name: "dmo" + ($scope.dmoList.length+1),
					size: parseInt(Math.random()*200),
					children: []
				}
			}
			
		}]);

}());
