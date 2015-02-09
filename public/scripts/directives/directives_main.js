MeNowApp.directive('mainNav', function(){
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'views/mainnav.html'
    };
});

MeNowApp.directive('userInfo', function(){
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'views/userinfo.html'
    };
});

MeNowApp.directive('actionDropDown', function(){
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'views/actions.html',
        controller: function($scope, $stateParams, apiService, socket) {
        	$scope.onActionClick=function(action, gid) {
				console.log('new action click: ' + action);
				console.log('group id: ' + gid);
				$scope.group.message = $scope.actionMessage;
				$scope.group.action = action;
				$scope.activeAction = false;

				console.log($scope.actionMessage);

				apiService.req('groups', action, gid, $scope.actionMessage).success(function(data){
						
						console.log(data);
                        // need array of all contacts in the group - cid is array in change group on server.js
                        socket.emit('changeGroup', { uid: $scope.group.user_id, cida: $scope.group.contacts, action: action, message: $scope.actionMessage });

						
				});
			}

            
        }
    };
});